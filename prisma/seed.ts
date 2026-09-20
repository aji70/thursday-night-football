import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SOLE_ADMIN_PHONE = (process.env.ADMIN_PHONE || "08060332714").replace(
  /\s+/g,
  "",
);

async function main() {
  for (const number of [1, 2, 3, 4]) {
    await prisma.team.upsert({
      where: { number },
      update: {},
      create: { number, name: `Team ${number}` },
    });
  }

  await prisma.player.updateMany({ data: { isAdmin: false } });

  const admin = await prisma.player.findUnique({
    where: { phone: SOLE_ADMIN_PHONE },
  });
  if (admin) {
    await prisma.player.update({
      where: { id: admin.id },
      data: { isAdmin: true, status: "active", seat: "permanent" },
    });
    console.log(`Sole admin (regular seat): ${admin.name} (${SOLE_ADMIN_PHONE})`);
  }

  // Keep carryover only — do not auto-mark player payments.
  const carryTitle = "Carryover (before 24 Sep 2026)";
  const existingCarry = await prisma.purseLedger.findFirst({
    where: { title: carryTitle },
  });
  if (!existingCarry) {
    await prisma.purseLedger.create({
      data: {
        kind: "CARRYOVER",
        title: carryTitle,
        amount: 53000,
        note: "Opening squad purse balance",
      },
    });
    console.log("Carryover ₦53,000 recorded");
  }

  // Remove stub placeholder players — real people register themselves.
  const removedStubs = await prisma.player.deleteMany({
    where: {
      phone: { in: ["pending-martinez", "pending-gabriel"] },
    },
  });
  if (removedStubs.count > 0) {
    console.log(`Removed ${removedStubs.count} stub player(s)`);
  }

  console.log("Seeded Teams 1–4 + carryover (no player payments)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
