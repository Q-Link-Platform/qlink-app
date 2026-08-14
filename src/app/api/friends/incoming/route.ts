import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const toUserId = (session.user as any).id as string;

    const requests = await prisma.friendRequest.findMany({
      where: { toUserId },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: {
          select: {
            id: true,
            handle: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Deduplicate: keep only the latest request per sender
    const seenSenderIds = new Set<string>();
    const uniqueRequests = [];
    for (const r of requests) {
      if (!r.fromUserId) continue;
      if (!seenSenderIds.has(r.fromUserId)) {
        seenSenderIds.add(r.fromUserId);
        uniqueRequests.push(r);
      }
    }

    // Auto-mark SENT messages from friends to this user as DELIVERED since this user's device is online and syncing
    const friendUserIds = uniqueRequests
      .filter((r) => r.status === "ACCEPTED" && r.fromUserId)
      .map((r) => r.fromUserId);

    if (friendUserIds.length > 0) {
      const roomIds: string[] = [];
      friendUserIds.forEach((fId) => {
        const u = [toUserId, fId].sort();
        roomIds.push(`${u[0]}:${u[1]}`, `dm:${u[0]}:${u[1]}`);
      });

      const now = new Date();
      prisma.message.updateMany({
        where: {
          roomId: { in: roomIds },
          senderId: { in: friendUserIds },
          status: "SENT",
        },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      }).catch((err) => console.error("[friends/incoming] DELIVERED update error:", err));
    }

    const shaped = await Promise.all(
      uniqueRequests.map(async (r) => {
        let latestMessage = null;
        if (r.status === "ACCEPTED" && r.fromUser) {
          const uids = [toUserId, r.fromUserId].sort();
          const plainRoomId = `${uids[0]}:${uids[1]}`;
          const dmRoomId = `dm:${plainRoomId}`;

          const msg = await prisma.message.findFirst({
            where: {
              OR: [
                { roomId: plainRoomId },
                { roomId: dmRoomId },
              ],
            },
            orderBy: { createdAt: "desc" },
            select: { id: true, content: true, createdAt: true, senderId: true, status: true },
          });

          if (msg) {
            latestMessage = {
              id: msg.id,
              content: msg.content,
              createdAt: msg.createdAt.toISOString(),
              senderId: msg.senderId,
              status: msg.status || "SENT",
            };
          }
        }

        return {
          id: r.id,
          status: r.status,
          categories: r.categories.split(",").filter(Boolean),
          message: r.message,
          createdAt: r.createdAt,
          fromUser: r.fromUser,
          latestMessage,
        };
      })
    );

    return NextResponse.json({ requests: shaped });
  } catch (err) {
    console.error("[friends/incoming]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
