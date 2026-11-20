import Link from "next/link";
import { headers } from "next/headers";
import { loadDb } from "@/lib/store";
import { visitorTimeZone, formatGatheringTime } from "@/lib/time";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const db = loadDb();
  const tz = visitorTimeZone(await headers());
  const now = new Date();
  const upcoming = db.events.filter((e) => new Date(e.startsAt) > now).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const past = db.events.filter((e) => new Date(e.startsAt) <= now).sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
  return (
    <section className="sec">
      <div className="wrap">
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Events</h1>
        <h2 style={{ fontSize: 26 }}>Upcoming</h2>
        {upcoming.length === 0 && <p>No upcoming events yet.</p>}
        {upcoming.map((e) => (
          <p key={e.id} style={{ fontSize: 20 }}>
            <Link href={`/events/${e.slug}`} className="tl">{e.title}</Link>
            <br />{formatGatheringTime(e.startsAt, tz).local} · {e.location}
          </p>
        ))}
        <h2 style={{ fontSize: 26, marginTop: 48 }}>Past events</h2>
        {past.map((e) => (
          <p key={e.id}><Link href={`/events/${e.slug}`} className="tl">{e.title}</Link> — {formatGatheringTime(e.startsAt, tz).local}</p>
        ))}
      </div>
    </section>
  );
}
