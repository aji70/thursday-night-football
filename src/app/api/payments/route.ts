import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  PAYMENT_AMOUNTS,
  PAYMENT_CYCLE,
  seatForPaymentType,
  type PaymentType,
} from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || PAYMENT_CYCLE.key;

  const payments = await prisma.payment.findMany({
    where: { monthKey },
    include: { player: { include: { team: true } } },
    orderBy: { paidAt: "desc" },
  });

  const byPlayer = new Map<
    string,
    { name: string; total: number; seat: string; entries: typeof payments }
  >();

  for (const p of payments) {
    const row = byPlayer.get(p.playerId) ?? {
      name: p.player.name,
      total: 0,
      seat: p.player.seat,
      entries: [],
    };
    row.total += p.amount;
    row.entries.push(p);
    byPlayer.set(p.playerId, row);
  }

  return NextResponse.json({
    monthKey,
    cycle: PAYMENT_CYCLE,
    payments,
    summary: Array.from(byPlayer.entries()).map(([playerId, row]) => ({
      playerId,
      name: row.name,
      total: row.total,
      seat: row.seat,
      remaining: Math.max(0, PAYMENT_CYCLE.monthlyFee - row.total),
      isInstalment: row.total > 0 && row.total < PAYMENT_CYCLE.monthlyFee,
    })),
  });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    playerId?: string;
    type?: PaymentType;
    amount?: number;
    monthKey?: string;
    note?: string;
  };

  if (!body.playerId || !body.type || !(body.type in PAYMENT_AMOUNTS)) {
    return NextResponse.json(
      { error: "playerId and valid type required" },
      { status: 400 },
    );
  }

  const monthKey = body.monthKey || PAYMENT_CYCLE.key;
  let amount =
    body.type === "MONTHLY_INSTALMENT"
      ? Math.round(Number(body.amount) || 0)
      : PAYMENT_AMOUNTS[body.type];

  if (body.type === "MONTHLY_INSTALMENT" && body.amount) {
    amount = Math.round(Number(body.amount));
  }
  // Allow overriding amount for any type (instalments / custom)
  if (body.amount && body.amount > 0) {
    amount = Math.round(Number(body.amount));
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Positive amount required" }, { status: 400 });
  }

  const prior = await prisma.payment.aggregate({
    where: {
      playerId: body.playerId,
      monthKey,
      type: { in: ["MONTHLY_5K", "MONTHLY_INSTALMENT"] },
    },
    _sum: { amount: true },
  });
  const totalAfter = (prior._sum.amount || 0) + amount;
  const seat =
    body.type === "VISITOR_1_5K"
      ? "sub"
      : totalAfter >= PAYMENT_CYCLE.monthlyFee
        ? "permanent"
        : seatForPaymentType(body.type, amount);

  const payment = await prisma.payment.create({
    data: {
      playerId: body.playerId,
      monthKey,
      type: body.type,
      amount,
      note:
        body.note?.trim() ||
        (body.type === "MONTHLY_INSTALMENT" ? "Instalment" : null),
    },
    include: { player: true },
  });

  await prisma.player.update({
    where: { id: body.playerId },
    data: {
      seat,
      status: "active",
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
