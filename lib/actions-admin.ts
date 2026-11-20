// Admin server actions. Every action checks the caller's role on the
// server — never only in the menu. Private prayer requests are visible to
// pastors only (see lib/store.ts and the RLS policies in supabase/).
"use server";

import { currentUser } from "./auth";
import { loadDb, withDb, newId, type Role } from "./store";
import type { SiteSettings } from "./settings";
import { sendEmail } from "./email";
import { baseUrl } from "./site";
import type { ActionResult } from "./actions";
import { sendDueReminders } from "./reminders";
import { publishToPlatform, socialGuards, captionTooLong, type Platform } from "./social";
import { randomToken, hashPassword } from "./auth";

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function requireRoles(roles: Role[]) {
  const user = await currentUser();
  if (!user || !roles.includes(user.role)) throw new Error("Not allowed.");
  return user;
}

export async function adminSaveSettings(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireRoles(["admin", "pastor"]);
  void user;
  const keys: (keyof SiteSettings)[] = ["churchName", "phone", "email", "officeHours", "address", "sundayTime", "fridayPrayerTime", "bibleStudyDay", "bibleStudyTime", "youtubeChannelId", "youtubeChannelUrl", "facebookPageUrl", "instagramUrl", "zoomBibleStudy", "zoomPrayer", "stripePaymentUrl", "tawktoId", "aboutStory", "statementOfFaith", "legalName", "ein"];
  withDb((db) => {
    const record = db.settings as unknown as Record<string, string>;
    for (const key of keys) {
      const v = str(form, key);
      if (v) record[key] = v;
    }
    const funds = str(form, "funds");
    if (funds) db.settings.funds = funds.split(",").map((s) => s.trim()).filter(Boolean);
    const currencies = str(form, "currencies");
    if (currencies) db.settings.currencies = currencies.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  });
  return { ok: true, message: "Settings saved." };
}

export async function adminSaveAnnouncement(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor", "editor"]);
  withDb((db) => {
    db.announcements = [{
      id: newId("an"), message: str(form, "message"), link: str(form, "link"),
      style: (str(form, "style") || "info") as "info" | "urgent",
      startsAt: str(form, "startsAt") || new Date().toISOString(),
      endsAt: str(form, "endsAt") || new Date(Date.now() + 7 * 86400000).toISOString(),
      active: form.get("active") !== "off",
    }];
  });
  return { ok: true, message: "Announcement bar saved." };
}

export async function adminSaveEvent(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor", "editor"]);
  const id = str(form, "id") || newId("e");
  withDb((db) => {
    const existing = db.events.find((e) => e.id === id);
    const row = {
      id, slug: str(form, "slug") || str(form, "title").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: str(form, "title"), startsAt: str(form, "startsAt"), endsAt: str(form, "endsAt"),
      location: str(form, "location"), description: str(form, "description"),
      capacity: Number(form.get("capacity") ?? 0), registrationOpen: form.get("registrationOpen") === "on",
      showInBanner: form.get("showInBanner") === "on",
    };
    if (existing) Object.assign(existing, row); else db.events.push(row);
  });
  return { ok: true, message: "Event saved." };
}

export async function adminDeleteEvent(id: string): Promise<void> {
  await requireRoles(["admin", "pastor", "editor"]);
  withDb((db) => { db.events = db.events.filter((e) => e.id !== id); });
}

export async function adminReviewTestimony(id: string, decision: "approved" | "declined" | "changes_requested", note: string): Promise<void> {
  const user = await requireRoles(["admin", "pastor", "editor"]);
  withDb((db) => {
    const t = db.testimonies.find((x) => x.id === id);
    if (!t) return;
    t.status = decision;
    t.reviewedBy = user.id;
    t.reviewedAt = new Date().toISOString();
    if (note) t.body = note;
  });
  const t = loadDb().testimonies.find((x) => x.id === id);
  if (t && t.email) {
    await sendEmail(t.email, decision === "approved" ? "Your testimony is published" : "About your testimony",
      decision === "approved" ? `Thank you — your testimony "${t.title}" is now on the Testimonies wall.` : `The ministry team has a note about your testimony "${t.title}". ${note}`);
  }
}

export async function adminUpdatePrayer(id: string, status: "prayed" | "followed_up", note: string): Promise<void> {
  await requireRoles(["admin", "pastor", "prayer_team"]);
  withDb((db) => {
    const p = db.prayers.find((x) => x.id === id);
    if (p) { p.status = status; p.note = note; }
  });
}

export async function adminUpdatePost(id: string, status: "published" | "hidden"): Promise<void> {
  await requireRoles(["admin", "pastor", "editor"]);
  withDb((db) => {
    const p = db.studyPosts.find((x) => x.id === id);
    if (p) p.status = status;
  });
}

export async function adminUpdateVisitor(id: string, status: "welcomed" | "followed_up"): Promise<void> {
  await requireRoles(["admin", "pastor", "welcome_team"]);
  withDb((db) => {
    const v = db.visitPlans.find((x) => x.id === id);
    if (v) v.status = status;
  });
}

export async function adminSaveMessage(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor", "editor"]);
  const title = str(form, "title");
  if (!title) return { ok: false, message: "A title is needed." };
  withDb((db) => {
    db.todaysMessages.unshift({
      id: newId("m"), slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title,
      scripture: str(form, "scripture"), summary: str(form, "summary"),
      body: str(form, "body").split(/\n+/).filter(Boolean),
      verse: str(form, "verse"), steps: str(form, "steps").split(/\n+/).filter(Boolean),
      publishedAt: new Date().toISOString(),
    });
  });
  return { ok: true, message: "Today's Message is published." };
}

export async function adminSaveSermon(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor", "editor"]);
  const title = str(form, "title");
  if (!title) return { ok: false, message: "A title is needed." };
  const id = str(form, "id") || newId("s");
  withDb((db) => {
    const row = {
      id, slug: str(form, "slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title,
      type: (str(form, "type") || "sermon") as "sermon" | "bible_study",
      speaker: str(form, "speaker"), series: str(form, "series"), scripture: str(form, "scripture"),
      book: str(form, "book"), preachedOn: str(form, "preachedOn") || new Date().toISOString().slice(0, 10),
      youtubeVideoId: str(form, "youtubeVideoId"), summary: str(form, "summary"),
      questions: str(form, "questions").split(/\n+/).filter(Boolean),
      published: form.get("published") === "on",
    };
    const existing = db.sermons.find((s) => s.id === id);
    if (existing) Object.assign(existing, row); else db.sermons.push(row);
  });
  return { ok: true, message: "Sermon saved." };
}

export async function adminSetRole(userId: string, role: Role): Promise<ActionResult> {
  const me = await requireRoles(["admin", "pastor"]);
  const db = loadDb();
  const target = db.users.find((u) => u.id === userId);
  if (!target) return { ok: false, message: "That person was not found." };
  const staff = db.users.filter((u) => (u.role === "admin" || u.role === "pastor") && u.id !== userId);
  if ((target.role === "admin" || target.role === "pastor") && !["admin", "pastor"].includes(role) && staff.length === 0 && me.id === userId) {
    return { ok: false, message: "You cannot remove the last Pastor/Admin — the church would be locked out." };
  }
  withDb((d) => { const u = d.users.find((x) => x.id === userId); if (u) u.role = role; });
  return { ok: true, message: `${target.name} is now ${role}.` };
}

export async function adminInvite(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor"]);
  const email = str(form, "email"), name = str(form, "name");
  const role = (str(form, "role") || "editor") as Role;
  if (!email.includes("@") || !name) return { ok: false, message: "A name and a valid email are needed." };
  const token = randomToken(16);
  withDb((db) => {
    db.users.push({
      id: newId("u"), email, name, phone: "", role, passwordHash: hashPassword(randomToken(12)),
      emailConfirmed: false, confirmToken: null, resetToken: token, resetExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      totpSecret: null, totpEnabled: false, backupCodes: [], createdAt: new Date().toISOString(),
    });
  });
  const result = await sendEmail(email, "You are invited to help run the church website", `Set your password: ${baseUrl()}/reset-password?token=${token}\nYour role is ${role}.`);
  return { ok: true, message: "Invite created.", preview: result.preview ? `${baseUrl()}/reset-password?token=${token}` : undefined, token };
}

export async function adminSendNews(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor"]);
  const subject = str(form, "subject"), body = str(form, "body");
  if (!subject || !body) return { ok: false, message: "A subject and the news are needed." };
  const db = loadDb();
  const subs = db.reminderSubscriptions.filter((s) => s.confirmed && s.topics.includes("news"));
  let sent = 0, preview = 0;
  for (const s of subs) {
    const r = await sendEmail(s.email, subject, `${body}\n\nManage reminders: ${baseUrl()}/reminders`);
    withDb((d) => { d.reminderLog.push({ id: newId("rl"), kind: `news:${Date.now()}:${s.email}`, email: s.email, subject, status: r.preview ? "preview" : "sent", sentAt: new Date().toISOString() }); });
    if (r.preview) preview++; else sent++;
  }
  return { ok: true, message: `Church news prepared for ${subs.length} subscriber${subs.length === 1 ? "" : "s"} — ${sent} sent, ${preview} preview (no email service connected yet).` };
}

export async function adminRunReminders(): Promise<ActionResult> {
  await requireRoles(["admin", "pastor"]);
  const r = await sendDueReminders(new Date(), baseUrl());
  return { ok: true, message: `Reminders checked: ${r.sent} sent, ${r.preview} preview, ${r.skipped} already sent (skipped, not duplicated).` };
}

export async function adminCreateSocialPost(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await requireRoles(["admin", "pastor", "editor"]);
  const caption = str(form, "caption");
  const platforms = form.getAll("platforms").map(String) as Platform[];
  const mediaType = (str(form, "mediaType") || "none") as "none" | "photo" | "video";
  if (!caption) return { ok: false, message: "Write a caption first." };
  if (captionTooLong(caption)) return { ok: false, message: "The caption is over Instagram's 2,200-character limit." };
  const guard = socialGuards(platforms, mediaType);
  if (guard) return { ok: false, message: guard };
  const scheduledAt = str(form, "scheduledAt") || null;
  const results = await Promise.all(platforms.map((p) => publishToPlatform(p, { caption, youtubeTitle: str(form, "youtubeTitle"), instagramType: str(form, "instagramType") })));
  const status = scheduledAt ? "scheduled" : results.every((r) => r.status === "posted") ? "posted" : "preview";
  withDb((db) => {
    db.socialPosts.unshift({
      id: newId("spost"), caption, mediaType, mediaName: str(form, "mediaName"),
      platforms, youtubeTitle: str(form, "youtubeTitle"), youtubeVisibility: str(form, "youtubeVisibility") || "public",
      instagramType: str(form, "instagramType") || "post", scheduledAt, status,
      createdBy: user.id, createdAt: new Date().toISOString(),
      results: results.map((r) => ({ ...r, link: scheduledAt ? null : r.link })),
    });
  });
  return { ok: true, message: scheduledAt ? "Post scheduled — the 15-minute sender will post it when due." : "Post saved. Each platform's result is below." };
}

export async function adminRetrySocial(postId: string, platform: string): Promise<void> {
  const user = await requireRoles(["admin", "pastor", "editor"]);
  void user;
  const db = loadDb();
  const post = db.socialPosts.find((p) => p.id === postId);
  if (!post) return;
  const result = await publishToPlatform(platform as Platform, { caption: post.caption, youtubeTitle: post.youtubeTitle, instagramType: post.instagramType });
  withDb((d) => {
    const p = d.socialPosts.find((x) => x.id === postId);
    if (!p) return;
    p.results = p.results.map((r) => (r.platform === platform ? result : r));
  });
}

export async function adminCancelSocial(postId: string): Promise<void> {
  await requireRoles(["admin", "pastor", "editor"]);
  withDb((db) => { db.socialPosts = db.socialPosts.filter((p) => p.id !== postId); });
}

export async function adminRecordSocialAccount(platform: Platform, accountName: string): Promise<void> {
  await requireRoles(["admin", "pastor"]);
  withDb((db) => {
    const a = db.socialAccounts.find((x) => x.platform === platform);
    if (a) { a.accountName = accountName; }
  });
}

export async function adminSaveLaunchCheck(key: string, done: boolean): Promise<void> {
  await requireRoles(["admin", "pastor"]);
  withDb((db) => {
    const existing = db.launchChecks.find((c) => c.key === key);
    if (existing) { existing.done = done; existing.doneAt = done ? new Date().toISOString() : null; }
    else db.launchChecks.push({ key, done, doneAt: done ? new Date().toISOString() : null });
  });
}

export async function adminSaveGathering(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor"]);
  const id = str(form, "id") || newId("g");
  withDb((db) => {
    const row = {
      id, type: (str(form, "type") || "bible_study") as "bible_study" | "prayer",
      startsAt: str(form, "startsAt"), topic: str(form, "topic"),
      zoomUrl: str(form, "zoomUrl"), videoUrl: str(form, "videoUrl"),
    };
    const existing = db.sessionsGatherings.find((g) => g.id === id);
    if (existing) Object.assign(existing, row); else db.sessionsGatherings.push(row);
  });
  return { ok: true, message: "Gathering saved." };
}

export async function adminSetLive(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireRoles(["admin", "pastor"]);
  withDb((db) => {
    db.liveStatus = { isLive: form.get("isLive") === "on", youtubeVideoId: str(form, "youtubeVideoId"), startedAt: form.get("isLive") === "on" ? new Date().toISOString() : null, setBy: "manual" };
  });
  return { ok: true, message: "Live status saved." };
}
