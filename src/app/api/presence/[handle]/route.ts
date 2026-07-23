import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Returns presence for the user with the given handle, as seen by the current viewer.
// Includes: online/offline, lastSeenAt, and whether they are currently typing to the viewer.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const viewerHandle = ((session.user as any).handle as string | undefined) || null;

  const { handle: rawHandle } = await params;
  let cleanHandle = (rawHandle || "").trim();
  if (cleanHandle.startsWith("@")) {
    cleanHandle = cleanHandle.substring(1);
  }

  if (!cleanHandle) {
    return NextResponse.json({ online: false, lastSeenAt: null, typing: false });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        handle: {
          equals: cleanHandle,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        lastSeenAt: true,
        lastTypingAt: true,
        lastTypingForHandle: true,
      },
    });

    if (!user) {
      // If the user handle does not exist, correctly return offline state rather than a fake online fallback
      return NextResponse.json({ online: false, lastSeenAt: null, typing: false });
    }

    const now = Date.now();
    
    // If the user has never logged in/pinged presence (lastSeenAt is null), correctly report offline
    if (!user.lastSeenAt) {
      return NextResponse.json({
        online: false,
        lastSeenAt: null,
        typing: false,
      });
    }

    const lastSeen = user.lastSeenAt.getTime();
    const lastTyping = user.lastTypingAt ? user.lastTypingAt.getTime() : null;

    const online = now - lastSeen <= 35_000; // 35 seconds window (robust presence matching 15s client ping)

    const typing =
      !!viewerHandle &&
      !!user.lastTypingForHandle &&
      user.lastTypingForHandle === viewerHandle &&
      !!lastTyping &&
      now - lastTyping <= 5_000; // typing valid for 5 seconds

    return NextResponse.json({
      online,
      lastSeenAt: user.lastSeenAt,
      typing,
    });
  } catch {
    return NextResponse.json({ error: "Unable to read presence" }, { status: 500 });
  }
}
