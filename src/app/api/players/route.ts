import { NextResponse } from "next/server";
import {
  hashPassword,
  publicPlayer,
  requireAdmin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const players = await prisma.player.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    include: { team: true },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(players.map((p) => publicPlayer(p)));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    password?: string;
    admin?: boolean;
  };

  if (!body.name?.trim() || !body.phone?.trim() || !body.password) {
    return NextResponse.json(
      { error: "Name, phone, and password required" },
      { status: 400 },
    );
  }

  if (body.password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters" },
      { status: 400 },
    );
  }

  const phone = normalizePhone(body.phone);

  let status = "pending";
  if (body.admin) {
    try {
      await requireAdmin();
      status = "active";
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const existing = await prisma.player.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: "A profile with this phone already exists. Log in instead." },
      { status: 409 },
    );
  }

  const player = await prisma.player.create({
    data: {
      name: body.name.trim(),
      phone,
      passwordHash: hashPassword(body.password),
      status,
      seat: "sub",
    },
  });

  return NextResponse.json(publicPlayer(player), { status: 201 });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: string;
    seat?: string;
    teamId?: string | null;
    name?: string;
    phone?: string | null;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // isAdmin is sole-owner only — never set via this API (seed grants Aji).
  const player = await prisma.player.update({
    where: { id: body.id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.seat ? { seat: body.seat } : {}),
      ...(body.teamId !== undefined ? { teamId: body.teamId } : {}),
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.phone ? { phone: normalizePhone(body.phone) } : {}),
    },
    include: { team: true },
  });

  return NextResponse.json(publicPlayer(player));
}
