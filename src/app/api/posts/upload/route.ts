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

/**
 * Helper to safely attempt Supabase signed upload URL with timeout and full error insulation.
 */
async function trySupabaseSignUpload(bucket: string, objectKey: string): Promise<{ signedUrl: string; token: string } | null> {
  if (!supabasePostsAdmin || !bucket) return null;
  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase sign timeout")), 2500)
    );
    const signPromise = supabasePostsAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(objectKey);

    const signResult: any = await Promise.race([signPromise, timeoutPromise]);
    if (signResult && !signResult.error && signResult.data?.signedUrl) {
      return {
        signedUrl: signResult.data.signedUrl,
        token: signResult.data.token,
      };
    }
    console.warn("[posts/upload] Supabase sign upload returned error, activating resilient vault:", signResult?.error?.message || "unknown");
    return null;
  } catch (err: any) {
    console.warn("[posts/upload] Supabase sign exception, activating resilient vault:", err?.message || err);
    return null;
  }
}

/**
 * Helper to safely attempt direct Supabase upload.
 */
async function trySupabaseUpload(bucket: string, objectKey: string, buffer: Uint8Array, contentType: string): Promise<boolean> {
  if (!supabasePostsAdmin || !bucket) return false;
  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase upload timeout")), 4000)
    );
    const uploadPromise = supabasePostsAdmin.storage
      .from(bucket)
      .upload(objectKey, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

    const result: any = await Promise.race([uploadPromise, timeoutPromise]);
    if (result && !result.error) {
      return true;
    }
    console.warn("[posts/upload] Supabase direct upload returned error, falling back to native vault:", result?.error?.message);
    return false;
  } catch (err: any) {
    console.warn("[posts/upload] Supabase direct upload exception, falling back to native vault:", err?.message || err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const bucket = process.env.SUPABASE_POSTS_BUCKET || "Autark-3";
    const imagesPrefix = process.env.SUPABASE_POSTS_IMAGES_PREFIX || "images";
    const videosPrefix = process.env.SUPABASE_POSTS_VIDEOS_PREFIX || "videos";

    const contentType = request.headers.get("content-type") || "";

    // -------------------------------------------------------------
    // PATHWAY A: JSON request for Signed Upload URL (XHR PUT flow)
    // -------------------------------------------------------------
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
        let mimeType = body.mimeType || "";
        if (!mimeType || mimeType === "application/octet-stream") {
          mimeType = kind === "video" ? "video/mp4" : "image/jpeg";
        }

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

        // Attempt Tier 1: External Supabase Storage
        const supabaseSign = await trySupabaseSignUpload(bucket, objectKey);

        if (supabaseSign) {
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
            signedUrl: supabaseSign.signedUrl,
            token: supabaseSign.token,
            attachment: {
              ...attachment,
              size,
            },
          });
        }

        // Tier 2: Resilient Native PostgreSQL Vault
        // If external cloud storage is down or paused, seamlessly provide direct endpoint
        const fallbackAttachment = await prismaAttachments.attachment.create({
          data: {
            messageId: null,
            roomId: null,
            senderId: meId,
            postId: null,
            kind,
            bucket: "database",
            objectKey: "pending",
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
            attachmentId: fallbackAttachment.id,
            event: "prepare-upload-native",
          },
        });

        return NextResponse.json({
          signedUrl: `/api/posts/upload?directAttachmentId=${fallbackAttachment.id}`,
          token: "native_vault",
          attachment: {
            ...fallbackAttachment,
            size,
          },
        });
      }
    }

    // -------------------------------------------------------------
    // PATHWAY B: Multipart FormData direct upload
    // -------------------------------------------------------------
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
    let buffer: any = Buffer.from(arrayBuffer);

    if (kind === "video") {
      try {
        const { relocateMoovToStart } = await import("@/lib/mp4FastStart");
        const faststart = relocateMoovToStart(buffer);
        buffer = Buffer.from(faststart.buffer, faststart.byteOffset, faststart.byteLength);
      } catch (err) {
        console.warn("[upload] FastStart relocation warning:", err);
      }
    }

    // Attempt Tier 1: Supabase Upload
    const supabaseUploaded = await trySupabaseUpload(
      bucket,
      objectKey,
      new Uint8Array(buffer),
      file.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
    );

    if (supabaseUploaded) {
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
    }

    // Tier 2: Resilient Native PostgreSQL Vault
    const mimeType = file.type || (kind === "video" ? "video/mp4" : "image/jpeg");
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const nativeAttachment = await prismaAttachments.attachment.create({
      data: {
        messageId: null,
        roomId: null,
        senderId: meId,
        postId: null,
        kind,
        bucket: "database",
        objectKey: base64Data,
        originalName,
        mimeType,
        sizeBytes: BigInt(buffer.length),
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
        attachmentId: nativeAttachment.id,
        event: "upload-post-native-direct",
      },
    });

    return NextResponse.json({
      attachment: {
        ...nativeAttachment,
        size: buffer.length,
      },
    });
  } catch (err) {
    console.error("[posts/upload] Unhandled error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT handler for native resilient direct uploads (called by XHR PUT when Tier 1 is unavailable).
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    const url = new URL(request.url);
    const directAttachmentId = url.searchParams.get("directAttachmentId");

    if (!directAttachmentId) {
      return NextResponse.json({ error: "Missing directAttachmentId" }, { status: 400 });
    }

    const attachment = await (prismaAttachments as any).attachment.findUnique({
      where: { id: directAttachmentId },
    });

    if (!attachment || attachment.senderId !== meId) {
      return NextResponse.json({ error: "Attachment not found or unauthorized" }, { status: 404 });
    }

    const arrayBuffer = await request.arrayBuffer();
    let buffer: any = Buffer.from(arrayBuffer);

    if (attachment.kind === "video") {
      try {
        const { relocateMoovToStart } = await import("@/lib/mp4FastStart");
        const faststart = relocateMoovToStart(buffer);
        buffer = Buffer.from(faststart.buffer, faststart.byteOffset, faststart.byteLength);
      } catch (err) {
        console.warn("[upload PUT] FastStart relocation warning:", err);
      }
    }

    const mimeType = request.headers.get("content-type") || attachment.mimeType || (attachment.kind === "video" ? "video/mp4" : "image/jpeg");
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    await (prismaAttachments as any).attachment.update({
      where: { id: directAttachmentId },
      data: {
        objectKey: base64Data,
        status: "uploaded",
        sizeBytes: BigInt(buffer.length),
      },
    });

    await (prismaAttachments as any).attachmentLog.create({
      data: {
        attachmentId: directAttachmentId,
        event: "upload-post-native-put-success",
      },
    });

    return NextResponse.json({
      success: true,
      attachmentId: directAttachmentId,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error("[posts/upload PUT] Error processing native upload:", err);
    return NextResponse.json({ error: err?.message || "Upload processing failed" }, { status: 500 });
  }
}
