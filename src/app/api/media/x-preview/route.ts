import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle") || "i";
    const id = searchParams.get("id");

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid status ID" }, { status: 400 });
    }

    // 1. Try primary FxTwitter API
    try {
      const response = await fetch(`https://api.fxtwitter.com/${handle}/status/${id}`, {
        headers: {
          "User-Agent": "Q-Link-Bot/1.0",
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.code === 200 && data.tweet) {
          return NextResponse.json(
            { success: true, tweet: data.tweet },
            {
              headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
              },
            }
          );
        }
      }
    } catch (primaryErr) {
      console.warn("FxTwitter fetch error:", primaryErr);
    }

    // 2. Fallback: Try with 'i' username in case handle changed
    if (handle !== "i") {
      try {
        const fallbackRes = await fetch(`https://api.fxtwitter.com/i/status/${id}`, {
          headers: {
            "User-Agent": "Q-Link-Bot/1.0",
          },
          next: { revalidate: 3600 },
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.code === 200 && fallbackData.tweet) {
            return NextResponse.json(
              { success: true, tweet: fallbackData.tweet },
              {
                headers: {
                  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
                },
              }
            );
          }
        }
      } catch (fallbackErr) {
        console.warn("FxTwitter fallback error:", fallbackErr);
      }
    }

    return NextResponse.json(
      { error: "Could not fetch X post metadata" },
      { status: 404 }
    );
  } catch (error) {
    console.error("X preview route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
