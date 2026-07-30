import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function checkDatabase() {
  console.log("=== CHECKING PRIMARY POSTGRES DATABASE ===");
  try {
    const postCount = await prisma.post.count();
    console.log(`Total Posts in DB: ${postCount}`);

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            name: true,
          },
        },
      },
    });

    console.log("Latest Posts:", JSON.stringify(posts, null, 2));
  } catch (err: any) {
    console.error("PRIMARY DB ERROR:", err.message);
  }

  console.log("\n=== CHECKING ATTACHMENTS POSTGRES DATABASE ===");
  try {
    const attachCount = await prismaAttachments.attachment.count();
    console.log(`Total Attachments in DB: ${attachCount}`);

    const attachments = await prismaAttachments.attachment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const safeAttachments = attachments.map((a) => ({
      ...a,
      sizeBytes: a.sizeBytes ? a.sizeBytes.toString() : "0",
    }));

    console.log("Latest Attachments:", JSON.stringify(safeAttachments, null, 2));

    if (attachments.length > 0) {
      console.log("\n=== TESTING SUPABASE STORAGE SIGNED / PUBLIC URLS ===");
      const client = supabasePostsAdmin || supabasePosts;
      console.log("Using Supabase Client:", client ? (supabasePostsAdmin ? "Admin (Service Role)" : "Anon") : "NONE");

      for (const a of attachments.slice(0, 5)) {
        if (!client) {
          console.log(`No Supabase client available for ${a.id}`);
          continue;
        }

        const signedRes = await client.storage
          .from(a.bucket)
          .createSignedUrl(a.objectKey, 60 * 60);

        const pubRes = client.storage
          .from(a.bucket)
          .getPublicUrl(a.objectKey);

        console.log(`\nAttachment ID ${a.id} (${a.kind}):`);
        console.log(`- Bucket: ${a.bucket}, ObjectKey: ${a.objectKey}`);
        console.log(`- Status: ${a.status}, PostID: ${a.postId}, MessageID: ${a.messageId}`);
        console.log(`- Signed URL Result:`, signedRes.data?.signedUrl || signedRes.error?.message || "NULL");
        console.log(`- Public URL Result:`, pubRes.data?.publicUrl || "NULL");
      }
    }
  } catch (err: any) {
    console.error("ATTACHMENTS DB ERROR:", err.message);
  }
}

checkDatabase()
  .catch((e) => console.error("Script exception:", e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
