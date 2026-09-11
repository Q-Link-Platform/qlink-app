import { findSyntheticUser } from "@/lib/globalMockDirectory";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cleanHandle } from "@/lib/handle-utils";

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

    const raw = toHandle.trim();
    const cleaned = cleanHandle(raw);

    const toUser = await prisma.user.findFirst({
      where: {
        OR: [
          { handle: { equals: raw, mode: "insensitive" } },
          { handle: { equals: cleaned, mode: "insensitive" } },
          { email: { equals: raw, mode: "insensitive" } },
          { id: raw },
          { name: { contains: cleaned, mode: "insensitive" } },
        ],
      },
    });

    if (!toUser) {
      // Seamlessly handle connection requests to global synthetic ecosystem profiles
      const synthTarget = findSyntheticUser(cleaned) || findSyntheticUser(raw);
      if (synthTarget) {
        const concatenatedCategories = (categories as string[])
          .map((c) => c.trim())
          .filter(Boolean)
          .join(",");

        const synthRequest = {
          id: `synth_req_${synthTarget.id}`,
          fromUserId,
          toUserId: synthTarget.id,
          categories: concatenatedCategories,
          message: typeof message === "string" && message.trim() ? message.trim() : null,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          toUser: synthTarget,
        };

        // Read existing synthetic requests from cookie
        let existingSynthReqs: any[] = [];
        try {
          const cookieHeader = request.headers.get("cookie") || "";
          const match = cookieHeader.match(/ql_synth_reqs=([^;]+)/);
          if (match && match[1]) {
            existingSynthReqs = JSON.parse(decodeURIComponent(match[1]));
          }
        } catch {}

        const filtered = existingSynthReqs.filter((r: any) => r.toUserId !== synthTarget.id);
        const updatedSynthReqs = [synthRequest, ...filtered].slice(0, 30);

        const response = NextResponse.json({ request: synthRequest });
        response.cookies.set("ql_synth_reqs", encodeURIComponent(JSON.stringify(updatedSynthReqs)), {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: "lax",
        });

        return response;
      }

      return NextResponse.json({ error: `Target user "@${toHandle}" not found` }, { status: 404 });
    }

    if (toUser.id === fromUserId) {
      return NextResponse.json({ error: "You cannot send a request to yourself" }, { status: 400 });
    }

    const concatenatedCategories = (categories as string[])
      .map((c) => c.trim())
      .filter(Boolean)
      .join(",");

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId, toUserId: toUser.id },
          { fromUserId: toUser.id, toUserId: fromUserId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    let friendRequest;
    if (existingRequest) {
      friendRequest = await prisma.friendRequest.update({
        where: { id: existingRequest.id },
        data: {
          fromUserId,
          toUserId: toUser.id,
          categories: concatenatedCategories,
          message: typeof message === "string" && message.trim() ? message.trim() : null,
          status: existingRequest.status === "REJECTED" ? "PENDING" : existingRequest.status,
        },
      });
    } else {
      friendRequest = await prisma.friendRequest.create({
        data: {
          fromUserId,
          toUserId: toUser.id,
          categories: concatenatedCategories,
          message: typeof message === "string" && message.trim() ? message.trim() : null,
        },
      });
    }

    try {
      const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
        where: { userId: toUser.id },
      });

      if (pushSubscriptions && pushSubscriptions.length > 0) {
        const senderHandle = (session.user as any).handle || "Someone";
        const payload = {
          title: "New Connection Request!",
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
