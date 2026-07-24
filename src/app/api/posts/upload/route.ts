import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaAttachments } from "@/lib/prismaAttachments";
import { supabasePostsAdmin } from "@/lib/supabasePosts";
import { touchUserPresence } from "@/lib/presence";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB
const MAX_VIDEO_BYTES = 45 * 1024 * 1024; // 45MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabasePostsAdmin) {
      return NextResponse.json(
        { error: "Supabase posts admin client not configured" },
        { status: 500 },
      );
    }

    const bucket = process.env.SUPABASE_POSTS_BUCKET;
    const imagesPrefix = process.env.SUPABASE_POSTS_IMAGES_PREFIX || "image post";
    const videosPrefix = process.env.SUPABASE_POSTS_VIDEOS_PREFIX || "video posts";

    if (!bucket) {
      return NextResponse.json(
        { error: "SUPABASE_POSTS_BUCKET is not set" },
        { status: 500 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body: {
        requestSignedUrl?: boolean;
        kind?: "image" | "video";
        filename?: string;
        mimeType?: string;
        size?: number;
      } = await request.json();

      if (body.requestSignedUrl) {
        const kind = body.kind;
        const size = body.size;
        const originalName = body.filename || "upload";
        const mimeType = body.mimeType || "application/octet-stream";

        if (!kind || typeof kind !== "string" || !["image", "video"].includes(kind)) {
          return NextResponse.json(
            { error: "Invalid kind; must be 'image' or 'video'" },
            { status: 400 },
          );
        }

        if (typeof size !== "number" || size <= 0) {
          return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
        }

        if (kind === "video") {
          if (size > MAX_VIDEO_BYTES) {
            return NextResponse.json(
              { error: "Video too large (max 45MB)" },
              { status: 400 },
            );
          }
        } else {
          if (size > MAX_IMAGE_BYTES) {
            return NextResponse.json(
              { error: "Image too large (max 3MB)" },
              { status: 400 },
            );
          }
        }

        const ext = originalName.includes(".") ? originalName.split(".").pop() : undefined;
        const objectKeyBase = crypto.randomUUID();
        const objectKeyName = ext ? `${objectKeyBase}.${ext}` : objectKeyBase;
        const prefix = kind === "video" ? videosPrefix : imagesPrefix;
        const objectKey = `${prefix}/${objectKeyName}`;

        const signResult = await supabasePostsAdmin.storage
          .from(bucket)
          .createSignedUploadUrl(objectKey);

        if (signResult.error) {
          console.error("[posts/upload] Supabase sign upload URL error", signResult.error);
          return NextResponse.json(
            { error: signResult.error.message || "Failed to generate upload URL" },
            { status: 500 },
          );
        }

        const meId = (session.user as any).id as string;
        touchUserPresence(meId);

        const attachment = await prismaAttachments.attachment.create({
          data: {
            messageId: null,
            roomId: null,
            senderId: meId,
            postId: null,
            kind,
            bucket,
            objectKey,
            originalName,
            mimeType,
            sizeBytes: BigInt(size),
            status: "pending",
          },
          select: {
            id: true,
            kind: true,
            bucket: true,
            objectKey: true,
            originalName: true,
            mimeType: true,
            createdAt: true,
          },
        });

        await prismaAttachments.attachmentLog.create({
          data: {
            attachmentId: attachment.id,
            event: "prepare-upload",
          },
        });

        return NextResponse.json({
          signedUrl: signResult.data.signedUrl,
          token: signResult.data.token,
          attachment: {
            ...attachment,
            size,
          },
        });
      }
    }

    const formData = await request.formData();
    const kind = formData.get("kind"); // image | video
    const file = formData.get("file");

    if (!kind || typeof kind !== "string" || !["image", "video"].includes(kind)) {
      return NextResponse.json(
        { error: "Invalid kind; must be 'image' or 'video'" },
        { status: 400 },
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
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
      if (size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Image too large (max 3MB)" },
          { status: 400 },
        );
      }
    }

    const originalName = file.name || "upload";
    const ext = originalName.includes(".") ? originalName.split(".").pop() : undefined;
    const objectKeyBase = crypto.randomUUID();
    const objectKeyName = ext ? `${objectKeyBase}.${ext}` : objectKeyBase;

    const prefix = kind === "video" ? videosPrefix : imagesPrefix;
    const objectKey = `${prefix}/${objectKeyName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await supabasePostsAdmin.storage
      .from(bucket)
      .upload(objectKey, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadResult.error) {
      console.error("[posts/upload] Supabase upload error", uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error.message || "Failed to upload" },
        { status: 500 },
      );
    }

    const meId = (session.user as any).id as string;

    const attachment = await prismaAttachments.attachment.create({
      data: {
        messageId: null,
        roomId: null,
        senderId: meId,
        postId: null,
        kind,
        bucket,
        objectKey,
        originalName,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: BigInt(size),
        status: "uploaded",
      },
      select: {
        id: true,
        kind: true,
        bucket: true,
        objectKey: true,
        originalName: true,
        mimeType: true,
        createdAt: true,
      },
    });

    await prismaAttachments.attachmentLog.create({
      data: {
        attachmentId: attachment.id,
        event: "upload-post",
      },
    });

    return NextResponse.json({
      attachment: {
        ...attachment,
        size,
      },
    });
  } catch (err) {
    console.error("[posts/upload] Unhandled error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
