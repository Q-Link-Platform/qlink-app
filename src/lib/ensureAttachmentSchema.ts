import { prisma } from "./prisma";

let schemaEnsured = false;

/**
 * Self-healing schema initializer.
 * Guarantees that "Attachment" and "AttachmentLog" tables exist in any PostgreSQL database
 * (Vercel, Supabase, Neon, staging, or production) without requiring manual migrations.
 */
export async function ensureAttachmentSchema(): Promise<void> {
  if (schemaEnsured) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Attachment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "messageId" TEXT,
        "roomId" TEXT,
        "senderId" TEXT,
        "postId" TEXT,
        "kind" TEXT NOT NULL,
        "bucket" TEXT NOT NULL,
        "objectKey" TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "sizeBytes" BIGINT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'uploaded',
        "error" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Attachment_messageId_idx" ON "Attachment"("messageId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Attachment_postId_idx" ON "Attachment"("postId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AttachmentLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "attachmentId" TEXT NOT NULL,
        "event" TEXT NOT NULL,
        "ip" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AttachmentLog_attachmentId_idx" ON "AttachmentLog"("attachmentId");
    `);

    schemaEnsured = true;
    console.log("[ensureAttachmentSchema] Attachment and AttachmentLog tables verified/created successfully.");
  } catch (err: any) {
    console.warn("[ensureAttachmentSchema] Schema verification warning:", err?.message || err);
  }
}
