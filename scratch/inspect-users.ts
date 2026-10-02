import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      handle: true,
      email: true,
      name: true,
    }
  });
  console.log("Recent Users:\n", JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
