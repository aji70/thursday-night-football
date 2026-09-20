import { NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
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

  if (!body?.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
