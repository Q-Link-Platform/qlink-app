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

    let toUser = await prisma.user.findFirst({
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
        // Upsert synthetic user into database to ensure genuine persistence and zero cookie bloat
        let resolvedUser = await prisma.user.findFirst({
          where: {
            OR: [
              { handle: { equals: synthTarget.handle, mode: "insensitive" } },
              { id: synthTarget.id },
            ],
          },
        });
        if (!resolvedUser) {
          resolvedUser = await prisma.user.create({
            data: {
              id: synthTarget.id,
              handle: synthTarget.handle,
              name: synthTarget.displayName || synthTarget.name || synthTarget.handle,
              publicKeyString: synthTarget.publicKey || null,
              image: synthTarget.avatarUrl || null,
              bio: synthTarget.bio || null,
            },
          }).catch(async () => {
            return await prisma.user.findFirst({
              where: {
                OR: [
                  { handle: { equals: synthTarget.handle, mode: "insensitive" } },
                  { id: synthTarget.id },
                ],
              },
            });
          });
        }
        if (resolvedUser) {
          toUser = resolvedUser;
        }
      }

      if (!toUser) {
        return NextResponse.json({ error: `Target user "@${toHandle}" not found` }, { status: 404 });
      }
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

    const response = NextResponse.json({ request: friendRequest });
    response.cookies.delete("ql_synth_reqs");
    return response;
  } catch (err) {
    console.error("[friends/request]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
