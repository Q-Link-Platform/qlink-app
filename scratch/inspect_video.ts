import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function inspectVideo() {
  console.log("=== DEEP VIDEO MEDIA INSPECTION ===");

  const post = await prisma.post.findFirst({
    where: { attachmentKind: "video" },
    orderBy: { createdAt: "desc" },
  });

  if (!post || !post.attachmentId) {
    console.log("No video post found.");
    return;
  }

  const att = await prismaAttachments.attachment.findUnique({
    where: { id: post.attachmentId },
  });

  console.log("Post:", post.id);
  console.log("Attachment:", att);

  if (!att) return;

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) {
    console.log("No Supabase client available");
    return;
  }

  const signed = await client.storage.from(att.bucket).createSignedUrl(att.objectKey, 3600);
  const pub = client.storage.from(att.bucket).getPublicUrl(att.objectKey);

  const signedUrl = signed.data?.signedUrl;
  const publicUrl = pub.data?.publicUrl;

  console.log("\nSigned URL:", signedUrl);
  console.log("Public URL:", publicUrl);

  if (signedUrl) {
    console.log("\n--- Testing GET Byte Range Request on Signed URL ---");
    try {
      const res = await fetch(signedUrl, {
        headers: { Range: "bytes=0-1024" },
      });
      console.log("Status:", res.status, res.statusText);
      console.log("Headers:");
      res.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
    } catch (e: any) {
      console.error("Signed URL fetch failed:", e.message);
    }
  }

  if (publicUrl) {
    console.log("\n--- Testing GET Byte Range Request on Public URL ---");
    try {
      const res = await fetch(publicUrl, {
        headers: { Range: "bytes=0-1024" },
      });
      console.log("Status:", res.status, res.statusText);
      console.log("Headers:");
      res.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
    } catch (e: any) {
      console.error("Public URL fetch failed:", e.message);
    }
  }
}

inspectVideo()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
