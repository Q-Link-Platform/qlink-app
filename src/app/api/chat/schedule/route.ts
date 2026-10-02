import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to resolve sender
async function getAuthenticatedUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) return user;
  }

  // Fallback: desktop token or header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const sessionRecord = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });
    if (sessionRecord?.user) return sessionRecord.user;
  }

  return null;
}

// POST: Schedule a new message
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientHandle, content, executeAt, roomId } = await req.json();

    if (!recipientHandle || !content || !executeAt) {
      return NextResponse.json(
        { error: "Missing recipientHandle, content, or executeAt" },
        { status: 400 }
      );
    }

    const targetDate = new Date(executeAt);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid executeAt timestamp" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const cleanHandle = recipientHandle.replace(/^@/, "").trim();
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { handle: cleanHandle },
          { name: cleanHandle },
        ],
      },
    });

    // Determine roomId
    let computedRoomId = roomId;
    if (!computedRoomId && recipient) {
      computedRoomId = [user.id, recipient.id].sort().join(":");
    }

    const scheduled = await prisma.scheduledMessage.create({
      data: {
        senderId: user.id,
        recipientHandle: cleanHandle,
        roomId: computedRoomId,
        content: content.trim(),
        executeAt: targetDate,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      scheduled: {
        id: scheduled.id,
        recipientHandle: scheduled.recipientHandle,
        content: scheduled.content,
        executeAt: scheduled.executeAt.toISOString(),
        status: scheduled.status,
      },
    });
  } catch (error: any) {
    console.error("[Schedule Message Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// GET: List active scheduled messages for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scheduledList = await prisma.scheduledMessage.findMany({
      where: {
        senderId: user.id,
        status: "PENDING",
      },
      orderBy: { executeAt: "asc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      scheduled: scheduledList.map((s: any) => ({
        id: s.id,
        recipientHandle: s.recipientHandle,
        content: s.content,
        executeAt: s.executeAt.toISOString(),
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[Get Scheduled Messages Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE: Cancel a pending scheduled message
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing scheduled message ID" }, { status: 400 });
    }

    const scheduled = await prisma.scheduledMessage.findUnique({
      where: { id },
    });

    if (!scheduled || scheduled.senderId !== user.id) {
      return NextResponse.json({ error: "Scheduled message not found or unauthorized" }, { status: 404 });
    }

    await prisma.scheduledMessage.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true, message: "Scheduled message cancelled" });
  } catch (error: any) {
    console.error("[Cancel Scheduled Message Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
