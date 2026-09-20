import { NextResponse } from "next/server";
import { getPlayerIdFromSession, publicPlayer } from "@/lib/auth";
import {
  PAYMENT_CYCLE,
  overallScore,
} from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const playerId = await getPlayerIdFromSession();
  if (!playerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || PAYMENT_CYCLE.key;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { team: true },
  });

  if (!player) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [payments, events] = await Promise.all([
    prisma.payment.findMany({
      where: { playerId, monthKey },
      orderBy: { paidAt: "desc" },
    }),
    prisma.matchEvent.findMany({
      where: { playerId, monthKey },
      orderBy: [{ week: "asc" }, { match: "asc" }],
    }),
  ]);

  let goals = 0;
  let assists = 0;
  let yc = 0;
  let rc = 0;
  for (const event of events) {
    if (event.type === "GOAL") goals += event.count;
    if (event.type === "ASSIST") assists += event.count;
    if (event.type === "YC") yc += event.count;
    if (event.type === "RC") rc += event.count;
  }

  const paidThisMonth = payments.length > 0;
  const permanentPaid = payments.some((p) => p.type === "MONTHLY_5K");

  return NextResponse.json({
    monthKey,
    player: publicPlayer(player),
    payment: {
      paidThisMonth,
      permanentPaid,
      payments,
    },
    stats: {
      goals,
      assists,
      yc,
      rc,
      overall: overallScore(goals, assists, yc, rc),
    },
    events,
  });
}
