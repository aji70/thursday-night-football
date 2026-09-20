import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (const number of [1, 2, 3, 4]) {
    await prisma.team.upsert({
      where: { number },
      update: {},
      create: {
        number,
        name: `Team ${number}`,
      },
    });
  }
  console.log("Seeded Teams 1–4");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
