import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const ADMIN_COOKIE = "tnf_admin";
const PLAYER_COOKIE = "tnf_player";

function adminSecret() {
  return process.env.ADMIN_PASSWORD || "tnf-admin";
}

function sessionSecret() {
  return process.env.SESSION_SECRET || adminSecret();
}

function adminTokenFor(password: string) {
  return createHmac("sha256", adminSecret()).update(`admin:${password}`).digest("hex");
}

function playerTokenFor(playerId: string) {
  return createHmac("sha256", sessionSecret())
    .update(`player:${playerId}`)
    .digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "tnf-admin";
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminTokenFor(adminSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isPasswordAdminAuthenticated() {
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const expected = adminTokenFor(adminSecret());
  try {
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function getPlayerIdFromSession() {
  const jar = await cookies();
  const value = jar.get(PLAYER_COOKIE)?.value;
  if (!value) return null;
  const [playerId, token] = value.split(".");
  if (!playerId || !token) return null;
  const expected = playerTokenFor(playerId);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return playerId;
  } catch {
    return null;
  }
}

/** True if password-admin cookie OR logged-in player with isAdmin. */
export async function isAdminAuthenticated() {
  if (await isPasswordAdminAuthenticated()) return true;

  const playerId = await getPlayerIdFromSession();
  if (!playerId) return false;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { isAdmin: true, status: true },
  });

  return !!player?.isAdmin && player.status === "active";
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) throw new Error("UNAUTHORIZED");
}

export async function setPlayerSession(playerId: string) {
  const jar = await cookies();
  jar.set(PLAYER_COOKIE, `${playerId}.${playerTokenFor(playerId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearPlayerSession() {
  const jar = await cookies();
  jar.delete(PLAYER_COOKIE);
}

export async function requirePlayer() {
  const id = await getPlayerIdFromSession();
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

export function publicPlayer<T extends { passwordHash?: string }>(player: T) {
  const { passwordHash: _, ...rest } = player;
  return rest;
}
