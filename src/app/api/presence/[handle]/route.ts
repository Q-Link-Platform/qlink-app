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

  let viewerHandle = ((session.user as any).handle as string | undefined) || null;
  const viewerId = (session.user as any)?.id as string | undefined;

  // Fallback: If handle is not attached to session token, fetch directly from DB
  if (!viewerHandle && viewerId) {
    const me = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { handle: true },
    });
    viewerHandle = me?.handle || null;
  }

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
      return NextResponse.json({ online: false, lastSeenAt: null, typing: false });
    }

    const now = Date.now();
    
    if (!user.lastSeenAt) {
      return NextResponse.json({
        online: false,
        lastSeenAt: null,
        typing: false,
      });
    }

    const lastSeen = user.lastSeenAt.getTime();
    const lastTyping = user.lastTypingAt ? user.lastTypingAt.getTime() : null;

    const online = now - lastSeen <= 45_000;

    const cleanViewer = (viewerHandle || "").trim().toLowerCase().replace(/^@/, "");
    const cleanTarget = (user.lastTypingForHandle || "").trim().toLowerCase().replace(/^@/, "");
    const typing =
      !!cleanViewer &&
      !!cleanTarget &&
      cleanViewer === cleanTarget &&
      !!lastTyping &&
      now - lastTyping <= 6_000;

    return NextResponse.json(
      {
        online,
        lastSeenAt: user.lastSeenAt,
        typing,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=2, stale-while-revalidate=5",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Unable to read presence" }, { status: 500 });
  }
}

// Fallback POST handler for presence/typing pings
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing" }, { status: 400 });
  }

  const { handle: rawHandle } = await params;
  let toHandle = (rawHandle || "").trim().replace(/^@/, "").toLowerCase();

  const url = new URL(req.url);
  const typingParam = url.searchParams.get("typing");
  const isTyping = typingParam === null || typingParam === "1" || typingParam === "true";

  try {
    await prisma.user.updateMany({
      where: { id: userId },
      data: {
        lastTypingAt: isTyping ? new Date() : null,
        lastTypingForHandle: isTyping ? toHandle : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
