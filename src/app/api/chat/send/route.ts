import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema, validateRequest } from "@/lib/validation";
import { touchUserPresence } from "@/lib/presence";

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

    const peer = await prisma.user.findUnique({ where: { handle: toHandle } });
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

    const roomId = buildRoomId(meId, peer.id);

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: meId,
        roomId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        roomId: true,
      },
    });

    // Fire push notifications asynchronously in the background so it doesn't block the API response time
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
        };

        const { sendPushNotification } = await import("@/lib/push");
        
        // We await the Promise.allSettled to ensure Vercel completes sending push notifications before returning the response
        await Promise.allSettled(
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
            })
          )
        );
      }
    } catch (pushErr) {
      console.error("[PUSH ERROR IN SEND ROUTE]", pushErr);
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
