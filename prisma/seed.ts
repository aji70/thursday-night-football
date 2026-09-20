import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Sole admin phone — Aji. Override with ADMIN_PHONE env if needed. */
const SOLE_ADMIN_PHONE = (process.env.ADMIN_PHONE || "08060332714").replace(
  /\s+/g,
  "",
);

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

  // Only one admin: clear all, then grant Aji.
  await prisma.player.updateMany({ data: { isAdmin: false } });

  const admin = await prisma.player.findUnique({
    where: { phone: SOLE_ADMIN_PHONE },
  });

  if (admin) {
    await prisma.player.update({
      where: { id: admin.id },
      data: {
        isAdmin: true,
        status: "active",
      },
    });
    console.log(`Sole admin: ${admin.name} (${SOLE_ADMIN_PHONE}) — active`);
  } else {
    console.log(
      `No player with phone ${SOLE_ADMIN_PHONE} yet — admin will be granted on next seed after they register.`,
    );
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
