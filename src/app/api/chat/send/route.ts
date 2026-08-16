import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema, validateRequest } from "@/lib/validation";
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

    const body = await request.json();
    
    // Validate request body using Zod schema
    const { toHandle, content, encrypted, iv } = validateRequest(sendMessageSchema, body);

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const cleanedToHandle = cleanHandle(toHandle);
    const peer = await prisma.user.findFirst({
      where: {
        handle: { equals: cleanedToHandle, mode: "insensitive" },
      },
    });

    if (!peer) {
      return NextResponse.json({ error: "Peer not found" }, { status: 404 });
    }

    if (peer.id === meId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    // Ensure there is an accepted friend request in either direction
    const accepted = await prisma.friendRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { fromUserId: meId, toUserId: peer.id },
          { fromUserId: peer.id, toUserId: meId },
        ],
      },
    });

    if (!accepted) {
      return NextResponse.json(
        { error: "No accepted connection between these users" },
        { status: 403 }
      );
    }

        // Bump friendRequest updatedAt so conversation recency is immediately indexed
    prisma.friendRequest
      .update({
        where: { id: accepted.id },
        data: { updatedAt: new Date() },
      })
      .catch(() => {});

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

    // Determine if recipient is actively online right now (last 45 seconds)
    const isPeerActivelyOnline = peer.lastSeenAt
      ? Date.now() - new Date(peer.lastSeenAt).getTime() < 45_000
      : false;

    let isDeliveredThroughNetwork = isPeerActivelyOnline;

    // Fire push notifications across the global push gateway (FCM / APNs / WebPush)
    try {
      const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
        where: { userId: peer.id },
      });

      if (pushSubscriptions && pushSubscriptions.length > 0) {
        const senderHandle = (session.user as any).handle || "Someone";
        const isEncrypted = content.trim().startsWith('{"__e2e"');
        const notificationBody = isEncrypted
          ? "🔒 End-to-End Encrypted Message"
          : (content.trim().length > 100 ? `${content.trim().substring(0, 100)}...` : content.trim());

        const payload = {
          title: `New Message from @${senderHandle}`,
          body: notificationBody,
          url: `/?chat=${senderHandle}`,
          messageId: message.id,
          data: {
            messageId: message.id,
            type: "NEW_MESSAGE",
            senderHandle: senderHandle,
            roomId: roomId,
          },
        };

        const { sendPushNotification } = await import("@/lib/push");

        const pushResults = await Promise.allSettled(
          pushSubscriptions.map((sub: any) =>
            sendPushNotification(sub, payload).catch(async (err: any) => {
              // Automatically prune expired/invalid notification endpoints
              if (err.statusCode === 410 || err.statusCode === 404) {
                try {
                  await (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
                  console.log(`[PUSH] Pruned expired subscription: ${sub.id}`);
                } catch (dbErr) {
                  console.error(`[PUSH] Failed to prune subscription: ${sub.id}`, dbErr);
                }
              }
              throw err;
            })
          )
        );

        // If at least one push notification was successfully accepted/delivered across the network
        const hasSuccessfulPush = pushResults.some((r) => r.status === "fulfilled");
        if (hasSuccessfulPush) {
          isDeliveredThroughNetwork = true;
        }
      }
    } catch (pushErr) {
      console.error("[PUSH ERROR IN SEND ROUTE]", pushErr);
    }

    // If verified delivered to recipient's device / active network queue, mark DELIVERED in DB
    if (isDeliveredThroughNetwork) {
      const now = new Date();
      prisma.message
        .update({
          where: { id: message.id },
          data: {
            status: "DELIVERED",
            deliveredAt: now,
          },
        })
        .catch((e: any) => console.error("[chat/send] DELIVERED update error:", e));

      return NextResponse.json({
        message: {
          ...message,
          status: "DELIVERED",
          deliveredAt: now.toISOString(),
        },
      });
    }

    return NextResponse.json({ message });
  } catch (err: any) {
    // Handle validation errors
    if (err.message && err.message.includes('Validation failed')) {
      const errorData = JSON.parse(err.message);
      return NextResponse.json(errorData, { status: 400 });
    }
    
    console.error("[chat/send]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
