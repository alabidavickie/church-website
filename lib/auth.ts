// Accounts, sessions and two-step sign-in.
// Passwords are hashed with scrypt (Node crypto, no extra dependency).
// Two-step is TOTP (authenticator app) with 8 single-use backup codes,
// required for pastor, admin, editor and treasurer — see docs/BLUEPRINT.md.
// The first account created becomes Pastor so the church is never locked out.
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { loadDb, saveDb, withDb, type Role, type User } from "./store";

export const SESSION_COOKIE = "cw_session";
const STAFF_2FA_ROLES: Role[] = ["pastor", "admin", "editor", "treasurer"];

export function roleNeedsTotp(role: Role): boolean {
  return STAFF_2FA_ROLES.includes(role);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function newBackupCodes(): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: 8 }, () => crypto.randomInt(10_000_000, 99_999_999).toString());
  return { codes, hashes: codes.map(sha256) };
}

// --- TOTP (RFC 6238, SHA-1, 30-second steps, 6 digits) ---
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret(): string {
  return Array.from({ length: 32 }, () => BASE32[crypto.randomInt(32)]).join("");
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const ch of clean) bits += BASE32.indexOf(ch).toString(2).padStart(5, "0");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function totpCode(secret: string, at = Date.now()): string {
  const counter = Math.floor(at / 30_000);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return (code % 1_000_000).toString().padStart(6, "0");
}

export function verifyTotp(secret: string, code: string): boolean {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  for (const skew of [-1, 0, 1]) {
    if (totpCode(secret, Date.now() + skew * 30_000) === clean) return true;
  }
  return false;
}

export function otpauthUrl(secret: string, email: string): string {
  return `otpauth://totp/${encodeURIComponent("[Church Name]")}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent("[Church Name]")}`;
}

// --- Sessions ---
export async function createSession(userId: string, totpPending = false): Promise<string> {
  const token = randomToken();
  withDb((db) => {
    db.sessions.push({ token, userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, totpPending });
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) withDb((db) => { db.sessions = db.sessions.filter((s) => s.token !== token); });
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = loadDb();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now() && !s.totpPending);
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) ?? null;
}

export async function pendingTotpUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = loadDb();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now() && s.totpPending);
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) ?? null;
}

export function can(user: User | null, roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}

export function isStaff(user: User | null): boolean {
  return can(user, ["pastor", "admin", "editor", "treasurer", "prayer_team", "welcome_team"]);
}

export function saveUser(user: User): void {
  withDb((db) => {
    const i = db.users.findIndex((u) => u.id === user.id);
    if (i >= 0) db.users[i] = user; else db.users.push(user);
  });
}

export function findUserByEmail(email: string): User | null {
  const db = loadDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export { saveDb };
