import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Follow a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { followingId } = await request.json();
    
    if (!followingId || typeof followingId !== "string") {
      return NextResponse.json({ error: "Invalid followingId" }, { status: 400 });
    }

    // Prevent self-follow
    if (session.user.id === followingId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: "Already following" }, { status: 409 });
    }

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, handle: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: followingId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      follow: {
        id: follow.id,
        followingId: follow.followingId,
        createdAt: follow.createdAt,
      }
    });

  } catch (error) {
    console.error("[follow POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get("followingId");

    if (!followingId || typeof followingId !== "string") {
      return NextResponse.json({ error: "Invalid followingId" }, { status: 400 });
    }

    // Delete follow relationship
    const deletedFollow = await prisma.follow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId: followingId,
      },
    });

    if (deletedFollow.count === 0) {
      return NextResponse.json({ error: "Not following this user" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[follow DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Check follow status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get("followingId");

    if (!followingId || typeof followingId !== "string") {
      return NextResponse.json({ error: "Invalid followingId" }, { status: 400 });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: followingId,
        },
      },
    });

    return NextResponse.json({ 
      isFollowing: !!follow,
      follow: follow ? {
        id: follow.id,
        createdAt: follow.createdAt,
      } : null
    });

  } catch (error) {
    console.error("[follow GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
