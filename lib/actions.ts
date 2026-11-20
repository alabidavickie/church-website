// Public server actions. Every one verifies Turnstile on the server before
// saving anything, and every one checks the honeypot field. See AGENTS.md.
"use server";

import { headers } from "next/headers";
import { verifyTurnstile, honeypotFilled } from "./turnstile";
import { loadDb, withDb, newId } from "./store";
import { sendEmail } from "./email";
import { randomToken } from "./auth";
import { parseOfferingAmount, amountToMinor } from "./money";
import { createCheckoutSession, stripeMode } from "./stripe";
import { baseUrl } from "./site";

export type ActionResult = { ok: boolean; message: string; preview?: string; token?: string };

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

export async function submitContact(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), email = str(form, "email"), message = str(form, "message");
  if (!name || !email || !message) return { ok: false, message: "Name, email and a message are all needed." };
  withDb((db) => {
    db.contactMessages.push({ id: newId("cm"), name, email, message, source: str(form, "source") || "contact", messageSlug: str(form, "messageSlug") || null, handled: false, createdAt: new Date().toISOString() });
  });
  return { ok: true, message: "Thank you — your message is saved. We will reply to your email." };
}

export async function submitPrayer(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), email = str(form, "email"), request = str(form, "request");
  if (!name || !request) return { ok: false, message: "Your name and prayer request are needed." };
  const wantsContact = form.get("wantsContact") === "on";
  if (wantsContact && !email) return { ok: false, message: "Add an email so the prayer team can contact you." };
  withDb((db) => {
    db.prayers.push({ id: newId("pr"), name, email, request, isPrivate: form.get("isPrivate") === "on", wantsContact, status: "new", note: "", createdAt: new Date().toISOString() });
  });
  return { ok: true, message: "Thank you. The prayer team will pray for you — privately, if you asked for that." };
}

export async function submitVisitPlan(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), email = str(form, "email");
  if (!name || !email) return { ok: false, message: "Your name and email are needed." };
  withDb((db) => {
    db.visitPlans.push({
      id: newId("vp"), name, email, phone: str(form, "phone"), visitDate: str(form, "visitDate"),
      adults: Number(form.get("adults") ?? 1), children: Number(form.get("children") ?? 0),
      notes: str(form, "notes"), meetAtDoor: form.get("meetAtDoor") === "on",
      status: "expected", createdAt: new Date().toISOString(),
    });
  });
  return { ok: true, message: "Thank you — we are expecting you. You will get directions and a reminder the day before." };
}

export async function submitEventRegistration(eventId: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), email = str(form, "email");
  if (!name || !email) return { ok: false, message: "Your name and email are needed." };
  const db = loadDb();
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return { ok: false, message: "That event was not found." };
  if (!event.registrationOpen) return { ok: false, message: "Registration is closed for this event." };
  const registered = db.registrations.filter((r) => r.eventId === eventId && r.status === "registered").length;
  const party = Number(form.get("adults") ?? 1) + Number(form.get("children") ?? 0);
  const status = event.capacity > 0 && registered + party > event.capacity ? "waiting_list" : "registered";
  withDb((d) => {
    d.registrations.push({ id: newId("rg"), eventId, userId: null, name, email, phone: str(form, "phone"), adults: Number(form.get("adults") ?? 1), children: Number(form.get("children") ?? 0), notes: str(form, "notes"), status, createdAt: new Date().toISOString() });
  });
  return { ok: true, message: status === "waiting_list" ? "This event is full — you are on the waiting list and we will tell you if a place opens." : "You are registered. You will get a reminder the day before." };
}

const BLOCKED_WORDS = ["casino", "crypto giveaway", "free money", "viagra"];

export async function submitTestimony(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), email = str(form, "email"), title = str(form, "title"), body = str(form, "body");
  if (!name || !email || !title || !body) return { ok: false, message: "Name, email, a title and your testimony are all needed." };
  if (body.length > 3000) return { ok: false, message: "Testimonies are up to 3,000 characters." };
  const display = (str(form, "display") || "first") as "full" | "first" | "anonymous";
  withDb((db) => {
    db.testimonies.push({
      id: newId("tm"), userId: null, name, email, category: str(form, "category") || "Other",
      title, body, originalBody: body, display, status: "pending", featured: false,
      reviewedBy: null, reviewedAt: null, createdAt: new Date().toISOString(),
    });
  });
  return { ok: true, message: "Thank you. Your testimony is waiting for review — nothing is published until the ministry team approves it." };
}

export async function postDiscussion(studyId: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const name = str(form, "name"), body = str(form, "body");
  if (!name || !body) return { ok: false, message: "Your name and a message are needed." };
  const flagged = /https?:\/\//.test(body) || BLOCKED_WORDS.some((w) => body.toLowerCase().includes(w));
  withDb((db) => {
    db.studyPosts.push({ id: newId("sp"), studyId, displayName: name, body, isTeacher: false, status: flagged ? "flagged" : "published", createdAt: new Date().toISOString() });
  });
  return { ok: true, message: flagged ? "Your post is waiting for a moderator to check it." : "Your post is live." };
}

export async function subscribeReminder(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const email = str(form, "email");
  if (!email.includes("@")) return { ok: false, message: "Add a valid email address." };
  const topics = form.getAll("topics").map(String).filter(Boolean);
  if (topics.length === 0) return { ok: false, message: "Choose at least one reminder." };
  const token = randomToken(16);
  withDb((db) => {
    const existing = db.reminderSubscriptions.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) { existing.topics = Array.from(new Set([...existing.topics, ...topics])); existing.token = token; }
    else db.reminderSubscriptions.push({ id: newId("rs"), email, userId: null, topics, confirmed: false, token, createdAt: new Date().toISOString() });
  });
  const result = await sendEmail(email, "Confirm your reminders", `Confirm your reminders by opening this link: ${baseUrl()}/reminders?confirm=${token}\n\nYou asked for: ${topics.join(", ")}.`);
  return {
    ok: true,
    message: result.preview
      ? "Preview mode — no email service is connected yet, so here is the confirmation link instead."
      : "Check your email — open the confirmation link to finish.",
    preview: result.preview ? `${baseUrl()}/reminders?confirm=${token}` : undefined,
    token,
  };
}

export async function confirmReminder(token: string): Promise<ActionResult> {
  const done = withDb((db) => {
    const sub = db.reminderSubscriptions.find((s) => s.token === token);
    if (!sub) return false;
    sub.confirmed = true;
    return true;
  });
  return done ? { ok: true, message: "You are all set — reminders are on." } : { ok: false, message: "That confirmation link is not valid." };
}

export async function unsubscribeAll(token: string): Promise<ActionResult> {
  const done = withDb((db) => {
    const sub = db.reminderSubscriptions.find((s) => s.token === token);
    if (!sub) return false;
    sub.topics = [];
    return true;
  });
  return done ? { ok: true, message: "You are unsubscribed from all reminders." } : { ok: false, message: "That link is not valid." };
}

export async function submitOffering(_prev: ActionResult | null, form: FormData): Promise<ActionResult & { url?: string; mode?: string }> {
  const err = await checkHuman(form);
  if (err) return { ok: false, message: err };
  const parsed = parseOfferingAmount(str(form, "amount"));
  if (!parsed.ok) return { ok: false, message: parsed.error };
  const currency = str(form, "currency") || "USD";
  const fund = str(form, "fund") || "Offering";
  const frequency = (str(form, "frequency") || "one_time") as "one_time" | "weekly" | "monthly";
  const session = await createCheckoutSession({
    amountMinor: amountToMinor(parsed.amount, currency), currency, fund, frequency,
    donorName: str(form, "name"), donorEmail: str(form, "email"),
    successUrl: `${baseUrl()}/offerings/thank-you`, cancelUrl: `${baseUrl()}/offerings`,
  });
  if (session.mode === "preview") {
    return { ok: true, mode: "preview", message: `Preview mode — Stripe is not connected yet, so no payment was taken. Your gift of ${parsed.amount} ${currency} (${fund}, ${frequency.replace("_", " ")}) is recorded here only as a preview.` };
  }
  return { ok: true, mode: "live", url: session.url ?? undefined, message: "Continuing to Stripe Checkout." };
}

export async function logConsent(form: FormData): Promise<void> {
  const anonId = String(form.get("anonId") ?? "anon");
  withDb((db) => {
    db.consentLog.push({ id: newId("cl"), anonId, chat: form.get("chat") === "true", media: form.get("media") === "true", analytics: form.get("analytics") === "true", createdAt: new Date().toISOString() });
  });
}
