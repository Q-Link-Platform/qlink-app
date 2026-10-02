import { prisma } from "../src/lib/prisma";
import { prismaAttachments } from "../src/lib/prismaAttachments";

async function checkGhorhh() {
  console.log("=== QUERYING GHORHH POSTS ===");
  const user = await prisma.user.findFirst({
    where: { handle: { contains: "ghorhh" } },
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("User found:", user.id, user.handle);

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  console.log(`User has ${posts.length} posts:`);
  for (const p of posts) {
    console.log(`\nPost ID: ${p.id}, text: ${p.text}, attachmentId: ${p.attachmentId}, attachmentKind: ${p.attachmentKind}, createdAt: ${p.createdAt}`);

    if (p.attachmentId) {
      const att = await prismaAttachments.attachment.findUnique({
        where: { id: p.attachmentId },
      });
      console.log(`Attachment details:`, att);

      if (att) {
        const publicUrl = `https://ansfsehkrddmrwnjspek.supabase.co/storage/v1/object/public/${att.bucket}/${att.objectKey}`;
        console.log(`Public URL: ${publicUrl}`);

        try {
          const res = await fetch(publicUrl, { method: "HEAD" });
          console.log(`HEAD status: ${res.status} ${res.statusText}`);
          console.log(`Content-Type: ${res.headers.get("content-type")}`);
          console.log(`Content-Length: ${res.headers.get("content-length")}`);
        } catch (err: any) {
          console.error(`HEAD fetch error: ${err.message}`);
        }
      }
    }
  }
}

checkGhorhh().catch(console.error);
