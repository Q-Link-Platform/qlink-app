import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      handle: true,
      name: true,
      publicKeyString: true,
      encryptedPrivateKey: true,
    }
  });
  console.log("USERS KEY STATUS:");
  users.forEach(u => {
    console.log(`- ${u.handle || u.name || u.id}:`);
    console.log(`  Public Key: ${u.publicKeyString ? "Present (" + u.publicKeyString.substring(0, 40) + "...)" : "Missing"}`);
    console.log(`  Encrypted Private Key: ${u.encryptedPrivateKey ? "Present (" + u.encryptedPrivateKey.substring(0, 40) + "...)" : "Missing"}`);
  });
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
