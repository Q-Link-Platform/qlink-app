import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fromUserId = (session.user as any).id as string;
    const { toHandle, categories, message } = await request.json();

    if (!toHandle || typeof toHandle !== "string") {
      return NextResponse.json({ error: "Missing toHandle" }, { status: 400 });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: "Select at least one category" }, { status: 400 });
    }

    if (categories.length > 2) {
      return NextResponse.json({ error: "You can select at most two categories" }, { status: 400 });
    }

    const toUser = await prisma.user.findUnique({ where: { handle: toHandle } });
    if (!toUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (toUser.id === fromUserId) {
      return NextResponse.json({ error: "You cannot send a request to yourself" }, { status: 400 });
    }

    const concatenatedCategories = (categories as string[])
      .map((c) => c.trim())
      .filter(Boolean)
      .join(",");

    const friendRequest = await prisma.friendRequest.create({
      data: {
        fromUserId,
        toUserId: toUser.id,
        categories: concatenatedCategories,
        message: typeof message === "string" && message.trim() ? message.trim() : null,
      },
    });

    try {
      const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
        where: { userId: toUser.id },
      });

      if (pushSubscriptions && pushSubscriptions.length > 0) {
        const senderHandle = (session.user as any).handle || "Someone";
        const payload = {
          title: "New Connection Request! ⚡",
          body: `@${senderHandle} wants to connect with you.`,
          url: "/?tab=requests",
        };

        const { sendPushNotification } = await import("@/lib/push");

        await Promise.allSettled(
          pushSubscriptions.map((sub: any) =>
            sendPushNotification(sub, payload).catch(async (err: any) => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                try {
                  await (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
                  console.log(`[PUSH] Pruned expired subscription: ${sub.id}`);
                } catch (dbErr) {
                  console.error(`[PUSH] Failed to prune subscription: ${sub.id}`, dbErr);
                }
              }
            })
          )
        );
      }
    } catch (pushErr) {
      console.error("[PUSH ERROR IN REQUEST ROUTE]", pushErr);
    }

    return NextResponse.json({ request: friendRequest });
  } catch (err) {
    console.error("[friends/request]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
