import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PAYMENT_CYCLE } from "@/lib/league-db";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const id = searchParams.get("id");

  if (id) {
    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  }

  const posts = await prisma.newsPost.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json({
    monthKey: PAYMENT_CYCLE.key,
    posts,
    post: posts[0] ?? null,
  });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    body?: string;
    pinned?: boolean;
    monthKey?: string;
    week?: number;
  };

  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json(
      { error: "title and body required" },
      { status: 400 },
    );
  }

  if (body.pinned) {
    await prisma.newsPost.updateMany({ data: { pinned: false } });
  }

  const post = await prisma.newsPost.create({
    data: {
      title: body.title.trim(),
      body: body.body.trim(),
      pinned: Boolean(body.pinned),
      monthKey: body.monthKey || PAYMENT_CYCLE.key,
      week: body.week ?? null,
    },
  });

  return NextResponse.json(post, { status: 201 });
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

  await prisma.newsPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
