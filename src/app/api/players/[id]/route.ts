import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import {
  getPlayerIdFromSession,
  publicPlayer,
  requireAdmin,
} from "@/lib/auth";
import { PAYMENT_CYCLE, overallScore } from "@/lib/league-db";
import { prisma } from "@/lib/prisma";
import { uploadDir } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id },
    include: { team: true },
  });

  if (!player) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const monthKey = PAYMENT_CYCLE.key;
  const isOwn = (await getPlayerIdFromSession()) === id;

  const [payments, events] = await Promise.all([
    player.isAdmin && !isOwn
      ? Promise.resolve([])
      : prisma.payment.findMany({
          where: { playerId: id, monthKey },
          orderBy: { paidAt: "desc" },
        }),
    prisma.matchEvent.findMany({
      where: { playerId: id, monthKey },
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

  const paidTotal = payments.reduce((s, p) => s + p.amount, 0);

  return NextResponse.json({
    player: publicPlayer(player),
    monthKey,
    payment: player.isAdmin && !isOwn
      ? null
      : {
          paidTotal,
          remaining: Math.max(0, PAYMENT_CYCLE.monthlyFee - paidTotal),
          payments,
        },
    stats: {
      goals,
      assists,
      yc,
      rc,
      overall: overallScore(goals, assists, yc, rc),
    },
  });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const sessionId = await getPlayerIdFromSession();

  let allowed = sessionId === id;
  if (!allowed) {
    try {
      await requireAdmin();
      allowed = true;
    } catch {
      allowed = false;
    }
  }

  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "photo required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Image only" }, { status: 400 });
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 3MB" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const filename = `${id}.${ext}`;
  const dir = uploadDir();
  const full = path.join(/*turbopackIgnore: true*/ dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(full, buffer);

  const player = await prisma.player.update({
    where: { id },
    data: { photoPath: filename },
    include: { team: true },
  });

  return NextResponse.json(publicPlayer(player));
}
