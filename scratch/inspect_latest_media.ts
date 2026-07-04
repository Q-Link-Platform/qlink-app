import { prismaAttachments } from '../src/lib/prismaAttachments';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("Fetching latest posts...");
  const posts = await (prisma as any).post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Posts:", JSON.stringify(posts, null, 2));

  const attachmentIds = posts.map((p: any) => p.attachmentId).filter(Boolean);
  if (attachmentIds.length > 0) {
    console.log("Fetching attachments for IDs:", attachmentIds);
    const attachments = await (prismaAttachments as any).attachment.findMany({
      where: { id: { in: attachmentIds } }
    });
    console.log("Attachments:", JSON.stringify(attachments, null, 2));
  } else {
    console.log("No attachments found on latest posts.");
  }
}

main().catch(err => console.error(err));
