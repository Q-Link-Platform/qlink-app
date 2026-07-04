import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating all posts to set expiresAt to year 2126 (100 years in future)...");
  
  // Set expiration date to 100 years in the future
  const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
  
  const result = await prisma.post.updateMany({
    data: {
      expiresAt: farFuture,
    },
  });
  
  console.log(`Successfully updated ${result.count} posts.`);
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
