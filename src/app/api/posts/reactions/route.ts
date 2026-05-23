import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Toggle reaction (like/dislike) on a post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, value } = await request.json();
    
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    if (!value || (value !== 1 && value !== -1)) {
      return NextResponse.json({ error: "Invalid reaction value. Must be 1 (like) or -1 (dislike)" }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check for existing reaction
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id,
        },
      },
    });

    let reaction;
    
    if (existingReaction) {
      if (existingReaction.type === (value === 1 ? 'LIKE' : 'DISLIKE')) {
        // Remove reaction if clicking the same type
        reaction = await prisma.reaction.delete({
          where: {
            postId_userId: {
              postId: postId,
              userId: session.user.id,
            },
          },
        });
        return NextResponse.json({ 
          success: true, 
          action: "removed",
          reaction: null
        });
      } else {
        // Update reaction type
        reaction = await prisma.reaction.update({
          where: {
            postId_userId: {
              postId: postId,
              userId: session.user.id,
            },
          },
          data: {
            type: value === 1 ? 'LIKE' : 'DISLIKE',
          },
        });
        return NextResponse.json({ 
          success: true, 
          action: "updated",
          reaction: {
            id: reaction.id,
            value: reaction.type === 'LIKE' ? 1 : -1,
            createdAt: reaction.createdAt,
          }
        });
      }
    } else {
      // Create new reaction
      reaction = await prisma.reaction.create({
        data: {
          postId: postId,
          userId: session.user.id,
          type: value === 1 ? 'LIKE' : 'DISLIKE',
        },
      });
      return NextResponse.json({ 
        success: true, 
        action: "created",
        reaction: {
          id: reaction.id,
          value: reaction.type === 'LIKE' ? 1 : -1,
          createdAt: reaction.createdAt,
        }
      });
    }

  } catch (error) {
    console.error("[reactions POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get reaction data for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    // Get reaction counts
    const reactionCounts = await prisma.reaction.groupBy({
      by: ['type'],
      where: { postId: postId },
      _count: {
        type: true,
      },
    });

    const likes = reactionCounts.find((r: any) => r.type === 'LIKE')?._count.type || 0;
    const dislikes = reactionCounts.find((r: any) => r.type === 'DISLIKE')?._count.type || 0;

    // Get current user's reaction if authenticated
    let userReaction = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const reaction = await prisma.reaction.findUnique({
        where: {
          postId_userId: {
            postId: postId,
            userId: session.user.id,
          },
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      });
      userReaction = reaction ? {
        id: reaction.id,
        value: reaction.type === 'LIKE' ? 1 : -1,
        createdAt: reaction.createdAt,
      } : null;
    }

    return NextResponse.json({
      likes,
      dislikes,
      total: likes + dislikes,
      userReaction,
    });

  } catch (error) {
    console.error("[reactions GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
