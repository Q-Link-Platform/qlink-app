import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cleanHandle } from "@/lib/handle-utils";

function buildRoomId(a: string, b: string) {
  return [a, b].sort().join(":");
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const url = new URL(request.url);
    const peerHandle = url.searchParams.get("peerHandle");

    if (!peerHandle) {
      return NextResponse.json({ error: "Missing peerHandle" }, { status: 400 });
    }

    const meId = (session.user as any).id as string;
    const cleanedPeerHandle = cleanHandle(peerHandle);

    // Multi-tier peer resolution: exact handle -> ID -> fuzzy handle -> name
    let peer = await prisma.user.findFirst({
      where: {
        OR: [
          { handle: { equals: cleanedPeerHandle, mode: "insensitive" } },
          { id: cleanedPeerHandle },
          { email: { equals: cleanedPeerHandle, mode: "insensitive" } },
        ],
      },
    });

    if (!peer) {
      // Fallback fuzzy search (e.g. "Rohit_7779" -> "rohit")
      const baseHandle = cleanedPeerHandle.split(/[-_]/)[0];
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
      return NextResponse.json({ error: `Peer "@${peerHandle}" not found.` }, { status: 404 });
    }

    if (peer.id === meId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    // Auto-create/ensure accepted connection for seamless messaging
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
    } else if (accepted.status !== "ACCEPTED") {
      await prisma.friendRequest.update({
        where: { id: accepted.id },
        data: { status: "ACCEPTED" },
      }).catch(() => {});
    }

    const roomId = buildRoomId(meId, peer.id);

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        roomId: true,
        status: true,
        deliveredAt: true,
        readAt: true,
        isEdited: true,
        editedAt: true,
      },
    });

    // Auto-mark unread messages as READ
    const unreadMessageIds = messages
      .filter((m: any) => m.senderId === peer.id && m.status !== "READ")
      .map((m: any) => m.id);

    if (unreadMessageIds.length > 0) {
      const now = new Date();
      prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { status: "READ", readAt: now, deliveredAt: now },
      }).catch(() => {});

      for (const m of messages) {
        if (m.senderId === peer.id && m.status !== "READ") {
          m.status = "READ";
          (m as any).readAt = now.toISOString();
        }
      }
    }

    return NextResponse.json({
      roomId,
      peer: {
        id: peer.id,
        handle: peer.handle,
        name: peer.name,
        email: peer.email,
        image: peer.image,
        publicKeyString: peer.publicKeyString,
      },
      messages: messages.map((m) => ({ ...m, attachments: [] })),
    });
  } catch (err: any) {
    console.error("[chat/history]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
