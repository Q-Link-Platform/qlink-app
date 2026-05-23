import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { handle: 'Rohit_7779' },
        { email: { contains: 'rohit', mode: 'insensitive' } }
      ]
    },
    select: { handle: true, email: true, name: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
