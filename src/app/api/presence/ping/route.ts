import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
  }

  try {
    const now = new Date();

    const result = await prisma.user.updateMany({
      where: { id: userId },
      data: { lastSeenAt: now },
    });

    if (result.count === 0) {
      return NextResponse.json({ ok: true, handle: null, lastSeenAt: now });
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true, lastSeenAt: true },
    });

    return NextResponse.json({
      ok: true,
      handle: updated?.handle ?? null,
      lastSeenAt: updated?.lastSeenAt ?? now,
    });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
