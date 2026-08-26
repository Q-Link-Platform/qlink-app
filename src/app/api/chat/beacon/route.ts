import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { touchUserPresence } from "@/lib/presence";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const body = await req.json().catch(() => ({}));
    const { toHandle, voiceUrl, noteText } = body;

    if (!toHandle || typeof toHandle !== "string") {
      return NextResponse.json({ error: "Recipient handle is required." }, { status: 400 });
    }

    // Clean & normalize recipient handle
    const cleanHandle = toHandle.replace(/^@/, "").trim();

    // Resolve target user (by handle, id, or email, case-insensitive)
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { handle: { equals: cleanHandle, mode: "insensitive" } },
          { id: cleanHandle },
          { email: { equals: cleanHandle, mode: "insensitive" } }
        ]
      },
      select: { id: true, handle: true, name: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: `Recipient "@${cleanHandle}" was not found in the network.` },
        { status: 404 }
      );
    }

    // Resolve sender details
    const sender = await prisma.user.findUnique({
      where: { id: meId },
      select: { id: true, handle: true, name: true },
    });

    const senderHandle = sender?.handle || (session.user as any).handle || "Someone";

    // Compute room ID
    const userIds = [meId, recipient.id].sort();
    const roomId = `dm:${userIds[0]}:${userIds[1]}`;

    const beaconMessageContent = `🚨 [Q-BEACON_EMERGENCY]: ${noteText || voiceUrl || "Priority Emergency Pulse"}`;

    // Save message record in database
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: meId,
        content: beaconMessageContent,
        status: "SENT",
      },
    });

    // Send High-Priority VAPID WebPush to recipient's registered devices if available
    try {
      const pushSubscriptions = await prisma.pushSubscription.findMany({
        where: { userId: recipient.id },
      });

      if (pushSubscriptions.length > 0) {
        const pushPayload = {
          title: `🚨 EMERGENCY BEACON from @${senderHandle}`,
          body: noteText ? `"${noteText}" - Tap to open emergency channel` : `Urgent Priority Beacon - Tap to view!`,
          icon: "/icon.png",
          url: `/?peer=${encodeURIComponent(senderHandle)}&beacon=1&msgId=${message.id}`,
          urgency: "high" as const,
          requireInteraction: true,
          vibrate: [500, 200, 500, 200, 1000],
          tag: `beacon-${message.id}`,
          data: {
            type: "EMERGENCY_BEACON",
            senderHandle,
            voiceUrl: voiceUrl || null,
            messageId: message.id,
          },
        };

        await Promise.allSettled(
          pushSubscriptions.map((sub) =>
            sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              pushPayload
            ).catch((e) => {
              console.warn(`[api/chat/beacon] Push dispatch failed for subscription:`, e?.message);
            })
          )
        );
      }
    } catch (pushErr: any) {
      console.warn("[api/chat/beacon] Push notification system warning:", pushErr?.message);
    }

    return NextResponse.json({
      ok: true,
      messageId: message.id,
      senderHandle,
      recipientHandle: recipient.handle,
      quotaRemaining: 2,
    });
  } catch (err: any) {
    console.error("[api/chat/beacon] Emergency beacon error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch emergency beacon." },
      { status: 500 }
    );
  }
}
