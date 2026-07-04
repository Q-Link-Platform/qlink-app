import { prisma } from "../src/lib/prisma";
import { prismaAttachments } from "../src/lib/prismaAttachments";

async function main() {
  console.log("Fetching latest 5 messages...");
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log("Latest Messages:\n", JSON.stringify(messages, null, 2));

  const messageIds = messages.map((m) => m.id);
  console.log("\nFetching corresponding attachments from Attachments DB...");
  const attachments = await prismaAttachments.attachment.findMany({
    where: {
      messageId: { in: messageIds },
    },
  });

  console.log("Found Attachments:\n", JSON.stringify(attachments, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  }, 2));
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    prismaAttachments.$disconnect();
  });
