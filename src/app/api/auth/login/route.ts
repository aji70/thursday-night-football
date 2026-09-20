import { NextResponse } from "next/server";
import {
  clearPlayerSession,
  getPlayerIdFromSession,
  publicPlayer,
  setPlayerSession,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const playerId = await getPlayerIdFromSession();
  if (!playerId) {
    return NextResponse.json({ player: null });
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { team: true },
  });

  if (!player) {
    return NextResponse.json({ player: null });
  }

  return NextResponse.json({ player: publicPlayer(player) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    phone?: string;
    password?: string;
    action?: string;
  } | null;

  if (body?.action === "logout") {
    await clearPlayerSession();
    return NextResponse.json({ ok: true });
  }

  const phone = body?.phone?.replace(/\s+/g, "").trim();
  const password = body?.password;

  if (!phone || !password) {
    return NextResponse.json(
      { error: "Phone and password required" },
      { status: 400 },
    );
  }

  const player = await prisma.player.findUnique({ where: { phone } });
  if (!player || !verifyPassword(password, player.passwordHash)) {
    return NextResponse.json({ error: "Invalid login" }, { status: 401 });
  }

  await setPlayerSession(player.id);
  return NextResponse.json({
    player: publicPlayer(player),
    pending: player.status === "pending",
  });
}
