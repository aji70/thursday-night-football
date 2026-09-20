import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { fixtureTeamNumbers } from "@/data/league";
import { PAYMENT_CYCLE } from "@/lib/league-db";
import { prisma } from "@/lib/prisma";
import { buildStandings } from "@/lib/standings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || PAYMENT_CYCLE.key;

  const [teams, results, events] = await Promise.all([
    prisma.team.findMany({ orderBy: { number: "asc" } }),
    prisma.matchResult.findMany({
      where: { monthKey },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [{ week: "asc" }, { match: "asc" }],
    }),
    prisma.matchEvent.findMany({
      where: {
        monthKey,
        type: { in: ["YC", "RC"] },
      },
      include: { player: { select: { teamId: true } } },
    }),
  ]);

  const standings = buildStandings(
    teams,
    results.map((r) => ({
      homeTeamId: r.homeTeamId,
      awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals,
      awayGoals: r.awayGoals,
    })),
    events,
  );

  return NextResponse.json({ monthKey, results, standings });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    week?: number;
    match?: number;
    homeGoals?: number;
    awayGoals?: number;
    monthKey?: string;
  };

  const week = Number(body.week);
  const match = Number(body.match);
  const homeGoals = Math.round(Number(body.homeGoals));
  const awayGoals = Math.round(Number(body.awayGoals));

  if (
    !week ||
    !match ||
    week < 1 ||
    week > 4 ||
    match < 1 ||
    match > 6 ||
    !Number.isFinite(homeGoals) ||
    !Number.isFinite(awayGoals) ||
    homeGoals < 0 ||
    awayGoals < 0
  ) {
    return NextResponse.json(
      { error: "week, match, and non-negative scores required" },
      { status: 400 },
    );
  }

  const pair = fixtureTeamNumbers(week, match);
  if (!pair) {
    return NextResponse.json({ error: "Unknown fixture" }, { status: 400 });
  }

  const [homeNum, awayNum] = pair;
  const [homeTeam, awayTeam] = await Promise.all([
    prisma.team.findUnique({ where: { number: homeNum } }),
    prisma.team.findUnique({ where: { number: awayNum } }),
  ]);

  if (!homeTeam || !awayTeam) {
    return NextResponse.json({ error: "Teams not seeded" }, { status: 400 });
  }

  const monthKey = body.monthKey || PAYMENT_CYCLE.key;

  const result = await prisma.matchResult.upsert({
    where: {
      monthKey_week_match: { monthKey, week, match },
    },
    create: {
      monthKey,
      week,
      match,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeGoals,
      awayGoals,
    },
    update: {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeGoals,
      awayGoals,
    },
    include: { homeTeam: true, awayTeam: true },
  });

  return NextResponse.json(result, { status: 201 });
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

  await prisma.matchResult.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
