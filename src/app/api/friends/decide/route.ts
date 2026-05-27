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

    const toUserId = (session.user as any).id as string;
    const { requestId, action } = await request.json();

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    if (action !== "ACCEPT" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest || friendRequest.toUserId !== toUserId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
    });

    if (action === "ACCEPT") {
      try {
        const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
          where: { userId: friendRequest.fromUserId },
        });

        if (pushSubscriptions && pushSubscriptions.length > 0) {
          const senderHandle = (session.user as any).handle || "Someone";
          const payload = {
            title: "Request Accepted! ⚡",
            body: `@${senderHandle} accepted your quantum tunnel invitation.`,
            url: `/?chat=${senderHandle}`,
          };

          const { sendPushNotification } = await import("@/lib/push");

          Promise.allSettled(
            pushSubscriptions.map((sub: any) =>
              sendPushNotification(sub, payload).catch((err: any) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  (prisma as any).pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
                }
              })
            )
          ).catch((err) => console.error("[PUSH ERROR]", err));
        }
      } catch (pushErr) {
        console.error("[PUSH ERROR IN DECIDE ROUTE]", pushErr);
      }
    }

    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error("[friends/decide]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
