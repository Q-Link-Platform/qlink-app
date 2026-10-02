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

    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }

    const meId = (session.user as any).id as string;

    // 1. Fetch message to check ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== meId) {
      return NextResponse.json(
        { error: "Forbidden: You are not the sender of this message" },
        { status: 403 }
      );
    }

    // 2. Fetch attachments associated with this message
    try {
      const attachments = await prismaAttachments.attachment.findMany({
        where: { messageId },
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
              `[attachments/delete] Supabase delete error for key ${a.objectKey}`,
              storageErr
            );
          }
        }

        // Delete attachment record
        await prismaAttachments.attachment.delete({
          where: { id: a.id },
        });
      }
    } catch (attachErr) {
      console.error(
        "[attachments/delete] Error deleting attachments metadata",
        attachErr
      );
    }

    // 3. Delete the message from the main database
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[chat/delete] Error deleting message", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
