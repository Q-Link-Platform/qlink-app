import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { findAttachmentRecord } from "@/lib/attachmentDb";
import { supabaseFiles } from "@/lib/supabaseFiles";
import { supabaseVideos } from "@/lib/supabaseVideos";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const meId = (session.user as any).id as string;

    const attachment = await findAttachmentRecord(id);

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Basic access check: user must be part of the room encoded in roomId
    // roomId format: "userId1:userId2" (sorted)
    const roomId = attachment.roomId ?? "";
    const parts = roomId.split(":");
    if (!parts.includes(meId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Local storage vault handler
    if (attachment.bucket === "local" || attachment.objectKey.startsWith("/uploads/")) {
      const relativeFilePath = attachment.objectKey.replace(/^\//, "");
      const localPath = path.join(process.cwd(), "public", relativeFilePath);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const contentType = attachment.mimeType || "application/octet-stream";
        const filename = attachment.originalName || "download";
        return new Response(buffer as any, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Native Database Vault handler
    if (attachment.bucket === "database" || attachment.objectKey.startsWith("data:")) {
      const parts = attachment.objectKey.split(",");
      const base64Str = parts.length > 1 ? parts[1] : parts[0];
      const buffer = Buffer.from(base64Str, "base64");
      const contentType = attachment.mimeType || "application/octet-stream";
      const filename = attachment.originalName || "download";

      return new Response(buffer as any, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const isVideo = attachment.kind === "video";
    const supabase = isVideo ? supabaseVideos : supabaseFiles;

    if (!supabase) {
      return NextResponse.json({ error: "Storage client not configured" }, { status: 500 });
    }

    console.log("[attachments/download] Attempting download from bucket:", attachment.bucket, "key:", attachment.objectKey);
    
    const { data, error } = await supabase.storage
      .from(attachment.bucket)
      .download(attachment.objectKey);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.error("[attachments/download] Storage download error", id, error?.message, "bucket:", attachment.bucket, "key:", attachment.objectKey);
      return NextResponse.json({ error: "Failed to download attachment: " + (error?.message || "File not found in storage") }, { status: 500 });
    }
    
    console.log("[attachments/download] Success:", attachment.originalName, "size:", data.size);

    const contentType = attachment.mimeType || "application/octet-stream";
    const filename = attachment.originalName || "download";

    return new Response(data as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[attachments/download] Unhandled error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
