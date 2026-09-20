import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PAYMENT_CYCLE } from "@/lib/league-db";
import { prisma } from "@/lib/prisma";
import { applyCardSuspension } from "@/lib/suspensions";

const EVENT_TYPES = new Set(["GOAL", "ASSIST", "YC", "RC"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || PAYMENT_CYCLE.key;

  const events = await prisma.matchEvent.findMany({
    where: { monthKey },
    include: { player: { include: { team: true } } },
    orderBy: [{ week: "asc" }, { match: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ monthKey, events });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    playerId?: string;
    week?: number;
    match?: number;
    type?: string;
    count?: number;
    monthKey?: string;
  };

  if (
    !body.playerId ||
    !body.type ||
    !EVENT_TYPES.has(body.type) ||
    !body.week ||
    !body.match
  ) {
    return NextResponse.json(
      { error: "playerId, week, match, and type required" },
      { status: 400 },
    );
  }

  const monthKey = body.monthKey || PAYMENT_CYCLE.key;
  const count = body.count && body.count > 0 ? body.count : 1;

  const event = await prisma.matchEvent.create({
    data: {
      playerId: body.playerId,
      monthKey,
      week: body.week,
      match: body.match,
      type: body.type,
      count,
    },
    include: { player: true },
  });

  if (body.type === "YC" || body.type === "RC") {
    await applyCardSuspension(body.playerId, body.type, count, monthKey);
  }

  return NextResponse.json(event, { status: 201 });
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

  await prisma.matchEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
