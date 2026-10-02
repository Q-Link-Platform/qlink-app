import { prismaAttachments } from '../src/lib/prismaAttachments';

async function main() {
  const attachmentId = "cmpwbditt00001osa1n49s2ky";
  console.log(`Querying attachment ${attachmentId}...`);
  const attachment = await prismaAttachments.attachment.findUnique({
    where: { id: attachmentId }
  });
  console.log("Attachment:", attachment);
}

main().catch(e => console.error(e));
