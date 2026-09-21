import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  resetTeamAssignments,
  shuffleTeamsByOverall,
} from "@/lib/team-draft";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { number: "asc" },
    include: {
      players: {
        where: { status: "active" },
        orderBy: [{ overall: "desc" }, { name: "asc" }],
      },
    },
  });
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { action?: string };

  if (body.action === "shuffle") {
    try {
      const result = await shuffleTeamsByOverall();
      return NextResponse.json({ ok: true, ...result });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Shuffle failed" },
        { status: 400 },
      );
    }
  }

  if (body.action === "reset") {
    const result = await resetTeamAssignments();
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json(
    { error: "action must be shuffle or reset" },
    { status: 400 },
  );
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    name?: string;
  };

  if (!body.id || !body.name?.trim()) {
    return NextResponse.json({ error: "id and name required" }, { status: 400 });
  }

  const team = await prisma.team.update({
    where: { id: body.id },
    data: { name: body.name.trim() },
  });

  return NextResponse.json(team);
}
