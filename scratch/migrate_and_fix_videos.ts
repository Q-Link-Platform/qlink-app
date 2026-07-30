import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";
import { relocateMoovToStart } from "./faststart_mp4";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function migrateAndFixVideos() {
  console.log("=== MIGRATING EXISTING MP4 VIDEOS TO FASTSTART (moov at start) ===");

  const posts = await prisma.post.findMany({
    where: { attachmentKind: "video" },
    orderBy: { createdAt: "desc" },
  });

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) return;

  for (const post of posts) {
    if (!post.attachmentId) continue;
    const att = await prismaAttachments.attachment.findUnique({
      where: { id: post.attachmentId },
    });

    if (!att) continue;

    console.log(`\nProcessing Post ID: ${post.id} (${att.originalName})`);
    console.log(`Bucket: ${att.bucket} | ObjectKey: ${att.objectKey}`);

    const { data, error } = await client.storage.from(att.bucket).download(att.objectKey);
    if (error || !data) {
      console.error("Download error:", error);
      continue;
    }

    const rawBuffer = Buffer.from(await data.arrayBuffer());
    console.log(`Original buffer size: ${rawBuffer.length} bytes.`);

    const faststartBuffer = relocateMoovToStart(rawBuffer);

    if (faststartBuffer.length === rawBuffer.length) {
      console.log("Uploading optimized faststart MP4 back to Supabase Storage...");
      const { error: uploadErr } = await client.storage
        .from(att.bucket)
        .upload(att.objectKey, faststartBuffer, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (uploadErr) {
        console.error("Upload error:", uploadErr);
      } else {
        console.log("✅ Successfully updated Supabase Storage object to FastStart MP4 format!");
      }
    }
  }
}

migrateAndFixVideos()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
