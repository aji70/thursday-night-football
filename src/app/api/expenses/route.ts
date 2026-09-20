import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [payments, expenses, ledger, walkIns] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "confirmed" },
      orderBy: { paidAt: "desc" },
    }),
    prisma.expense.findMany({ orderBy: { spentAt: "desc" } }),
    prisma.purseLedger.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.walkInPayment.findMany({ orderBy: { paidAt: "desc" } }),
  ]);

  const feesIn = payments.reduce((sum, p) => sum + p.amount, 0);
  const walkInIn = walkIns.reduce((sum, p) => sum + p.amount, 0);
  const ledgerIn = ledger.reduce((sum, e) => sum + e.amount, 0);
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const income = feesIn + ledgerIn + walkInIn;

  return NextResponse.json({
    income,
    feesIn,
    walkInIn,
    ledgerIn,
    spent,
    balance: income - spent,
    payments,
    expenses,
    ledger,
    walkIns,
  });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    amount?: number;
    note?: string;
    spentAt?: string;
    kind?: "expense" | "ledger";
    ledgerKind?: string;
  };

  if (body.kind === "ledger") {
    if (!body.title?.trim() || body.amount === undefined) {
      return NextResponse.json(
        { error: "title and amount required" },
        { status: 400 },
      );
    }
    const entry = await prisma.purseLedger.create({
      data: {
        kind: body.ledgerKind || "ADJUSTMENT",
        title: body.title.trim(),
        amount: Math.round(body.amount),
        note: body.note?.trim() || null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  }

  if (!body.title?.trim() || !body.amount || body.amount <= 0) {
    return NextResponse.json(
      { error: "title and positive amount required" },
      { status: 400 },
    );
  }

  const expense = await prisma.expense.create({
    data: {
      title: body.title.trim(),
      amount: Math.round(body.amount),
      note: body.note?.trim() || null,
      spentAt: body.spentAt ? new Date(body.spentAt) : new Date(),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const kind = searchParams.get("kind") || "expense";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  if (kind === "ledger") {
    await prisma.purseLedger.delete({ where: { id } });
  } else {
    await prisma.expense.delete({ where: { id } });
  }
  return NextResponse.json({ ok: true });
}
