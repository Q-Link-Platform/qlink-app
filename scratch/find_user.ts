import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function main() {
  console.log("Searching for user majidhafiz371-2392 or Mamoona Munir...");

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { handle: { contains: "majid", mode: "insensitive" } },
        { name: { contains: "Mamoona", mode: "insensitive" } },
        { email: { contains: "majid", mode: "insensitive" } },
      ],
    },
    include: {
      accounts: true,
      sessions: true,
      pushSubscriptions: true,
    },
  });

  console.log(`Found ${users.length} matching user(s):`);
  console.log(JSON.stringify(users, null, 2));

  for (const user of users) {
    console.log(`\n--- Deep Audit for User: ${user.id} (@${user.handle}) ---`);

    // Check Attachment logs for IP addresses
    const attachmentLogs = await prismaAttachments.attachmentLog.findMany({
      where: {
        attachment: {
          senderId: user.id,
        },
      },
      select: {
        id: true,
        event: true,
        ip: true,
        userAgent: true,
        createdAt: true,
      },
      take: 20,
    });
    console.log("Attachment Logs (IP & UserAgent):", JSON.stringify(attachmentLogs, null, 2));

    // Check Sent Friend Requests
    const friendReqs = await prisma.friendRequest.findMany({
      where: {
        OR: [{ fromUserId: user.id }, { toUserId: user.id }],
      },
      take: 10,
    });
    console.log("Friend Requests:", JSON.stringify(friendReqs, null, 2));

    // Check Messages
    const messages = await prisma.message.findMany({
      where: { senderId: user.id },
      take: 10,
    });
    console.log("Messages count:", messages.length);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
