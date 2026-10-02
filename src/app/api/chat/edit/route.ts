import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    const body = await request.json();
    const { messageId, content } = body;

    if (!messageId || typeof messageId !== "string") {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    // Ensure message exists and belongs to current user
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (existingMessage.senderId !== meId) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own messages" },
        { status: 403 }
      );
    }

    const now = new Date();
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
        editedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: updated.id,
        content: updated.content,
        createdAt: updated.createdAt,
        senderId: updated.senderId,
        roomId: updated.roomId,
        status: updated.status,
        deliveredAt: updated.deliveredAt,
        readAt: updated.readAt,
        isEdited: updated.isEdited,
        editedAt: updated.editedAt,
      },
    });
  } catch (err) {
    console.error("[chat/edit] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
