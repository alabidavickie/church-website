// Account server actions: sign up, log in (with two-step), password reset,
// profile, reminders and giving. Every auth form verifies Turnstile first.
"use server";

import { redirect } from "next/navigation";
import { verifyTurnstile, honeypotFilled } from "./turnstile";
import { loadDb, withDb, newId, type Role } from "./store";
import {
  hashPassword, checkPassword, randomToken, createSession, destroySession,
  currentUser, pendingTotpUser, findUserByEmail, saveUser, roleNeedsTotp,
  newTotpSecret, verifyTotp, newBackupCodes, sha256, otpauthUrl,
} from "./auth";
import { sendEmail } from "./email";
import { baseUrl } from "./site";
import type { ActionResult } from "./actions";
import { headers } from "next/headers";

async function checkHuman(form: FormData): Promise<string | null> {
  if (honeypotFilled(form)) return "Please try again.";
  const token = form.get("cf-turnstile-response");
  const ip = (await headers()).get("x-forwarded-for") ?? undefined;
  const ok = await verifyTurnstile(typeof token === "string" ? token : null, ip);
  return ok ? null : "The human check did not pass. Please try again.";
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function signup(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), email = str(form, "email"), password = str(form, "password");
  if (!name || !email.includes("@") || password.length < 8) return { ok: false, message: "Add your name, a valid email and a password of at least 8 characters." };
  if (findUserByEmail(email)) return { ok: false, message: "An account with that email already exists. Try logging in." };
  const db = loadDb();
  const isFirst = db.users.length === 0;
  const token = randomToken(16);
  withDb((d) => {
    d.users.push({
      id: newId("u"), email, name, phone: "", role: isFirst ? "pastor" : "member",
      passwordHash: hashPassword(password), emailConfirmed: false, confirmToken: token,
      resetToken: null, resetExpires: null, totpSecret: null, totpEnabled: false,
      backupCodes: [], createdAt: new Date().toISOString(),
    });
  });
  const result = await sendEmail(email, "Confirm your email", `Welcome. Confirm your account: ${baseUrl()}/check-email?confirm=${token}`);
  return {
    ok: true,
    message: isFirst ? "Account created — as the first account, it has the Pastor role. Confirm your email to finish." : "Account created. Confirm your email to finish.",
    preview: result.preview ? `${baseUrl()}/check-email?confirm=${token}` : undefined,
    token,
  };
}

export async function login(_prev: ActionResult | null, form: FormData): Promise<ActionResult & { needsTotp?: boolean; needsSetup?: boolean }> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const user = findUserByEmail(str(form, "email"));
  if (!user || !checkPassword(str(form, "password"), user.passwordHash)) return { ok: false, message: "Email or password is wrong." };
  if (!user.emailConfirmed) return { ok: false, message: "Confirm your email first — use the link we sent you." };
  if (roleNeedsTotp(user.role)) {
    await createSession(user.id, true);
    if (!user.totpEnabled) return { ok: true, needsTotp: true, needsSetup: true, message: "Two-step sign-in is required for your role. Set it up now." };
    return { ok: true, needsTotp: true, message: "Enter the 6-digit code from your authenticator app." };
  }
  await createSession(user.id);
  redirect("/account");
}

export async function verifyLoginCode(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await pendingTotpUser();
  if (!user) return { ok: false, message: "Your sign-in session expired. Log in again." };
  const code = str(form, "code");
  if (user.totpEnabled && user.totpSecret && verifyTotp(user.totpSecret, code)) {
    withDb((db) => { const s = db.sessions.find((x) => x.userId === user.id && x.totpPending); if (s) s.totpPending = false; });
    redirect("/account");
  }
  // Backup code (single use)
  const hash = sha256(code);
  if (user.backupCodes.includes(hash)) {
    const updated = { ...user, backupCodes: user.backupCodes.filter((c) => c !== hash) };
    saveUser(updated);
    withDb((db) => { const s = db.sessions.find((x) => x.userId === user.id && x.totpPending); if (s) s.totpPending = false; });
    redirect("/account");
  }
  return { ok: false, message: "That code is wrong. Try again." };
}

export async function beginTotpSetup(): Promise<{ secret: string; url: string } | { error: string }> {
  const user = (await currentUser()) ?? (await pendingTotpUser());
  if (!user) return { error: "Log in first." };
  const secret = newTotpSecret();
  saveUser({ ...user, totpSecret: secret, totpEnabled: false });
  return { secret, url: otpauthUrl(secret, user.email) };
}

export async function confirmTotpSetup(_prev: ActionResult | null, form: FormData): Promise<ActionResult & { backupCodes?: string[] }> {
  const user = (await currentUser()) ?? (await pendingTotpUser());
  if (!user || !user.totpSecret) return { ok: false, message: "Start two-step setup first." };
  if (!verifyTotp(user.totpSecret, str(form, "code"))) return { ok: false, message: "That code is wrong. Check your authenticator app and try again." };
  const { codes, hashes } = newBackupCodes();
  saveUser({ ...user, totpEnabled: true, backupCodes: hashes });
  withDb((db) => { const s = db.sessions.find((x) => x.userId === user.id && x.totpPending); if (s) s.totpPending = false; });
  return { ok: true, message: "Two-step sign-in is on. Save these 8 backup codes somewhere safe — each works once.", backupCodes: codes };
}

export async function disableTotp(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Log in first." };
  if (!checkPassword(str(form, "password"), user.passwordHash)) return { ok: false, message: "Your password is wrong." };
  saveUser({ ...user, totpEnabled: false, totpSecret: null, backupCodes: [] });
  return { ok: true, message: "Two-step sign-in is off. Staff roles will be asked to set it up again at their next sign-in." };
}

export async function forgotPassword(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const email = str(form, "email");
  const user = findUserByEmail(email);
  // Always answer the same way, so nobody can probe for accounts.
  if (user) {
    const token = randomToken(16);
    saveUser({ ...user, resetToken: token, resetExpires: Date.now() + 60 * 60 * 1000 });
    const result = await sendEmail(email, "Reset your password", `Reset your password: ${baseUrl()}/reset-password?token=${token}\nThis link works once and expires in one hour.`);
    return { ok: true, message: "If an account uses that email, a reset link is on its way.", preview: result.preview ? `${baseUrl()}/reset-password?token=${token}` : undefined, token };
  }
  return { ok: true, message: "If an account uses that email, a reset link is on its way." };
}

export async function resetPassword(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const token = str(form, "token");
  const password = str(form, "password");
  if (password.length < 8) return { ok: false, message: "Choose a password of at least 8 characters." };
  const db = loadDb();
  const user = db.users.find((u) => u.resetToken === token && u.resetExpires && u.resetExpires > Date.now());
  if (!user) return { ok: false, message: "That reset link is not valid or has expired." };
  saveUser({ ...user, passwordHash: hashPassword(password), resetToken: null, resetExpires: null });
  withDb((d) => { d.sessions = d.sessions.filter((s) => s.userId !== user.id); });
  return { ok: true, message: "Your password is set. Log in with it now." };
}

export async function confirmEmail(token: string): Promise<ActionResult> {
  const done = withDb((db) => {
    const user = db.users.find((u) => u.confirmToken === token);
    if (!user) return false;
    user.emailConfirmed = true;
    user.confirmToken = null;
    return true;
  });
  return done ? { ok: true, message: "Your email is confirmed — you are in." } : { ok: false, message: "That confirmation link is not valid." };
}

export async function resendConfirmation(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const user = findUserByEmail(str(form, "email"));
  if (user && !user.emailConfirmed) {
    const token = randomToken(16);
    saveUser({ ...user, confirmToken: token });
    const result = await sendEmail(user.email, "Confirm your email", `Confirm your account: ${baseUrl()}/check-email?confirm=${token}`);
    return { ok: true, message: "A new confirmation link is on its way.", preview: result.preview ? `${baseUrl()}/check-email?confirm=${token}` : undefined, token };
  }
  return { ok: true, message: "If that account is still waiting, a new link is on its way." };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function updateProfile(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Log in first." };
  saveUser({ ...user, name: str(form, "name") || user.name, phone: str(form, "phone") });
  return { ok: true, message: "Your profile is saved." };
}

export async function changePassword(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Log in first." };
  if (!checkPassword(str(form, "current"), user.passwordHash)) return { ok: false, message: "Your current password is wrong." };
  if (str(form, "password").length < 8) return { ok: false, message: "Choose a password of at least 8 characters." };
  saveUser({ ...user, passwordHash: hashPassword(str(form, "password")) });
  return { ok: true, message: "Your password is changed." };
}

export async function deleteAccount(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Log in first." };
  if (!checkPassword(str(form, "password"), user.passwordHash)) return { ok: false, message: "Your password is wrong." };
  withDb((db) => {
    db.users = db.users.filter((u) => u.id !== user.id);
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);
    db.testimonies = db.testimonies.filter((t) => t.userId !== user.id);
    db.offeringCommitments = db.offeringCommitments.filter((o) => o.userId !== user.id);
    db.registrations = db.registrations.map((r) => (r.userId === user.id ? { ...r, userId: null } : r));
    db.reminderSubscriptions = db.reminderSubscriptions.map((s) => (s.userId === user.id ? { ...s, userId: null } : s));
  });
  await destroySession();
  redirect("/");
}

export async function setReminderPref(topic: string, on: boolean): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  withDb((db) => {
    let sub = db.reminderSubscriptions.find((s) => s.userId === user.id);
    if (!sub) {
      sub = { id: newId("rs"), email: user.email, userId: user.id, topics: [], confirmed: true, token: randomToken(16), createdAt: new Date().toISOString() };
      db.reminderSubscriptions.push(sub);
    }
    sub.topics = on ? Array.from(new Set([...sub.topics, topic])) : sub.topics.filter((t) => t !== topic);
  });
}

export async function saveOfferingCommitment(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Log in first." };
  const amount = Number(form.get("amount"));
  if (!Number.isFinite(amount) || amount < 0.5) return { ok: false, message: "The smallest gift is the equivalent of $0.50." };
  withDb((db) => {
    db.offeringCommitments.push({
      id: newId("oc"), userId: user.id, amount, currency: str(form, "currency") || "USD",
      fund: str(form, "fund") || "Offering", frequency: (str(form, "frequency") || "monthly") as "weekly" | "monthly",
      active: true, createdAt: new Date().toISOString(),
    });
  });
  return { ok: true, message: "Your regular Offering is recorded. Paying happens through Stripe Checkout — card details never touch this site." };
}

export async function stopOfferingCommitment(id: string): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  withDb((db) => {
    const c = db.offeringCommitments.find((x) => x.id === id && x.userId === user.id);
    if (c) c.active = false;
  });
}

export type { Role };
