import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdmin as checkIsAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!session || !session.user || !userEmail || !checkIsAdmin(userEmail)) {
      return NextResponse.json(
        { error: "Unauthorized: Platform Administrator clearance required." },
        { status: 403 }
      );
    }

    // Parallel fetch for speed
    const [totalUsers, verifiedUsers, totalPosts, totalConnections, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          blue_tick_status: { not: "NONE" },
        },
      }),
      prisma.post.count(),
      prisma.friendRequest.count(),
      prisma.user.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          createdAt: true,
          blue_tick_status: true,
          points: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              sessions: true,
              pushSubscriptions: true,
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      handle: u.handle ? `@${u.handle}` : "UNREGISTERED",
      rawHandle: u.handle || "",
      name: u.name || "Anonymous",
      email: u.email || "No email",
      createdAt: u.createdAt,
      blueTickStatus: u.blue_tick_status || "NONE",
      points: u.points || 0,
      postsCount: u._count.posts,
      commentsCount: u._count.comments,
      sessionsCount: u._count.sessions,
      pushCount: u._count.pushSubscriptions,
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        verifiedUsers,
        totalPosts,
        totalConnections,
        timestamp: new Date().toISOString(),
      },
      users: formattedUsers,
    });
  } catch (error) {
    console.error("[Admin Overview Error]:", error);
    return NextResponse.json(
      { error: "Failed to load admin overview metrics." },
      { status: 500 }
    );
  }
}
