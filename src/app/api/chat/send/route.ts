import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { touchUserPresence } from "@/lib/presence";
import { cleanHandle } from "@/lib/handle-utils";

function buildRoomId(a: string, b: string) {
  return [a, b].sort().join(":");
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { toHandle, content } = body;

    if (!toHandle || !content) {
      return NextResponse.json({ error: "Missing toHandle or content" }, { status: 400 });
    }

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const cleanedToHandle = cleanHandle(toHandle);
    let peer = await prisma.user.findFirst({
      where: {
        OR: [
          { handle: { equals: cleanedToHandle, mode: "insensitive" } },
          { id: cleanedToHandle },
          { email: { equals: cleanedToHandle, mode: "insensitive" } },
        ],
      },
    });

    if (!peer) {
      const baseHandle = cleanedToHandle.split(/[-_]/)[0];
      peer = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: { contains: baseHandle, mode: "insensitive" } },
            { name: { contains: baseHandle, mode: "insensitive" } },
          ],
        },
      });
    }

    if (!peer) {
      return NextResponse.json({ error: `Peer "@${toHandle}" not found` }, { status: 404 });
    }

    if (peer.id === meId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    // Ensure connection exists
    const accepted = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId: meId, toUserId: peer.id },
          { fromUserId: peer.id, toUserId: meId },
        ],
      },
    });

    if (!accepted) {
      await prisma.friendRequest.create({
        data: {
          fromUserId: meId,
          toUserId: peer.id,
          categories: "Friend",
          message: "Connected",
          status: "ACCEPTED",
        },
      }).catch(() => {});
    }

    const roomId = buildRoomId(meId, peer.id);

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: meId,
        roomId,
        status: "SENT",
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        roomId: true,
        status: true,
        deliveredAt: true,
        readAt: true,
      },
    });

    return NextResponse.json({ message });
  } catch (err: any) {
    console.error("[chat/send]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
