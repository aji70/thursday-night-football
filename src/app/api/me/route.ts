import { NextResponse } from "next/server";
import { getPlayerIdFromSession, publicPlayer } from "@/lib/auth";
import { fixtureTeamNumbers } from "@/data/league";
import { PAYMENT_CYCLE, overallScore } from "@/lib/league-db";
import { findNextMatch } from "@/lib/next-match";
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

  const [payments, events, results] = await Promise.all([
    prisma.payment.findMany({
      where: { playerId, monthKey },
      orderBy: { paidAt: "desc" },
    }),
    prisma.matchEvent.findMany({
      where: { playerId, monthKey },
      orderBy: [{ week: "asc" }, { match: "asc" }],
    }),
    prisma.matchResult.findMany({
      where: { monthKey },
      select: { week: true, match: true, homeTeamId: true, awayTeamId: true },
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

  const confirmed = payments.filter((p) => p.status === "confirmed");
  const claim = payments.find((p) => p.status === "claimed") ?? null;
  const paidTotal = confirmed.reduce((s, p) => s + p.amount, 0);
  const paidThisMonth = paidTotal > 0;
  const permanentPaid = paidTotal >= PAYMENT_CYCLE.monthlyFee;

  let nextMatch = null;
  if (player.team) {
    const playedKeys = new Set<string>();
    for (const r of results) {
      if (
        r.homeTeamId === player.teamId ||
        r.awayTeamId === player.teamId
      ) {
        playedKeys.add(`${r.week}-${r.match}`);
      }
    }
    // Also mark fixtures where we can resolve by team number from results
    for (const r of results) {
      const pair = fixtureTeamNumbers(r.week, r.match);
      if (!pair) continue;
      if (pair[0] === player.team.number || pair[1] === player.team.number) {
        playedKeys.add(`${r.week}-${r.match}`);
      }
    }
    nextMatch = findNextMatch(player.team.number, playedKeys);
  }

  const pendingProfile = player.status === "pending";
  const awaitingRoster = !pendingProfile && !player.teamId;

  return NextResponse.json({
    monthKey,
    cycleLabel: PAYMENT_CYCLE.label,
    player: publicPlayer(player),
    pendingProfile,
    awaitingRoster,
    nextMatch,
    payment: {
      paidThisMonth,
      permanentPaid,
      paidTotal,
      remaining: Math.max(0, PAYMENT_CYCLE.monthlyFee - paidTotal),
      seat: player.seat,
      claim: claim
        ? {
            id: claim.id,
            amount: claim.amount,
            type: claim.type,
            paidAt: claim.paidAt,
            note: claim.note,
          }
        : null,
      payments: confirmed,
    },
    suspension: {
      matchesRemaining: player.suspensionMatchesRemaining,
      reason: player.suspensionReason,
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
