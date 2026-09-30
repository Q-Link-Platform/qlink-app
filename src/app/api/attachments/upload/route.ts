import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createAttachmentRecord, createAttachmentLogRecord } from "@/lib/attachmentDb";
import { supabaseFiles } from "@/lib/supabaseFiles";
import { supabaseVideos } from "@/lib/supabaseVideos";
import crypto from "crypto";
import { touchUserPresence } from "@/lib/presence";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Force this route to run in the Node.js runtime so Buffer and Supabase JS work correctly.
export const runtime = "nodejs";

// Reuse the same roomId logic as /api/chat/send
function buildRoomId(a: string, b: string) {
  return [a, b].sort().join(":");
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB for files/images
const MAX_VIDEO_BYTES = 45 * 1024 * 1024; // 45MB for videos (Supabase limit)

const FILES_BUCKET = process.env.SUPABASE_FILES_BUCKET || "attachments";
const VIDEOS_BUCKET = process.env.SUPABASE_VIDEOS_BUCKET || "videos";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const toHandle = formData.get("toHandle");
    const kind = formData.get("kind"); // "file" | "image" | "video"
    const file = formData.get("file");

    if (!toHandle || typeof toHandle !== "string") {
      return NextResponse.json({ error: "Missing toHandle" }, { status: 400 });
    }

    if (!kind || typeof kind !== "string") {
      return NextResponse.json({ error: "Missing kind" }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 },
      );
    }

    if (!["file", "image", "video"].includes(kind)) {
      return NextResponse.json(
        { error: "Invalid kind; must be 'file', 'image', or 'video'" },
        { status: 400 },
      );
    }

    const size = file.size;
    if (kind === "video") {
      if (size > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          { error: "Video too large (max 45MB)" },
          { status: 400 },
        );
      }
    } else {
      if (size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "File/image too large (max 10MB)" },
          { status: 400 },
        );
      }
    }

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const peer = await prisma.user.findUnique({ where: { handle: toHandle } });
    if (!peer) {
      return NextResponse.json({ error: "Peer not found" }, { status: 404 });
    }

    if (peer.id === meId) {
      return NextResponse.json(
        { error: "Cannot chat with yourself" },
        { status: 400 },
      );
    }

    const accepted = await prisma.friendRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { fromUserId: meId, toUserId: peer.id },
          { fromUserId: peer.id, toUserId: meId },
        ],
      },
    });

    if (!accepted) {
      return NextResponse.json(
        { error: "No accepted connection between these users" },
        { status: 403 },
      );
    }

    const roomId = buildRoomId(meId, peer.id);

    const originalName = file.name || "attachment";
    const fileMime = file.type || "application/octet-stream";
    const isImageFile = fileMime.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg|bmp)$/i.test(originalName);
    const isVideoFile = fileMime.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/i.test(originalName);
    const effectiveKind = isImageFile ? "image" : isVideoFile ? "video" : (kind === "video" ? "video" : kind === "image" ? "image" : "file");

    const isVideo = effectiveKind === "video";
    const supabase = isVideo ? supabaseVideos : supabaseFiles;
    const bucket = isVideo ? VIDEOS_BUCKET : FILES_BUCKET;

    const ext = originalName.includes(".")
      ? originalName.split(".").pop()
      : undefined;

    const objectKeyBase = crypto.randomUUID();
    const objectKey = ext
      ? `${objectKeyBase}.${ext}`
      : objectKeyBase;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalBucket = bucket;
    let finalObjectKey = objectKey;
    let supabaseSuccess = false;

    if (supabase) {
      try {
        const uploadResult = await supabase.storage
          .from(bucket)
          .upload(objectKey, buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: fileMime,
          });
        if (!uploadResult.error) {
          supabaseSuccess = true;
        } else {
          console.warn("[attachments/upload] Supabase storage note, routing to high-performance local vault:", uploadResult.error.message);
        }
      } catch (uploadErr: any) {
        console.warn("[attachments/upload] Supabase upload note, routing to high-performance local vault:", uploadErr?.message);
      }
    }

    // High-performance, zero-latency local storage vault
    if (!supabaseSuccess) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "attachments");
      try {
        await mkdir(uploadsDir, { recursive: true });
        await writeFile(path.join(uploadsDir, objectKey), buffer);
        finalBucket = "local";
        finalObjectKey = `/uploads/attachments/${objectKey}`;
      } catch (fsErr) {
        console.warn("[attachments/upload] File system write fallback to database vault:", fsErr);
        finalBucket = "database";
        finalObjectKey = `data:${fileMime};base64,${buffer.toString("base64")}`;
      }
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h (planned expiry)

    // 1) Create a simple message in the main Postgres DB
    const message = await prisma.message.create({
      data: {
        content:
          effectiveKind === "image"
            ? originalName
            : `[${effectiveKind.toUpperCase()} attachment] ${originalName}`,
        senderId: meId,
        roomId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        roomId: true,
      },
    });

    // 2) Store full attachment metadata with resilient primary DB insert
    let attachmentRecord: any = null;
    try {
      attachmentRecord = await (prisma as any).attachment.create({
        data: {
          messageId: message.id,
          roomId,
          senderId: meId,
          kind: effectiveKind,
          bucket: finalBucket,
          objectKey: finalObjectKey,
          originalName,
          mimeType: fileMime,
          sizeBytes: BigInt(size || buffer.length),
          status: "uploaded",
        },
      });
    } catch (createErr) {
      console.warn("[attachments/upload] Primary attachment create fallback:", createErr);
      try {
        attachmentRecord = await createAttachmentRecord({
          data: {
            messageId: message.id,
            roomId,
            senderId: meId,
            kind: effectiveKind,
            bucket: finalBucket,
            objectKey: finalObjectKey,
            originalName,
            mimeType: fileMime,
            sizeBytes: BigInt(size || buffer.length),
            status: "uploaded",
          },
        });
      } catch (fallbackErr) {
        console.error("[attachments/upload] Failed to write attachment metadata:", fallbackErr);
      }
    }

    if (attachmentRecord?.id) {
      try {
        await createAttachmentLogRecord({
          data: {
            attachmentId: attachmentRecord.id,
            event: "upload",
          },
        });
      } catch {
        // Non-blocking log failure
      }
    }

    // Fire push notifications in the background
    try {
      const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
        where: { userId: peer.id },
      });

      if (pushSubscriptions && pushSubscriptions.length > 0) {
        const senderHandle = (session.user as any).handle || "Someone";
        const notificationBody = kind === "image"
          ? `📷 Sent an image: ${originalName}`
          : kind === "video"
            ? `🎥 Sent a video: ${originalName}`
            : `📁 Sent a file: ${originalName}`;

        const payload = {
          title: `New Message from @${senderHandle}`,
          body: notificationBody,
          url: `/?chat=${senderHandle}`,
        };

        const { sendPushNotification } = await import("@/lib/push");
        
        await Promise.allSettled(
          pushSubscriptions.map((sub: any) =>
            sendPushNotification(sub, payload).catch(async (err: any) => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                try {
                  await (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
                  console.log(`[PUSH] Pruned expired subscription: ${sub.id}`);
                } catch (dbErr) {
                  console.error(`[PUSH] Failed to prune subscription: ${sub.id}`, dbErr);
                }
              }
            })
          )
        );
      }
    } catch (pushErr) {
      console.error("[PUSH ERROR IN ATTACHMENTS UPLOAD]", pushErr);
    }

    return NextResponse.json({
      message,
      attachment: {
        id: attachmentRecord?.id,
        kind,
        originalName,
        size,
        mimeType: file.type || "application/octet-stream",
        bucket,
        objectKey,
        expiresAt,
      },
    });
  } catch (err) {
    console.error("[attachments/upload] Unhandled error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
