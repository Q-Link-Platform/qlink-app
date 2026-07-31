import { NextResponse } from "next/server";
import { prismaAttachments } from "@/lib/prismaAttachments";
import { supabasePostsAdmin, supabasePosts } from "@/lib/supabasePosts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const key = url.searchParams.get("key");
    const bucket = url.searchParams.get("bucket") || process.env.SUPABASE_POSTS_BUCKET || "Autark-3";

    let targetBucket = bucket;
    let targetKey = key;
    let mimeType = "video/mp4";
    let totalSize: number | null = null;

    if (id) {
      const att = await (prismaAttachments as any).attachment.findUnique({
        where: { id },
        select: {
          bucket: true,
          objectKey: true,
          mimeType: true,
          sizeBytes: true,
        },
      });

      if (!att || !att.bucket || !att.objectKey) {
        return new NextResponse("Attachment not found", { status: 404 });
      }

      targetBucket = att.bucket;
      targetKey = att.objectKey;
      mimeType = att.mimeType || "video/mp4";
      if (att.sizeBytes) {
        totalSize = typeof att.sizeBytes === "bigint" ? Number(att.sizeBytes) : Number(att.sizeBytes);
      }
    }

    if (!targetBucket || !targetKey) {
      return new NextResponse("Invalid stream parameters", { status: 400 });
    }

    const client = supabasePostsAdmin || supabasePosts;
    let streamUrl: string | null = null;

    if (client) {
      const pub = client.storage.from(targetBucket).getPublicUrl(targetKey);
      if (pub.data?.publicUrl) {
        streamUrl = pub.data.publicUrl;
      }
    }

    if (!streamUrl) {
      streamUrl = `https://${process.env.SUPABASE_POSTS_URL ? new URL(process.env.SUPABASE_POSTS_URL).hostname : "ansfsehkrddmrwnjspek.supabase.co"}/storage/v1/object/public/${targetBucket}/${targetKey}`;
    }

    // Forward Range header for native browser video seeking & streaming
    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const upstreamRes = await fetch(streamUrl, {
      headers: fetchHeaders,
      cache: "no-store",
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      console.error("[media/stream] Upstream fetch failed:", upstreamRes.status, upstreamRes.statusText);
      return new NextResponse("Video stream unavailable", { status: upstreamRes.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamRes.headers.get("content-type") || mimeType);
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    } else if (totalSize) {
      responseHeaders.set("Content-Length", String(totalSize));
    }

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("[media/stream] Unhandled stream proxy error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
