import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Querying latest 5 posts from main database...");
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      author: {
        select: {
          handle: true
        }
      }
    }
  });
  console.log("Latest Posts:", JSON.stringify(posts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
