import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

function calculateAuraPercentage(points: number): number {
  if (points < 5) return 0;
  if (points < 100) return 50;
  if (points < 1000) return 100;
  if (points < 10000) return 1000;
  if (points < 105000) return 10500;
  return 999999;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate administrative session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    
    // 2. Strict Admin Authorization Barrier
    const authorized = await isAdmin(meId);
    if (!authorized) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can grant Quantum Points." },
        { status: 403 }
      );
    }

    const { recipientHandle, amount } = await request.json().catch(() => ({}));

    if (!recipientHandle) {
      return NextResponse.json({ error: "Recipient handle is required." }, { status: 400 });
    }

    const qpAmount = parseInt(amount, 10);
    if (isNaN(qpAmount) || qpAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid positive points amount." }, { status: 400 });
    }

    if (qpAmount > 1000000) {
      return NextResponse.json({ error: "Maximum single transmission limit is 1,000,000 QP." }, { status: 400 });
    }

    // 3. Find recipient user in DB
    const recipient = await prisma.user.findUnique({
      where: { handle: recipientHandle },
      select: { id: true, points: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: `User @${recipientHandle} does not exist.` }, { status: 404 });
    }

    // 4. Atomically credit Quantum Points and update Aura level
    const currentPoints = recipient.points || 0;
    const newPoints = currentPoints + qpAmount;
    const newAura = calculateAuraPercentage(newPoints);

    const updatedRecipient = await prisma.user.update({
      where: { id: recipient.id },
      data: {
        points: newPoints,
        aura_percentage: newAura,
      },
      select: {
        id: true,
        handle: true,
        name: true,
        points: true,
        aura_percentage: true,
      },
    });

    // Fire push notification asynchronously in the background when points are granted
    try {
      const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
        where: { userId: recipient.id },
      });

      if (pushSubscriptions && pushSubscriptions.length > 0) {
        const payload = {
          title: "Quantum Wealth Received! 💎",
          body: `You have been granted +${qpAmount} Quantum Points!`,
          url: "/",
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
      console.error("[PUSH ERROR IN POINTS GRANT ROUTE]", pushErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully transmitted +${qpAmount} Quantum Currency to @${recipientHandle}!`,
      recipient: {
        handle: updatedRecipient.handle,
        name: updatedRecipient.name,
        points: updatedRecipient.points,
        auraPercentage: updatedRecipient.aura_percentage,
      },
    });
  } catch (err: any) {
    console.error("[points grant error]", err);
    return NextResponse.json({ error: "Failed to process currency transmission." }, { status: 500 });
  }
}
