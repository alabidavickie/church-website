// Data layer.
//
// Production target: Supabase (Postgres + RLS). The schema and policies for
// that live in supabase/migrations/ and can be applied with `supabase db push`.
// Locally, without a Supabase project, the same records are kept in a JSON
// file under .data/ (gitignored, never shipped). Every read/write in the app
// goes through this module, so swapping the store for Supabase is one seam —
// see docs/PLAN.md. No live member data is ever seeded here.
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS, SEED_EVENTS, SEED_SERMONS, SEED_TESTIMONIES, type SiteSettings } from "./settings";

export type Role = "member" | "prayer_team" | "welcome_team" | "editor" | "treasurer" | "admin" | "pastor";

export const ROLES: Role[] = ["member", "prayer_team", "welcome_team", "editor", "treasurer", "admin", "pastor"];

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  passwordHash: string;
  emailConfirmed: boolean;
  confirmToken: string | null;
  resetToken: string | null;
  resetExpires: number | null;
  totpSecret: string | null;
  totpEnabled: boolean;
  backupCodes: string[]; // sha256 hashes, single use
  createdAt: string;
};

export type SermonRow = {
  id: string; slug: string; title: string; type: "sermon" | "bible_study";
  speaker: string; series: string; scripture: string; book: string;
  preachedOn: string; youtubeVideoId: string; summary: string;
  questions: string[]; published: boolean;
};

export type EventRow = {
  id: string; slug: string; title: string; startsAt: string; endsAt: string;
  location: string; description: string; capacity: number;
  registrationOpen: boolean; showInBanner: boolean;
};

export type TestimonyRow = {
  id: string; userId: string | null; name: string; email: string;
  category: string; title: string; body: string; originalBody: string;
  display: "full" | "first" | "anonymous"; status: "pending" | "approved" | "declined" | "changes_requested";
  featured: boolean; reviewedBy: string | null; reviewedAt: string | null; createdAt: string;
};

export type PrayerRow = {
  id: string; name: string; email: string; request: string;
  isPrivate: boolean; wantsContact: boolean;
  status: "new" | "prayed" | "followed_up"; note: string; createdAt: string;
};

export type StudyPostRow = {
  id: string; studyId: string; displayName: string; body: string;
  isTeacher: boolean; status: "published" | "flagged" | "hidden";
  createdAt: string;
};

export type Db = {
  settings: SiteSettings;
  users: User[];
  sessions: { token: string; userId: string; expiresAt: number; totpPending: boolean }[];
  sermons: SermonRow[];
  events: EventRow[];
  registrations: { id: string; eventId: string; userId: string | null; name: string; email: string; phone: string; adults: number; children: number; notes: string; status: "registered" | "waiting_list" | "cancelled"; createdAt: string }[];
  testimonies: TestimonyRow[];
  prayers: PrayerRow[];
  studyPosts: StudyPostRow[];
  contactMessages: { id: string; name: string; email: string; message: string; source: string; messageSlug: string | null; handled: boolean; createdAt: string }[];
  visitPlans: { id: string; name: string; email: string; phone: string; visitDate: string; adults: number; children: number; notes: string; meetAtDoor: boolean; status: "expected" | "welcomed" | "followed_up"; createdAt: string }[];
  reminderSubscriptions: { id: string; email: string; userId: string | null; topics: string[]; confirmed: boolean; token: string; createdAt: string }[];
  reminderLog: { id: string; kind: string; email: string; subject: string; status: "sent" | "preview"; sentAt: string }[];
  announcements: { id: string; message: string; link: string; style: "info" | "urgent"; startsAt: string; endsAt: string; active: boolean }[];
  todaysMessages: { id: string; slug: string; title: string; scripture: string; summary: string; body: string[]; verse: string; steps: string[]; publishedAt: string }[];
  offerings: { id: string; userId: string | null; stripeEventId: string | null; stripeSessionId: string | null; stripeSubscriptionId: string | null; amount: number; currency: string; settledUsdCents: number | null; fund: string; frequency: "one_time" | "weekly" | "monthly"; donorName: string; donorEmail: string; status: string; createdAt: string }[];
  offeringCommitments: { id: string; userId: string; amount: number; currency: string; fund: string; frequency: "weekly" | "monthly"; active: boolean; createdAt: string }[];
  socialAccounts: { platform: "youtube" | "facebook" | "instagram"; accountName: string; connected: boolean; connectedBy: string | null }[];
  socialPosts: { id: string; caption: string; mediaType: "none" | "photo" | "video"; mediaName: string; platforms: string[]; youtubeTitle: string; youtubeVisibility: string; instagramType: string; scheduledAt: string | null; status: "scheduled" | "posted" | "preview"; createdBy: string; createdAt: string; results: { platform: string; status: "posted" | "preview" | "failed" | "not_connected"; link: string | null; error: string | null }[] }[];
  consentLog: { id: string; anonId: string; chat: boolean; media: boolean; analytics: boolean; createdAt: string }[];
  liveStatus: { isLive: boolean; youtubeVideoId: string; startedAt: string | null; setBy: "auto" | "manual" };
  launchChecks: { key: string; done: boolean; doneAt: string | null }[];
  sessionsGatherings: { id: string; type: "bible_study" | "prayer"; startsAt: string; topic: string; zoomUrl: string; videoUrl: string }[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function seedDb(): Db {
  return {
    settings: DEFAULT_SETTINGS,
    users: [],
    sessions: [],
    sermons: SEED_SERMONS.map((s) => ({ ...s })),
    events: SEED_EVENTS.map((e) => ({ ...e })),
    registrations: [],
    testimonies: SEED_TESTIMONIES.map((t) => ({
      id: t.id, userId: null, name: t.name, email: "", category: t.category,
      title: t.title, body: t.body, originalBody: t.body, display: t.display,
      status: "approved" as const, featured: t.featured, reviewedBy: null,
      reviewedAt: null, createdAt: "2026-11-01T00:00:00Z",
    })),
    prayers: [],
    studyPosts: [
      { id: "p1", studyId: "s4", displayName: "Grace", body: "The picture of the shepherd carrying the sheep stayed with me all week.", isTeacher: false, status: "published", createdAt: "2026-11-12T10:00:00Z" },
      { id: "p2", studyId: "s4", displayName: "[Teacher]", body: "Good — that is the point of the psalm. He carries us when we cannot walk.", isTeacher: true, status: "published", createdAt: "2026-11-12T11:00:00Z" },
    ],
    contactMessages: [],
    visitPlans: [],
    reminderSubscriptions: [],
    reminderLog: [],
    announcements: [],
    todaysMessages: [{
      id: "m1", slug: "the-god-who-sees", title: "The God Who Sees", scripture: "Genesis 16:13",
      summary: "Hagar, alone in the desert, names God El Roi — the God who sees. This week, the same God sees you in the place you think nobody notices.",
      body: [
        "Hagar had been sent away, and she had run out of water, hope and options. It was there, not in a temple, that God met her.",
        "She gave God a name from her own experience: El Roi, the God who sees me. God's seeing is not distant watching — it is care that moves towards us.",
        "This week, bring the place where you feel unseen to the God who sees. He has not missed it, and he has not missed you.",
      ],
      verse: "She gave this name to the LORD who spoke to her: 'You are the God who sees me.' — Genesis 16:13 (KJV)",
      steps: ["Read Genesis 16 slowly this week.", "Tell one person where you need to be seen.", "Join us for prayer on Friday."],
      publishedAt: "2026-11-15T10:30:00-05:00",
    }],
    offerings: [],
    offeringCommitments: [],
    socialAccounts: [
      { platform: "youtube", accountName: "", connected: false, connectedBy: null },
      { platform: "facebook", accountName: "", connected: false, connectedBy: null },
      { platform: "instagram", accountName: "", connected: false, connectedBy: null },
    ],
    socialPosts: [],
    consentLog: [],
    liveStatus: { isLive: false, youtubeVideoId: "", startedAt: null, setBy: "manual" },
    launchChecks: [],
    sessionsGatherings: [
      { id: "g1", type: "bible_study", startsAt: "2026-11-25T19:00:00-05:00", topic: "Psalm 23: The Lord Is My Shepherd", zoomUrl: "[Zoom link for Bible study]", videoUrl: "" },
      { id: "g2", type: "prayer", startsAt: "2026-11-27T19:00:00-05:00", topic: "Friday Prayer Meeting", zoomUrl: "[Zoom link for prayer]", videoUrl: "" },
    ],
  };
}

export function loadDb(): Db {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Db;
    }
  } catch {
    // Corrupt local store: start fresh rather than crash the site.
  }
  const db = seedDb();
  saveDb(db);
  return db;
}

export function saveDb(db: Db): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

/** Run a mutation against the store and persist it. */
export function withDb<T>(fn: (db: Db) => T): T {
  const db = loadDb();
  const out = fn(db);
  saveDb(db);
  return out;
}

export function publicName(t: TestimonyRow): string {
  if (t.display === "anonymous") return "Anonymous";
  if (t.display === "first") return t.name.split(" ")[0];
  return t.name;
}
