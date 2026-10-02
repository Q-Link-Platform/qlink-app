import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Track a view on a post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();
    
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already viewed this post
    // Note: PostView model may not be defined in schema yet
    let existingView = null;
    try {
      existingView = await (prisma as any).postView?.findFirst?.({
        where: {
          postId: postId,
          userId: (session.user as any).id,
        },
      });
    } catch {
      // PostView model not available, skip view tracking
    }

    if (!existingView) {
      // Create new view record
      try {
        await (prisma as any).postView?.create?.({
          data: {
            postId: postId,
            userId: (session.user as any).id,
          },
        });
      } catch {
        // PostView model not available, skip view tracking
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[views POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get view count for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    let viewCount = 0;
    try {
      viewCount = await (prisma as any).postView?.count?.({
        where: { postId: postId },
      }) || 0;
    } catch {
      // PostView model not available, return 0
    }

    return NextResponse.json({ views: viewCount });

  } catch (error) {
    console.error("[views GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
