import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * High-speed Delivery Acknowledgement Endpoint
 * Called by Service Workers, Push Notification Handlers, or Background Sync
 * to mark messages as DELIVERED to recipient's device.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messageId, messageIds } = body;

    const ids: string[] = [];
    if (messageId && typeof messageId === "string") {
      ids.push(messageId);
    }
    if (Array.isArray(messageIds)) {
      messageIds.forEach((id) => {
        if (typeof id === "string" && id.trim()) {
          ids.push(id.trim());
        }
      });
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }

    const now = new Date();

    // Atomically update only messages that are currently in "SENT" status to "DELIVERED"
    // (Do not downgrade messages that are already "READ")
    const result = await prisma.message.updateMany({
      where: {
        id: { in: ids },
        status: "SENT",
      },
      data: {
        status: "DELIVERED",
        deliveredAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      status: "DELIVERED",
    });
  } catch (error) {
    console.error("[delivery-ack] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
