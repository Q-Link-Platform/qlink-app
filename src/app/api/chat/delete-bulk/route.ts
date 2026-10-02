import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { prismaAttachments } from "@/lib/prismaAttachments";
import { supabaseFiles } from "@/lib/supabaseFiles";
import { supabaseVideos } from "@/lib/supabaseVideos";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageIds } = await request.json();
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty messageIds list" },
        { status: 400 }
      );
    }

    const meId = (session.user as any).id as string;

    // 1. Fetch only the messages sent by the current user to verify ownership
    const ownMessages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        senderId: meId,
      },
      select: { id: true },
    });

    const ownMessageIds = ownMessages.map((m) => m.id);

    if (ownMessageIds.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: "No messages owned by user to delete",
      });
    }

    // 2. Query and clean up attachments associated with these user-owned messages
    try {
      const attachments = await prismaAttachments.attachment.findMany({
        where: {
          messageId: { in: ownMessageIds },
        },
      });

      for (const a of attachments) {
        // Delete file from Supabase storage
        const isVideo = a.kind === "video";
        const supabase = isVideo ? supabaseVideos : supabaseFiles;
        if (supabase) {
          const { error: storageErr } = await supabase.storage
            .from(a.bucket)
            .remove([a.objectKey]);
          if (storageErr) {
            console.error(
              `[attachments/delete-bulk] Supabase delete error for key ${a.objectKey}`,
              storageErr
            );
          }
        }
      }

      // Delete attachment records from DB
      await prismaAttachments.attachment.deleteMany({
        where: {
          messageId: { in: ownMessageIds },
        },
      });
    } catch (attachErr) {
      console.error(
        "[attachments/delete-bulk] Error cleaning up attachments",
        attachErr
      );
    }

    // 3. Delete messages from main database
    const deleteResult = await prisma.message.deleteMany({
      where: {
        id: { in: ownMessageIds },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (err) {
    console.error("[chat/delete-bulk] Error performing bulk delete", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
