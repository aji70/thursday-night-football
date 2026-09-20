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

  const [payments, players] = await Promise.all([
    prisma.payment.findMany({
      where: { monthKey },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
            seat: true,
            isAdmin: true,
            photoPath: true,
            teamId: true,
            team: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
    }),
    prisma.player.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    }),
  ]);

  const totals = new Map<string, number>();
  for (const p of payments) {
    totals.set(p.playerId, (totals.get(p.playerId) || 0) + p.amount);
  }

  const summary = players.map((player) => {
    const total = totals.get(player.id) || 0;
    return {
      playerId: player.id,
      name: player.name,
      total,
      seat: player.seat,
      remaining: Math.max(0, PAYMENT_CYCLE.monthlyFee - total),
      isInstalment: total > 0 && total < PAYMENT_CYCLE.monthlyFee,
      isPaid: total >= PAYMENT_CYCLE.monthlyFee,
    };
  });

  // Paid first, then partial, then unpaid — so already-paid players are visible.
  summary.sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? -1 : 1;
    if (a.isInstalment !== b.isInstalment) return a.isInstalment ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({
    monthKey,
    cycle: PAYMENT_CYCLE,
    payments,
    summary,
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

async function syncSeatForPlayer(playerId: string, monthKey: string) {
  const total = await prisma.payment.aggregate({
    where: {
      playerId,
      monthKey,
      type: { in: ["MONTHLY_5K", "MONTHLY_INSTALMENT", "VISITOR_1_5K"] },
    },
    _sum: { amount: true },
  });
  const sum = total._sum.amount || 0;
  const visitorOnly = await prisma.payment.count({
    where: { playerId, monthKey, type: "VISITOR_1_5K" },
  });
  const monthly = await prisma.payment.count({
    where: {
      playerId,
      monthKey,
      type: { in: ["MONTHLY_5K", "MONTHLY_INSTALMENT"] },
    },
  });

  let seat: "permanent" | "sub" = "sub";
  if (monthly > 0 && sum >= PAYMENT_CYCLE.monthlyFee) seat = "permanent";
  else if (monthly > 0 && sum > 0 && sum < PAYMENT_CYCLE.monthlyFee) {
    // Partial monthly — keep permanent if already marked regular, else sub
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { seat: true },
    });
    seat = player?.seat === "permanent" ? "permanent" : "sub";
  } else if (visitorOnly > 0 && monthly === 0) seat = "sub";

  await prisma.player.update({
    where: { id: playerId },
    data: { seat },
  });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    amount?: number;
    type?: PaymentType;
    note?: string | null;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.payment.findUnique({ where: { id: body.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const amount =
    body.amount !== undefined ? Math.round(Number(body.amount)) : existing.amount;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Positive amount required" }, { status: 400 });
  }

  const type =
    body.type && body.type in PAYMENT_AMOUNTS ? body.type : existing.type;

  const payment = await prisma.payment.update({
    where: { id: body.id },
    data: {
      amount,
      type,
      note:
        body.note === undefined
          ? undefined
          : body.note?.trim() ||
            (type === "MONTHLY_INSTALMENT" ? "Instalment" : null),
    },
    include: {
      player: {
        select: { id: true, name: true, seat: true },
      },
    },
  });

  await syncSeatForPlayer(payment.playerId, payment.monthKey);

  return NextResponse.json(payment);
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.payment.delete({ where: { id } });
  await syncSeatForPlayer(existing.playerId, existing.monthKey);

  return NextResponse.json({ ok: true });
}
