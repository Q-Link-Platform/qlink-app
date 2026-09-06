import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaAttachments } from "@/lib/prismaAttachments";
import { supabaseFiles } from "@/lib/supabaseFiles";
import { supabaseVideos } from "@/lib/supabaseVideos";

// Run in Node.js runtime so Supabase clients work correctly
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization");
    const expected = process.env.ATTACHMENTS_CLEANUP_TOKEN;

    if (!expected || !token || token !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const expired = await prismaAttachments.attachment.findMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
      },
      take: 500, // safety limit per run
    });

    if (!expired.length) {
      return NextResponse.json({ deleted: 0 });
    }

    let deletedCount = 0;

    for (const a of expired) {
      const isVideo = a.kind === "video";
      const supabase = isVideo ? supabaseVideos : supabaseFiles;

      if (!supabase) {
        // Skip if the appropriate client is not configured
        // eslint-disable-next-line no-console
        console.warn("[attachments/cleanup] Supabase client missing for kind", a.kind);
        continue;
      }

      try {
        const { error } = await supabase.storage.from(a.bucket).remove([a.objectKey]);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[attachments/cleanup] Storage remove error", a.id, error.message);
          continue;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[attachments/cleanup] Storage remove exception", a.id, err);
        continue;
      }

      try {
        await prismaAttachments.attachment.delete({ where: { id: a.id } });
        deletedCount += 1;

        // Clear references on any associated posts to prevent orphaned broken media
        try {
          await (prisma as any).post.updateMany({
            where: { attachmentId: a.id },
            data: { attachmentId: null, attachmentKind: null },
          });
        } catch {
          // non-critical post sync
        }

        await prismaAttachments.attachmentLog.create({
          data: {
            attachmentId: a.id,
            event: "auto-delete-24h",
          },
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[attachments/cleanup] Failed to delete DB row", a.id, err);
      }
    }

    return NextResponse.json({ deleted: deletedCount });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[attachments/cleanup] Unhandled error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
