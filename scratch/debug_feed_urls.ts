import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function debugFeedUrls() {
  console.log("=== DEBUGGING ALL POST VIDEO URLS ===");

  const posts = await prisma.post.findMany({
    where: { attachmentKind: "video" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log(`Found ${posts.length} video posts in DB:`);

  for (const post of posts) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Post ID: ${post.id} | CreatedAt: ${post.createdAt}`);
    console.log(`AttachmentId: ${post.attachmentId}`);

    if (!post.attachmentId) continue;

    const att = await prismaAttachments.attachment.findUnique({
      where: { id: post.attachmentId },
    });

    console.log(`Attachment:`, {
      id: att?.id,
      bucket: att?.bucket,
      objectKey: att?.objectKey,
      mimeType: att?.mimeType,
      status: att?.status,
    });

    if (!att) continue;

    const client = supabasePostsAdmin || supabasePosts;
    if (!client) {
      console.log("No Supabase client!");
      continue;
    }

    const signedRes = await client.storage.from(att.bucket).createSignedUrl(att.objectKey, 3600);
    const publicRes = client.storage.from(att.bucket).getPublicUrl(att.objectKey);

    const signedUrl = signedRes.data?.signedUrl;
    const publicUrl = publicRes.data?.publicUrl;

    console.log("Signed URL:", signedUrl);
    console.log("Public URL:", publicUrl);

    if (signedUrl) {
      console.log("\n[Testing Signed URL]");
      try {
        const res = await fetch(signedUrl, { headers: { Range: "bytes=0-200" } });
        console.log(`- GET Range status: ${res.status} ${res.statusText}`);
        console.log(`- Content-Type: ${res.headers.get("content-type")}`);
        console.log(`- Content-Length: ${res.headers.get("content-length")}`);
        console.log(`- Content-Range: ${res.headers.get("content-range")}`);
      } catch (err: any) {
        console.error("- Signed URL fetch error:", err.message);
      }
    }

    if (publicUrl) {
      console.log("\n[Testing Public URL]");
      try {
        const res = await fetch(publicUrl, { headers: { Range: "bytes=0-200" } });
        console.log(`- GET Range status: ${res.status} ${res.statusText}`);
        console.log(`- Content-Type: ${res.headers.get("content-type")}`);
        console.log(`- Content-Length: ${res.headers.get("content-length")}`);
        console.log(`- Content-Range: ${res.headers.get("content-range")}`);
      } catch (err: any) {
        console.error("- Public URL fetch error:", err.message);
      }
    }
  }
}

debugFeedUrls()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
