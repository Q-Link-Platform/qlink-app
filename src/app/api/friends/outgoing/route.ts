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

    const fromUserId = (session.user as any).id as string;

    const requests = await prisma.friendRequest.findMany({
      where: { fromUserId },
      orderBy: { createdAt: "desc" },
      include: {
        toUser: {
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

    // Deduplicate: keep only the latest request per recipient
    const seenRecipientIds = new Set<string>();
    const uniqueRequests = [];
    for (const r of requests) {
      if (!r.toUserId) continue;
      if (!seenRecipientIds.has(r.toUserId)) {
        seenRecipientIds.add(r.toUserId);
        uniqueRequests.push(r);
      }
    }

    const shaped = await Promise.all(
      uniqueRequests.map(async (r) => {
        let latestMessage = null;
        if (r.status === "ACCEPTED" && r.toUser) {
          const roomId = [fromUserId, r.toUserId].sort().join(":");
          const msg = await prisma.message.findFirst({
            where: { roomId },
            orderBy: { createdAt: "desc" },
            select: { id: true, createdAt: true, senderId: true },
          });
          if (msg) {
            latestMessage = {
              id: msg.id,
              createdAt: msg.createdAt.toISOString(),
              senderId: msg.senderId,
            };
          }
        }

        return {
          id: r.id,
          status: r.status,
          categories: r.categories.split(",").filter(Boolean),
          message: r.message,
          createdAt: r.createdAt,
          toUser: r.toUser,
          latestMessage,
        };
      })
    );

    return NextResponse.json({ requests: shaped });
  } catch (err) {
    console.error("[friends/outgoing]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
