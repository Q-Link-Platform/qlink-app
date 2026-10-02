import { prisma } from "../src/lib/prisma";
import { prismaAttachments } from "../src/lib/prismaAttachments";

async function testMainDB() {
  console.log("Testing Main DB...");
  const start = Date.now();
  try {
    const userCount = await prisma.user.count();
    console.log(`Main DB connected successfully! User count: ${userCount} (Took ${Date.now() - start}ms)`);
  } catch (err: any) {
    console.error("Main DB connection failed:", err.message || err);
  }
}

async function testAttachmentsDB() {
  console.log("Testing Attachments DB...");
  const start = Date.now();
  try {
    const attachmentCount = await prismaAttachments.attachment.count();
    console.log(`Attachments DB connected successfully! Attachment count: ${attachmentCount} (Took ${Date.now() - start}ms)`);
  } catch (err: any) {
    console.error("Attachments DB connection failed:", err.message || err);
  }
}

async function run() {
  await testMainDB();
  await testAttachmentsDB();
}

run()
  .then(() => {
    prisma.$disconnect();
    prismaAttachments.$disconnect();
  })
  .catch(console.error);
