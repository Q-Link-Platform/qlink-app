import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  findManyAttachmentRecords,
  createAttachmentLogRecord,
  updateAttachmentRecord,
  deleteAttachmentRecord,
} from "@/lib/attachmentDb";
import { supabasePosts } from "@/lib/supabasePosts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization");
    const expected = process.env.POSTS_CLEANUP_TOKEN;

    if (!expected || !token || token !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expired: Array<{ id: string; attachmentId: string | null }> = await (prisma as any).post.findMany({
      where: {
        audience: { notIn: ["GLOBAL", "ALL"] },
        OR: [{ expiresAt: { lt: cutoff } }, { expiresAt: { lte: new Date() } }],
      },
      take: 200,
      select: {
        id: true,
        attachmentId: true,
      },
    });

    if (!expired.length) {
      return NextResponse.json({ deleted: 0 });
    }

    const attachmentIds: string[] = expired
      .map((p) => p.attachmentId)
      .filter((id): id is string => Boolean(id));

    if (attachmentIds.length && supabasePosts) {
      const attachments = await findManyAttachmentRecords(attachmentIds, {
        id: true,
        bucket: true,
        objectKey: true,
      });

      for (const a of attachments) {
        try {
          const { error } = await supabasePosts.storage
            .from(a.bucket)
            .remove([a.objectKey]);

          if (error) {
            console.error("[posts/cleanup] Storage remove error", a.id, error.message);
            continue;
          }
        } catch (err) {
          console.error("[posts/cleanup] Storage remove exception", a.id, err);
          continue;
        }

        try {
          await createAttachmentLogRecord({
            data: {
              attachmentId: a.id,
              event: "auto-delete-24h-post",
            },
          });
          await updateAttachmentRecord(a.id, { status: "deleted" });
          await deleteAttachmentRecord(a.id);
        } catch (err) {
          console.error("[posts/cleanup] Failed to delete attachment row", a.id, err);
        }
      }
    }

    // Cascade deletes will remove reactions/comments/views.
    const deleteResult = await (prisma as any).post.deleteMany({
      where: { id: { in: expired.map((p) => p.id) } },
    });

    return NextResponse.json({ deleted: deleteResult.count });
  } catch (err) {
    console.error("[posts/cleanup] Unhandled error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
