import { NextResponse } from "next/server";
import {
  getPlayerIdFromSession,
  requireAdmin,
  requirePlayer,
} from "@/lib/auth";
import {
  PAYMENT_AMOUNTS,
  PAYMENT_CYCLE,
  seatForPaymentType,
  type PaymentType,
} from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

async function syncSeatForPlayer(playerId: string, monthKey: string) {
  const total = await prisma.payment.aggregate({
    where: {
      playerId,
      monthKey,
      status: "confirmed",
      type: { in: ["MONTHLY_5K", "MONTHLY_INSTALMENT", "VISITOR_1_5K"] },
    },
    _sum: { amount: true },
  });
  const sum = total._sum.amount || 0;
  const visitorOnly = await prisma.payment.count({
    where: {
      playerId,
      monthKey,
      status: "confirmed",
      type: "VISITOR_1_5K",
    },
  });
  const monthly = await prisma.payment.count({
    where: {
      playerId,
      monthKey,
      status: "confirmed",
      type: { in: ["MONTHLY_5K", "MONTHLY_INSTALMENT"] },
    },
  });

  let seat: "permanent" | "sub" = "sub";
  if (monthly > 0 && sum >= PAYMENT_CYCLE.monthlyFee) seat = "permanent";
  else if (monthly > 0 && sum > 0 && sum < PAYMENT_CYCLE.monthlyFee) {
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

  const confirmedTotals = new Map<string, number>();
  const claimedByPlayer = new Map<string, (typeof payments)[0]>();
  for (const p of payments) {
    if (p.status === "confirmed") {
      confirmedTotals.set(
        p.playerId,
        (confirmedTotals.get(p.playerId) || 0) + p.amount,
      );
    } else if (p.status === "claimed") {
      claimedByPlayer.set(p.playerId, p);
    }
  }

  const summary = players.map((player) => {
    const total = confirmedTotals.get(player.id) || 0;
    const claim = claimedByPlayer.get(player.id);
    return {
      playerId: player.id,
      name: player.name,
      total,
      seat: player.seat,
      remaining: Math.max(0, PAYMENT_CYCLE.monthlyFee - total),
      overpaid: Math.max(0, total - PAYMENT_CYCLE.monthlyFee),
      isInstalment: total > 0 && total < PAYMENT_CYCLE.monthlyFee,
      isPaid: total >= PAYMENT_CYCLE.monthlyFee,
      claim: claim
        ? {
            id: claim.id,
            amount: claim.amount,
            type: claim.type,
            paidAt: claim.paidAt,
          }
        : null,
    };
  });

  summary.sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? -1 : 1;
    if (!!a.claim !== !!b.claim) return a.claim ? -1 : 1;
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
  const body = (await request.json()) as {
    action?: string;
    playerId?: string;
    type?: PaymentType;
    amount?: number;
    monthKey?: string;
    note?: string;
    id?: string;
  };

  // Player claims "I've paid"
  if (body.action === "claim") {
    let playerId: string;
    try {
      playerId = await requirePlayer();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = body.type;
    if (!type || !(type in PAYMENT_AMOUNTS)) {
      return NextResponse.json({ error: "Valid type required" }, { status: 400 });
    }

    const amount = Math.round(Number(body.amount) || 0);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Positive amount required" },
        { status: 400 },
      );
    }

    const monthKey = body.monthKey || PAYMENT_CYCLE.key;
    const existingClaim = await prisma.payment.findFirst({
      where: { playerId, monthKey, status: "claimed" },
    });
    if (existingClaim) {
      return NextResponse.json(
        {
          error:
            "You already have a pending claim. Cancel or edit it before submitting another.",
        },
        { status: 409 },
      );
    }

    const payment = await prisma.payment.create({
      data: {
        playerId,
        monthKey,
        type,
        amount,
        status: "claimed",
        note:
          body.note?.trim() ||
          "Player claimed — awaiting admin confirmation",
      },
    });

    return NextResponse.json(payment, { status: 201 });
  }

  // Admin confirm claim
  if (body.action === "confirm") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const existing = await prisma.payment.findUnique({ where: { id: body.id } });
    if (!existing || existing.status !== "claimed") {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    const payment = await prisma.payment.update({
      where: { id: body.id },
      data: {
        status: "confirmed",
        note: existing.note?.includes("awaiting")
          ? "Confirmed by admin"
          : existing.note,
        paidAt: new Date(),
      },
    });
    await syncSeatForPlayer(payment.playerId, payment.monthKey);
    return NextResponse.json(payment);
  }

  // Admin reject claim
  if (body.action === "reject") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const existing = await prisma.payment.findUnique({ where: { id: body.id } });
    if (!existing || existing.status !== "claimed") {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    await prisma.payment.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  }

  // Admin log confirmed payment (default)
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      status: "confirmed",
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
      status: "confirmed",
      note:
        body.note?.trim() ||
        (body.type === "MONTHLY_INSTALMENT" ? "Instalment" : null),
    },
    include: { player: true },
  });

  await prisma.player.update({
    where: { id: body.playerId },
    data: { seat, status: "active" },
  });

  return NextResponse.json(payment, { status: 201 });
}

export async function PATCH(request: Request) {
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

  const sessionId = await getPlayerIdFromSession();
  let asAdmin = false;
  try {
    await requireAdmin();
    asAdmin = true;
  } catch {
    asAdmin = false;
  }

  // Player may only edit their own claimed payment
  if (!asAdmin) {
    if (!sessionId || sessionId !== existing.playerId || existing.status !== "claimed") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
      player: { select: { id: true, name: true, seat: true } },
    },
  });

  if (payment.status === "confirmed") {
    await syncSeatForPlayer(payment.playerId, payment.monthKey);
  }

  return NextResponse.json(payment);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sessionId = await getPlayerIdFromSession();
  let asAdmin = false;
  try {
    await requireAdmin();
    asAdmin = true;
  } catch {
    asAdmin = false;
  }

  if (!asAdmin) {
    if (!sessionId || sessionId !== existing.playerId || existing.status !== "claimed") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await prisma.payment.delete({ where: { id } });
  if (existing.status === "confirmed") {
    await syncSeatForPlayer(existing.playerId, existing.monthKey);
  }

  return NextResponse.json({ ok: true });
}
