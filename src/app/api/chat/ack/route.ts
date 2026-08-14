import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cleanHandle } from "@/lib/handle-utils";

function buildRoomId(a: string, b: string) {
  return [a, b].sort().join(":");
}

/**
 * Message Acknowledgement & Read Receipt Endpoint
 * - status "DELIVERED": Recipient device received messages.
 * - status "READ": Recipient explicitly has the sender's chat room open and verifies read receipts.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    const body = await request.json();
    const { peerHandle, status: ackStatus } = body;

    const targetStatus = ackStatus === "READ" ? "READ" : "DELIVERED";
    const cleanedPeerHandle = cleanHandle(peerHandle);

    if (!cleanedPeerHandle) {
      return NextResponse.json({ error: "Missing peerHandle" }, { status: 400 });
    }

    const peer = await prisma.user.findFirst({
      where: {
        handle: { equals: cleanedPeerHandle, mode: "insensitive" },
      },
    });

    if (!peer) {
      return NextResponse.json({ error: "Peer not found" }, { status: 404 });
    }

    const roomId = buildRoomId(meId, peer.id);
    const now = new Date();

    if (targetStatus === "READ") {
      // Recipient has opened sender's chat: Mark ALL unread messages sent by peer to recipient as READ
      await prisma.message.updateMany({
        where: {
          roomId: roomId,
          senderId: peer.id, // Only messages sent BY the peer
          status: { in: ["SENT", "DELIVERED"] },
        },
        data: {
          status: "READ",
          readAt: now,
        },
      });
    } else {
      // Mark messages sent BY the peer to recipient as DELIVERED
      await prisma.message.updateMany({
        where: {
          roomId: roomId,
          senderId: peer.id,
          status: "SENT",
        },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      });
    }

    return NextResponse.json({ success: true, status: targetStatus });
  } catch (error) {
    console.error("[chat/ack] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
