import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      handle: true,
      name: true,
      image: true,
      phoneNumber: true,
    }
  });
  console.log("ALL USERS:", JSON.stringify(users, null, 2));

  const posts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          handle: true,
          image: true,
        }
      }
    }
  });
  console.log("LATEST POSTS:", JSON.stringify(posts, null, 2));
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
