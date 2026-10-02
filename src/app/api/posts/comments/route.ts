import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Add a comment to a post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, text } = await request.json();
    
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    if (text.trim().length > 1000) {
      return NextResponse.json({ error: "Comment too long (max 1000 characters)" }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        authorId: session.user.id,
        content: text.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            handle: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
      }
    });

  } catch (error) {
    console.error("[comments POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

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

    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            handle: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    });

    const totalComments = await prisma.comment.count({
      where: { postId: postId },
    });

    return NextResponse.json({
      comments: comments.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
      })),
      pagination: {
        page,
        limit,
        total: totalComments,
        totalPages: Math.ceil(totalComments / limit),
        hasMore: skip + comments.length < totalComments,
      },
    });

  } catch (error) {
    console.error("[comments GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId || typeof commentId !== "string") {
      return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
    }

    // Find the comment and verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Allow deletion if user is comment author or post author
    if (comment.authorId !== session.user.id && comment.post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[comments DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
