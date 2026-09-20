import { NextResponse } from "next/server";
import { getPlayerIdFromSession, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.feedback.findMany({
    include: { player: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    type?: string;
    message?: string;
    name?: string;
  };

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const type = body.type === "complaint" ? "complaint" : "suggestion";
  const playerId = await getPlayerIdFromSession();

  const item = await prisma.feedback.create({
    data: {
      type,
      message: body.message.trim(),
      name: body.name?.trim() || null,
      playerId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; status?: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const item = await prisma.feedback.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  return NextResponse.json(item);
}
