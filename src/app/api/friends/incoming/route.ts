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

    const shaped = await Promise.all(
      requests.map(async (r) => {
        let latestMessage = null;
        if (r.status === "ACCEPTED" && r.fromUser) {
          const roomId = [toUserId, r.fromUserId].sort().join(":");
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
