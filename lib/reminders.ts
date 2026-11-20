// Automatic reminders (Phase 8). A reminder is due once, in its window,
// and the reminder_log stops it ever going out twice — running the sender
// twice must send each reminder once (see docs/TESTING.md).
// Windows: Bible study day-before and 1 hour before; prayer 1 hour before;
// event registrants and planned visitors day-before; Today's Message when
// published (Sunday afternoon); new events when published; church news by hand.
import { loadDb, withDb, newId } from "./store";
import { sendEmail, reminderEmailBody, emailConfigured } from "./email";

export type DueJob = {
  key: string; // dedupe key: kind + target + email
  kind: string;
  email: string;
  subject: string;
  body: string;
  targetId: string;
};

export function dueJobs(now: Date, baseUrl: string): DueJob[] {
  const db = loadDb();
  const jobs: DueJob[] = [];
  const inWindow = (target: Date, beforeMs: number, windowMs = 15 * 60 * 1000) => {
    const diff = target.getTime() - now.getTime();
    return diff > 0 && diff <= beforeMs + windowMs && diff >= beforeMs - windowMs;
  };
  const subs = (topic: string) => db.reminderSubscriptions.filter((s) => s.confirmed && s.topics.includes(topic));

  for (const g of db.sessionsGatherings) {
    const start = new Date(g.startsAt);
    const manage = `${baseUrl}/reminders`;
    if (g.type === "bible_study") {
      if (inWindow(start, 24 * 60 * 60 * 1000)) {
        for (const s of subs("bible_study")) {
          jobs.push({ key: `bible_study:day_before:${g.id}:${s.email}`, kind: "Bible study — day before", email: s.email, subject: `Tomorrow: ${g.topic}`, body: reminderEmailBody("Bible study", g.topic, start.toLocaleString(), g.zoomUrl, manage), targetId: g.id });
        }
      }
      if (inWindow(start, 60 * 60 * 1000)) {
        for (const s of subs("bible_study")) {
          jobs.push({ key: `bible_study:hour_before:${g.id}:${s.email}`, kind: "Bible study — 1 hour before", email: s.email, subject: `Starting soon: ${g.topic}`, body: reminderEmailBody("Bible study", g.topic, start.toLocaleString(), g.zoomUrl, manage), targetId: g.id });
        }
      }
    }
    if (g.type === "prayer" && inWindow(start, 60 * 60 * 1000)) {
      for (const s of subs("prayer")) {
        jobs.push({ key: `prayer:hour_before:${g.id}:${s.email}`, kind: "Prayer — 1 hour before", email: s.email, subject: `Starting soon: ${g.topic}`, body: reminderEmailBody("Prayer meeting", g.topic, start.toLocaleString(), g.zoomUrl, manage), targetId: g.id });
      }
    }
  }
  for (const ev of db.events) {
    const start = new Date(ev.startsAt);
    if (inWindow(start, 24 * 60 * 60 * 1000)) {
      for (const r of db.registrations.filter((x) => x.eventId === ev.id && x.status === "registered")) {
        jobs.push({ key: `event:day_before:${ev.id}:${r.email}`, kind: "Event — day before", email: r.email, subject: `Tomorrow: ${ev.title}`, body: reminderEmailBody("Event", ev.title, start.toLocaleString(), ev.location, `${baseUrl}/events/${ev.slug}`), targetId: ev.id });
      }
    }
  }
  for (const v of db.visitPlans.filter((x) => x.status === "expected")) {
    const start = new Date(v.visitDate);
    if (inWindow(start, 24 * 60 * 60 * 1000)) {
      jobs.push({ key: `visit:day_before:${v.id}:${v.email}`, kind: "Visit — day before", email: v.email, subject: "See you on Sunday", body: reminderEmailBody("Planned visit", "Sunday service", start.toLocaleString(), "", `${baseUrl}/im-new`), targetId: v.id });
    }
  }
  return jobs;
}

/** Send every due reminder once. Returns {sent, preview, skipped}. */
export async function sendDueReminders(now: Date, baseUrl: string): Promise<{ sent: number; preview: number; skipped: number }> {
  const jobs = dueJobs(now, baseUrl);
  let sent = 0, preview = 0, skipped = 0;
  for (const job of jobs) {
    const already = loadDb().reminderLog.some((l) => l.kind === job.key);
    if (already) { skipped++; continue; }
    const result = await sendEmail(job.email, job.subject, job.body);
    withDb((db) => {
      db.reminderLog.push({ id: newId("rl"), kind: job.key, email: job.email, subject: job.subject, status: result.preview ? "preview" : "sent", sentAt: new Date().toISOString() });
    });
    if (result.preview) preview++; else sent++;
  }
  return { sent, preview, skipped };
}

export function reminderMode(): "live" | "preview" {
  return emailConfigured() ? "live" : "preview";
}
