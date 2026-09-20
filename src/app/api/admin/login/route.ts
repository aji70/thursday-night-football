import { NextResponse } from "next/server";
import {
  clearAdminSession,
  getPlayerIdFromSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  const playerId = await getPlayerIdFromSession();
  let via: "password" | "player" | null = null;

  if (authenticated && playerId) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { isAdmin: true, name: true },
    });
    if (player?.isAdmin) via = "player";
  }
  if (authenticated && !via) via = "password";

  return NextResponse.json({ authenticated, via });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
    action?: string;
  } | null;

  if (body?.action === "logout") {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }

  // Prefer player-admin: if already logged in as sole admin, no password needed.
  if (await isAdminAuthenticated()) {
    return NextResponse.json({ ok: true, via: "player" });
  }

  if (!body?.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true, via: "password" });
}
