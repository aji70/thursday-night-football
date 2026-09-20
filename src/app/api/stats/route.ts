import { NextResponse } from "next/server";
import {
  currentMonthKey,
  overallScore,
  type PlayerStatRow,
} from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") || currentMonthKey();

  const events = await prisma.matchEvent.findMany({
    where: { monthKey },
    include: { player: { include: { team: true } } },
  });

  const map = new Map<string, PlayerStatRow>();

  for (const event of events) {
    const existing = map.get(event.playerId) ?? {
      playerId: event.playerId,
      name: event.player.name,
      teamName: event.player.team?.name ?? null,
      seat: event.player.seat,
      goals: 0,
      assists: 0,
      yc: 0,
      rc: 0,
      overall: 0,
    };

    if (event.type === "GOAL") existing.goals += event.count;
    if (event.type === "ASSIST") existing.assists += event.count;
    if (event.type === "YC") existing.yc += event.count;
    if (event.type === "RC") existing.rc += event.count;

    existing.overall = overallScore(
      existing.goals,
      existing.assists,
      existing.yc,
      existing.rc,
    );
    map.set(event.playerId, existing);
  }

  const rows = Array.from(map.values());

  return NextResponse.json({
    monthKey,
    goals: [...rows].sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name)),
    assists: [...rows].sort(
      (a, b) => b.assists - a.assists || a.name.localeCompare(b.name),
    ),
    cards: [...rows].sort(
      (a, b) => b.yc + b.rc - (a.yc + a.rc) || b.rc - a.rc || a.name.localeCompare(b.name),
    ),
    overall: [...rows].sort(
      (a, b) => b.overall - a.overall || a.name.localeCompare(b.name),
    ),
  });
}
