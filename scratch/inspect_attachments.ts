import { prismaAttachments } from '../src/lib/prismaAttachments';

async function main() {
  console.log("Querying latest 10 attachments from secondary database...");
  const attachments = await prismaAttachments.attachment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("Attachments:", attachments);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    // Wait for prismaAttachments to disconnect if needed
  });
