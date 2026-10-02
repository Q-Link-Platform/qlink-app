import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Get followers for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all followers for current user
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId, // Users who follow current user
      },
      include: {
        follower: {
          select: {
            id: true,
            handle: true,
            name: true,
            image: true,
            aura_percentage: true,
            blue_tick_status: true,
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedFollowers = followers.map(follow => ({
      id: follow.follower.id,
      handle: follow.follower.handle,
      name: follow.follower.name,
      image: follow.follower.image,
      auraPercentage: follow.follower.aura_percentage,
      blueTickStatus: follow.follower.blue_tick_status,
      points: follow.follower.points,
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      followers: formattedFollowers,
      count: formattedFollowers.length,
    });

  } catch (error) {
    console.error("[followers GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
