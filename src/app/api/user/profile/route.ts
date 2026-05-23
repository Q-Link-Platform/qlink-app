import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Update basic profile fields like display name for the current user
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
  }

  let body: { name?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: { name?: string | null } = {};
  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    updates.name = trimmed.length > 0 ? trimmed : null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const result = await prisma.user.updateMany({
      where: { id: userId },
      data: updates,
    });

    if (result.count === 0) {
      return NextResponse.json({ user: { id: userId, ...updates } });
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ user: { id: userId, ...updates } });
  }
}
