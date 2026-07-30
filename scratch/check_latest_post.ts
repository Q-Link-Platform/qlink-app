import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function checkLatestPost() {
  console.log("=== CHECKING LATEST POSTS & VIDEO MEDIA ===");
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: true },
  });

  console.log(`Found ${posts.length} posts:`);
  for (const p of posts) {
    console.log(`\nPost ID: ${p.id} | Author: @${p.author?.handle} | Text: "${p.text}" | AttachmentID: ${p.attachmentId} | Kind: ${p.attachmentKind}`);
    if (p.attachmentId) {
      const att = await prismaAttachments.attachment.findUnique({
        where: { id: p.attachmentId },
      });
      console.log(`Attachment details:`, att);

      if (att) {
        const client = supabasePostsAdmin || supabasePosts;
        if (client) {
          const signed = await client.storage.from(att.bucket).createSignedUrl(att.objectKey, 3600);
          const pub = client.storage.from(att.bucket).getPublicUrl(att.objectKey);
          console.log(`Signed URL:`, signed.data?.signedUrl || signed.error?.message);
          console.log(`Public URL:`, pub.data?.publicUrl);
        }
      }
    }
  }
}

checkLatestPost()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
