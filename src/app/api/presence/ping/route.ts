import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
  }

  try {
    let offline = false;
    try {
      const rawText = await req.text();
      if (rawText) {
        const body = JSON.parse(rawText);
        offline = Boolean(body?.offline);
      }
    } catch {
      // Ignore parsing errors for backward compatibility and beacon pings
    }

    // When offline, mark lastSeenAt back 60s so peers immediately register as away/offline
    const now = offline ? new Date(Date.now() - 60_000) : new Date();

    // Single atomic database update (halves DB compute & eliminates second roundtrip query)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: now },
      select: { handle: true, lastSeenAt: true },
    }).catch(() => null);

    return NextResponse.json(
      {
        ok: true,
        handle: updated?.handle ?? null,
        lastSeenAt: updated?.lastSeenAt ?? now,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: true });
  }
}
