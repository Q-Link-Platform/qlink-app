import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function checkCodec() {
  console.log("=== CHECKING EXACT MP4 VIDEO CODECS IN STORAGE ===");

  const posts = await prisma.post.findMany({
    where: { attachmentKind: "video" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) return;

  for (const post of posts) {
    if (!post.attachmentId) continue;
    const att = await prismaAttachments.attachment.findUnique({
      where: { id: post.attachmentId },
    });

    if (!att) continue;

    console.log(`\nPost ID: ${post.id}`);
    console.log(`File Name: ${att.originalName}`);
    console.log(`ObjectKey: ${att.objectKey}`);

    const { data } = await client.storage.from(att.bucket).download(att.objectKey);
    if (!data) continue;

    const buffer = Buffer.from(await data.arrayBuffer());

    // Search for codec string in MP4 atoms
    const str = buffer.toString("binary");
    const codecs = ["avc1", "avc3", "hvc1", "hev1", "mp4v", "vp09", "av01", "mp4a", "ac-3"];

    console.log("Detected Codec Identifiers:");
    for (const c of codecs) {
      if (str.includes(c)) {
        console.log(`  - Found Codec Tag: '${c}'`);
      }
    }
  }
}

checkCodec()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
