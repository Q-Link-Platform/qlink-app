import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetId = "cmn6vhans0008cv52blptq97r"; // Bhavesh Suthar
  
  console.log("Setting user to SAPPHIRE for integration test...");
  const user = await prisma.user.update({
    where: { id: targetId },
    data: {
      blue_tick_status: 'SAPPHIRE',
      aura_percentage: 150
    }
  });
  console.log("Database set to SAPPHIRE successfully:", user.blue_tick_status);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
