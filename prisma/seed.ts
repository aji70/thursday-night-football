import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

const SOLE_ADMIN_PHONE = (process.env.ADMIN_PHONE || "08060332714").replace(
  /\s+/g,
  "",
);

const CYCLE_KEY = "2026-09-cycle";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function ensurePlayer(name: string, phone: string) {
  const existing = await prisma.player.findUnique({ where: { phone } });
  if (existing) return existing;
  return prisma.player.create({
    data: {
      name,
      phone,
      passwordHash: hashPassword(`tnf-${createHash("sha1").update(phone).digest("hex").slice(0, 8)}`),
      status: "active",
      seat: "sub",
    },
  });
}

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
      data: { isAdmin: true, status: "active" },
    });
    console.log(`Sole admin: ${admin.name} (${SOLE_ADMIN_PHONE})`);
  }

  // Carryover ₦53,000 — idempotent by title
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

  const martinez = await ensurePlayer("Martinez", "pending-martinez");
  const gabriel = await ensurePlayer("Gabriel", "pending-gabriel");

  const martinezPay = await prisma.payment.findFirst({
    where: {
      playerId: martinez.id,
      monthKey: CYCLE_KEY,
      amount: 3000,
      note: "Instalment",
    },
  });
  if (!martinezPay) {
    await prisma.payment.create({
      data: {
        playerId: martinez.id,
        monthKey: CYCLE_KEY,
        type: "MONTHLY_INSTALMENT",
        amount: 3000,
        note: "Instalment",
      },
    });
    await prisma.player.update({
      where: { id: martinez.id },
      data: { seat: "sub", status: "active" },
    });
    console.log("Martinez ₦3,000 instalment recorded");
  }

  const gabrielPay = await prisma.payment.findFirst({
    where: {
      playerId: gabriel.id,
      monthKey: CYCLE_KEY,
      amount: 5000,
    },
  });
  if (!gabrielPay) {
    await prisma.payment.create({
      data: {
        playerId: gabriel.id,
        monthKey: CYCLE_KEY,
        type: "MONTHLY_5K",
        amount: 5000,
        note: "Full monthly",
      },
    });
    await prisma.player.update({
      where: { id: gabriel.id },
      data: { seat: "permanent", status: "active" },
    });
    console.log("Gabriel ₦5,000 recorded");
  }

  console.log("Seeded Teams 1–4 + cycle payments");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
