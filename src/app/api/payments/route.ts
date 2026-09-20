import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  PAYMENT_AMOUNTS,
  currentMonthKey,
  seatForPaymentType,
  type PaymentType,
} from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || currentMonthKey();

  const payments = await prisma.payment.findMany({
    where: { monthKey },
    include: { player: { include: { team: true } } },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json({ monthKey, payments });
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
    monthKey?: string;
    note?: string;
  };

  if (!body.playerId || !body.type || !(body.type in PAYMENT_AMOUNTS)) {
    return NextResponse.json(
      { error: "playerId and valid type required" },
      { status: 400 },
    );
  }

  const monthKey = body.monthKey || currentMonthKey();
  const amount = PAYMENT_AMOUNTS[body.type];
  const seat = seatForPaymentType(body.type);

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        playerId: body.playerId,
        monthKey,
        type: body.type,
        amount,
        note: body.note?.trim() || null,
      },
      include: { player: true },
    }),
    prisma.player.update({
      where: { id: body.playerId },
      data: {
        seat,
        status: "active",
      },
    }),
  ]);

  return NextResponse.json(payment, { status: 201 });
}
