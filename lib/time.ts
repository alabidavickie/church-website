// Times are stored in America/New_York and shown in the visitor's city.
// The visitor's time zone comes from a cookie set by the browser (see
// lib/timezone-client); the server falls back to America/New_York.
import { CHURCH_TIMEZONE } from "./settings";

export function visitorTimeZone(headers: Headers): string {
  const cookie = headers.get("cookie") ?? "";
  const m = /(?:^|;\s*)cw_tz=([^;]+)/.exec(cookie);
  if (m) {
    try {
      const tz = decodeURIComponent(m[1]);
      Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    } catch {
      return CHURCH_TIMEZONE;
    }
  }
  return CHURCH_TIMEZONE;
}

/** "Sunday 10:30 am" in the visitor's zone, with the New York time underneath when different. */
export function formatGatheringTime(iso: string, visitorTz: string): { local: string; ny: string | null } {
  const date = new Date(iso);
  const local = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: visitorTz,
  }).format(date);
  const city = visitorTz.split("/").pop()?.replace(/_/g, " ") ?? "New York";
  const localLabel = `${local} ${city}`;
  if (visitorTz === CHURCH_TIMEZONE) return { local: localLabel, ny: null };
  const ny = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: CHURCH_TIMEZONE,
  }).format(date);
  return { local: localLabel, ny: `${ny} New York` };
}

export function formatDate(iso: string, visitorTz = CHURCH_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: visitorTz,
  }).format(new Date(iso));
}

/** Next Sunday 10:30 am New York time, as an ISO string. */
export function nextSundayService(now = new Date()): Date {
  const d = new Date(now);
  const ny = new Date(d.toLocaleString("en-US", { timeZone: CHURCH_TIMEZONE }));
  const day = ny.getDay();
  const add = (7 - day) % 7;
  const target = new Date(ny);
  target.setDate(ny.getDate() + add);
  target.setHours(10, 30, 0, 0);
  if (target.getTime() <= ny.getTime()) target.setDate(target.getDate() + 7);
  return target;
}

/** Countdown label for the homepage: "in 2 days" or "happening now". */
export function countdownLabel(target: Date, now = new Date()): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0 && diff > -2 * 60 * 60 * 1000) return "happening now";
  if (diff <= 0) return "just finished";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"} ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}

/** Build an .ics calendar file for a gathering. */
export function icsFor(title: string, startIso: string, endIso: string, location: string, description = ""): string {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Church Website//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@church-website`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(new Date(startIso))}`,
    `DTEND:${stamp(new Date(endIso))}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
