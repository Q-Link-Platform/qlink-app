import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Process due scheduled messages (Invoked by server cron / background ticker)
export async function GET(req: NextRequest) {
  return handleProcess();
}

export async function POST(req: NextRequest) {
  return handleProcess();
}

async function handleProcess() {
  try {
    const now = new Date();

    // 1. Fetch pending scheduled messages whose executeAt has arrived
    const dueMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: "PENDING",
        executeAt: { lte: now },
      },
      include: {
        sender: true,
      },
      take: 50,
    });

    if (dueMessages.length === 0) {
      return NextResponse.json({ success: true, processedCount: 0, message: "No pending scheduled messages due" });
    }

    const processedIds: string[] = [];

    for (const sm of dueMessages) {
      try {
        // Resolve roomId if missing
        let roomId = sm.roomId;
        if (!roomId) {
          const recipient = await prisma.user.findFirst({
            where: {
              OR: [
                { handle: sm.recipientHandle },
                { name: sm.recipientHandle },
              ],
            },
          });
          if (recipient) {
            roomId = [sm.senderId, recipient.id].sort().join(":");
          } else {
            roomId = `room:${sm.senderId}:${sm.recipientHandle}`;
          }
        }

        // Create the real message in Message table
        await prisma.message.create({
          data: {
            content: sm.content,
            senderId: sm.senderId,
            roomId: roomId,
            status: "SENT",
          },
        });

        // Mark as SENT
        await prisma.scheduledMessage.update({
          where: { id: sm.id },
          data: { status: "SENT" },
        });

        processedIds.push(sm.id);
      } catch (itemErr) {
        console.error(`[Process Scheduled Msg ${sm.id} Error]:`, itemErr);
        await prisma.scheduledMessage.update({
          where: { id: sm.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: processedIds.length,
      processedIds,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("[Process Scheduled Messages Root Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
