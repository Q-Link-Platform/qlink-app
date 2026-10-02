import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * High-performance streaming proxy for X (Twitter) video media.
 * Bypasses Twitter CDN's 403 Forbidden anti-hotlinking referer check
 * by streaming byte ranges with authorized headers and chunked transfer.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Security validation: only proxy authorized Twitter/X media CDNs
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(videoUrl);
    } catch {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowedHost =
      hostname.endsWith(".twimg.com") ||
      hostname.endsWith(".x.com") ||
      hostname.endsWith(".twitter.com") ||
      hostname === "video.twimg.com" ||
      hostname === "pbs.twimg.com";

    if (!isAllowedHost) {
      return new NextResponse("Host not authorized for proxy", { status: 403 });
    }

    const rangeHeader = request.headers.get("range");

    const upstreamHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Referer": "https://x.com/",
      "Accept": "*/*",
      "Accept-Encoding": "identity",
    };

    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const upstreamRes = await fetch(videoUrl, {
      method: "GET",
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      console.warn("[x-video proxy] Upstream returned non-2xx status:", upstreamRes.status);
      return new NextResponse(`Upstream error: ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamRes.headers.get("content-type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
      "Cache-Control",
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
    );

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamRes.body as any, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[x-video proxy] Internal error:", error);
    return new NextResponse("Video streaming proxy error", { status: 500 });
  }
}
