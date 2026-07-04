import { prismaAttachments } from '../src/lib/prismaAttachments';

async function main() {
  const attachmentId = "cmpxnxkn30000hcxqkhiepjip";
  const att = await (prismaAttachments as any).attachment.findUnique({
    where: { id: attachmentId }
  });
  if (att) {
    console.log("Attachment ID:", att.id);
    console.log("Kind:", att.kind);
    console.log("MimeType:", att.mimeType);
    console.log("Status:", att.status);
    console.log("Bucket:", att.bucket);
    console.log("ObjectKey:", att.objectKey);
  } else {
    console.log("Attachment not found.");
  }
}

main().catch(err => console.error(err));
