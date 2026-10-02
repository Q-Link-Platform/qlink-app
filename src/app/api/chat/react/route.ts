import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export interface MessageReactionItem {
  emoji: string;
  userId: string;
  userHandle: string;
  userName: string;
  userImage: string | null;
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { messageId, emoji } = body;

    if (!messageId || typeof messageId !== "string") {
      return NextResponse.json({ error: "Missing or invalid messageId" }, { status: 400 });
    }

    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Missing or invalid emoji" }, { status: 400 });
    }

    const currentUserId = (session.user as any).id as string;

    // Fetch current user details for the reaction badge
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        handle: true,
        name: true,
        image: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        roomId: true,
        reactions: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Parse existing reactions
    let reactions: MessageReactionItem[] = [];
    if (message.reactions) {
      try {
        reactions = JSON.parse(message.reactions);
        if (!Array.isArray(reactions)) reactions = [];
      } catch {
        reactions = [];
      }
    }

    // WhatsApp-Style Behavior:
    // 1. If user already reacted with this exact emoji -> Remove it (Toggle off)
    // 2. If user already reacted with a different emoji -> Replace with the new emoji
    // 3. If user hasn't reacted yet -> Add new reaction
    const existingIndex = reactions.findIndex((r) => r.userId === currentUserId);
    const trimmedEmoji = emoji.trim();

    if (existingIndex > -1) {
      if (reactions[existingIndex].emoji === trimmedEmoji) {
        // Toggle OFF (remove)
        reactions.splice(existingIndex, 1);
      } else {
        // Switch emoji
        reactions[existingIndex] = {
          emoji: trimmedEmoji,
          userId: currentUserId,
          userHandle: currentUser.handle || "user",
          userName: currentUser.name || currentUser.handle || "User",
          userImage: currentUser.image || null,
          createdAt: new Date().toISOString(),
        };
      }
    } else {
      // Add reaction
      reactions.push({
        emoji: trimmedEmoji,
        userId: currentUserId,
        userHandle: currentUser.handle || "user",
        userName: currentUser.name || currentUser.handle || "User",
        userImage: currentUser.image || null,
        createdAt: new Date().toISOString(),
      });
    }

    // Update in database
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        reactions: reactions.length > 0 ? JSON.stringify(reactions) : null,
      },
      select: {
        id: true,
        reactions: true,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: updated.id,
      reactions,
    });
  } catch (err: any) {
    console.error("[Chat React API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to explicitly remove a reaction
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }

    const currentUserId = (session.user as any).id as string;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, reactions: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    let reactions: MessageReactionItem[] = [];
    if (message.reactions) {
      try {
        reactions = JSON.parse(message.reactions);
        if (!Array.isArray(reactions)) reactions = [];
      } catch {
        reactions = [];
      }
    }

    // Filter out current user's reaction
    reactions = reactions.filter((r) => r.userId !== currentUserId);

    await prisma.message.update({
      where: { id: messageId },
      data: {
        reactions: reactions.length > 0 ? JSON.stringify(reactions) : null,
      },
    });

    return NextResponse.json({
      success: true,
      messageId,
      reactions,
    });
  } catch (err: any) {
    console.error("[Chat React DELETE Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
