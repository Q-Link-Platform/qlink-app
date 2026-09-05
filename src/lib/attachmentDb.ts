import { prisma } from "./prisma";
import { prismaAttachments } from "./prismaAttachments";
import { ensureAttachmentSchema } from "./ensureAttachmentSchema";

function isTableMissingOrDbError(err: any): boolean {
  if (!err) return false;
  if (err.code === "P2021" || err.code === "P1001" || err.code === "P1017") return true;
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("table") ||
    msg.includes("can't reach database server")
  );
}

/**
 * Resilient, self-healing Attachment creator.
 * Tech-giant standard: Attempts primary attachments database; if table is missing or DB unreachable,
 * it runs schema DDL on the fly and seamlessly falls back to the main database.
 */
export async function createAttachmentRecord(args: { data: any; select?: any }) {
  await ensureAttachmentSchema();

  try {
    return await (prismaAttachments as any).attachment.create(args);
  } catch (err1: any) {
    console.warn("[attachmentDb] prismaAttachments.attachment.create failed, inspecting...", err1?.message || err1);

    if (isTableMissingOrDbError(err1)) {
      // Force execute DDL on prismaAttachments & retry
      await ensureAttachmentSchema(true);
      try {
        return await (prismaAttachments as any).attachment.create(args);
      } catch (retryErr: any) {
        console.warn("[attachmentDb] prismaAttachments retry failed, falling back to primary prisma DB:", retryErr?.message || retryErr);
      }
    }

    // Seamless fallback to primary database
    try {
      return await (prisma as any).attachment.create(args);
    } catch (err2: any) {
      if (isTableMissingOrDbError(err2)) {
        await ensureAttachmentSchema(true);
        return await (prisma as any).attachment.create(args);
      }
      throw err2;
    }
  }
}

/**
 * Resilient Attachment Log creator.
 */
export async function createAttachmentLogRecord(args: { data: any }) {
  try {
    return await (prismaAttachments as any).attachmentLog.create(args);
  } catch (err: any) {
    try {
      return await (prisma as any).attachmentLog.create(args);
    } catch (fallbackErr) {
      console.warn("[attachmentDb] Non-critical attachment log save skipped:", fallbackErr);
      return null;
    }
  }
}

/**
 * Resilient findUnique for attachments across both databases.
 */
export async function findAttachmentRecord(id: string, select?: any) {
  if (!id) return null;
  try {
    const res = await (prismaAttachments as any).attachment.findUnique({
      where: { id },
      ...(select ? { select } : {}),
    });
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingOrDbError(err)) {
      console.warn("[attachmentDb] findUnique warning on prismaAttachments:", err?.message);
    }
  }

  try {
    return await (prisma as any).attachment.findUnique({
      where: { id },
      ...(select ? { select } : {}),
    });
  } catch (err) {
    return null;
  }
}

/**
 * Resilient findMany for attachments across both databases.
 */
export async function findManyAttachmentRecords(ids: string[], select?: any) {
  if (!ids || !ids.length) return [];

  let records: any[] = [];
  try {
    records = await (prismaAttachments as any).attachment.findMany({
      where: { id: { in: ids } },
      ...(select ? { select } : {}),
    });
  } catch (err: any) {
    console.warn("[attachmentDb] findMany on prismaAttachments fallback to prisma:", err?.message);
  }

  const foundIds = new Set(records.map((r: any) => r.id));
  const missingIds = ids.filter((id) => !foundIds.has(id));

  if (missingIds.length > 0) {
    try {
      const fallbackRecords = await (prisma as any).attachment.findMany({
        where: { id: { in: missingIds } },
        ...(select ? { select } : {}),
      });
      records = [...records, ...(fallbackRecords || [])];
    } catch (err) {
      // Return what we have
    }
  }

  return records;
}

/**
 * Resilient update for attachments.
 */
export async function updateAttachmentRecord(id: string, data: any, select?: any) {
  try {
    return await (prismaAttachments as any).attachment.update({
      where: { id },
      data,
      ...(select ? { select } : {}),
    });
  } catch (err: any) {
    return await (prisma as any).attachment.update({
      where: { id },
      data,
      ...(select ? { select } : {}),
    });
  }
}

/**
 * Resilient delete for attachments.
 */
export async function deleteAttachmentRecord(id: string) {
  try {
    await (prismaAttachments as any).attachment.delete({ where: { id } });
  } catch {
    try {
      await (prisma as any).attachment.delete({ where: { id } });
    } catch {}
  }
}
