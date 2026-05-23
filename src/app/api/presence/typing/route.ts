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

  let body: { toHandle?: string; typing?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const toHandle = (body.toHandle || "").trim();
  const typing = Boolean(body.typing);

  if (!toHandle) {
    return NextResponse.json({ error: "Missing target handle" }, { status: 400 });
  }

  try {
    await prisma.user.updateMany({
      where: { id: userId },
      data: {
        lastTypingAt: typing ? new Date() : null,
        lastTypingForHandle: typing ? toHandle : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
