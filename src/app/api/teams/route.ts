import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { number: "asc" },
    include: {
      players: {
        where: { status: "active" },
        orderBy: { name: "asc" },
      },
    },
  });
  return NextResponse.json(teams);
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
