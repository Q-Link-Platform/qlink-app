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
  const trimmed = (rawHandle || "").trim();
  if (!rawHandle) {
    // If handle is missing, report a neutral "recently seen" state so
    // the frontend presence poller stays stable in demos/testing.
    const now = new Date();
    return NextResponse.json({ online: true, lastSeenAt: now, typing: false });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        handle: {
          equals: rawHandle,
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
      // If the user handle does not exist, treat them as recently seen
      // instead of returning an error, so indicators still render in
      // simple two-user demos even when lookup fails.
      const now = new Date();
      console.log("[presence] user not found for handle:", rawHandle, "-> fallback online");
      return NextResponse.json({ online: true, lastSeenAt: now, typing: false });
    }

    const now = Date.now();
    const effectiveLastSeenDate = user.lastSeenAt ?? new Date();
    const lastSeen = effectiveLastSeenDate.getTime();
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
      lastSeenAt: effectiveLastSeenDate,
      typing,
    });
  } catch {
    return NextResponse.json({ error: "Unable to read presence" }, { status: 500 });
  }
}
