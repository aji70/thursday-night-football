import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PAYMENT_CYCLE } from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || PAYMENT_CYCLE.key;

  const walkIns = await prisma.walkInPayment.findMany({
    where: { monthKey },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json({ monthKey, walkIns });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    amount?: number;
    note?: string;
    monthKey?: string;
  };

  if (!body.name?.trim() || !body.amount || body.amount <= 0) {
    return NextResponse.json(
      { error: "Name and positive amount required" },
      { status: 400 },
    );
  }

  const walkIn = await prisma.walkInPayment.create({
    data: {
      name: body.name.trim(),
      amount: Math.round(body.amount),
      monthKey: body.monthKey || PAYMENT_CYCLE.key,
      note: body.note?.trim() || "On-field / unregistered",
    },
  });

  return NextResponse.json(walkIn, { status: 201 });
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.walkInPayment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
