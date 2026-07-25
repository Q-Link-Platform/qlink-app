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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const body = await req.json().catch(() => ({}));
    const { toHandle, voiceUrl, noteText } = body;

    if (!toHandle || typeof toHandle !== "string") {
      return NextResponse.json({ error: "Recipient handle is required" }, { status: 400 });
    }

    // Resolve target user
    const recipient = await prisma.user.findUnique({
      where: { handle: toHandle },
      select: { id: true, handle: true, name: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient user not found" }, { status: 404 });
    }

    // Resolve sender details
    const sender = await prisma.user.findUnique({
      where: { id: meId },
      select: { id: true, handle: true, name: true },
    });

    const senderHandle = sender?.handle || "Someone";
    const senderName = sender?.name || `@${senderHandle}`;

    // Compute room ID
    const userIds = [meId, recipient.id].sort();
    const roomId = `dm:${userIds[0]}:${userIds[1]}`;

    // Rate limit check bypassed for testing as requested
    const recentBeaconsCount = 0;

    const beaconMessageContent = `⚡ [Q-BEACON_EMERGENCY]: ${voiceUrl || noteText || "Priority Emergency Pulse"}`;

    // Save message record in database
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: meId,
        content: beaconMessageContent,
      },
    });

    // Send High-Priority VAPID WebPush to recipient's registered devices
    const pushSubscriptions = await prisma.pushSubscription.findMany({
      where: { userId: recipient.id },
    });

    const pushPayload = {
      title: `⚡ EMERGENCY BEACON from @${senderHandle}`,
      body: noteText ? `"${noteText}" - Tap to view & play voice snippet` : `Urgent Priority Voice Pulse - Tap to play!`,
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

    // Dispatch push notifications synchronously to ensure Vercel serverless context stays alive until delivery
    await Promise.allSettled(
      pushSubscriptions.map((sub) =>
        sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          pushPayload
        )
      )
    );

    return NextResponse.json({
      ok: true,
      messageId: message.id,
      senderHandle,
      recipientHandle: recipient.handle,
      quotaRemaining: 2 - recentBeaconsCount,
    });
  } catch (err: any) {
    console.error("[api/chat/beacon] Emergency beacon error:", err);
    return NextResponse.json({ error: "Failed to dispatch emergency beacon" }, { status: 500 });
  }
}
