import { describe, it, expect, afterEach } from "vitest";
import { dueJobs, sendDueReminders } from "./reminders";
import { withDb, loadDb } from "./store";

// Reminder timing: a Bible study on 2026-11-25 19:00 New York. A confirmed
// subscriber must get a day-before job 24h out and an hour-before job 1h out,
// and running the sender twice must send each reminder once.
describe("reminders", () => {
  const email = "reminder-test@example.org";

  afterEach(() => {
    withDb((db) => {
      db.reminderSubscriptions = db.reminderSubscriptions.filter((s) => s.email !== email);
      db.reminderLog = db.reminderLog.filter((l) => l.email !== email);
    });
  });

  it("schedules day-before and hour-before jobs in their windows", () => {
    withDb((db) => {
      db.reminderSubscriptions.push({ id: "test-rs", email, userId: null, topics: ["bible_study"], confirmed: true, token: "test-token", createdAt: new Date().toISOString() });
    });
    const dayBefore = dueJobs(new Date("2026-11-24T19:05:00-05:00"), "http://localhost:3000");
    expect(dayBefore.some((j) => j.kind.includes("day before") && j.email === email)).toBe(true);
    const hourBefore = dueJobs(new Date("2026-11-25T18:05:00-05:00"), "http://localhost:3000");
    expect(hourBefore.some((j) => j.kind.includes("1 hour before") && j.email === email)).toBe(true);
    const tooEarly = dueJobs(new Date("2026-11-23T19:00:00-05:00"), "http://localhost:3000");
    expect(tooEarly.some((j) => j.email === email)).toBe(false);
  });

  it("running the sender twice sends each reminder once", async () => {
    withDb((db) => {
      db.reminderSubscriptions.push({ id: "test-rs2", email, userId: null, topics: ["bible_study"], confirmed: true, token: "test-token-2", createdAt: new Date().toISOString() });
    });
    const first = await sendDueReminders(new Date("2026-11-24T19:05:00-05:00"), "http://localhost:3000");
    expect(first.preview + first.sent).toBeGreaterThan(0);
    const second = await sendDueReminders(new Date("2026-11-24T19:05:00-05:00"), "http://localhost:3000");
    expect(second.sent + second.preview).toBe(0);
    expect(second.skipped).toBeGreaterThan(0);
    const logged = loadDb().reminderLog.filter((l) => l.email === email);
    const keys = new Set(logged.map((l) => l.kind));
    expect(keys.size).toBe(logged.length); // no duplicate keys
  });
});
