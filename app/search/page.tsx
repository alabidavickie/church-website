import Link from "next/link";
import { loadDb } from "@/lib/store";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const db = loadDb();
  type Hit = { kind: string; title: string; href: string; text: string };
  const hits: Hit[] = [];
  if (q) {
    const pages = [
      { title: "Home", href: "/", text: "Today's Message, this week's services, events, testimonies, sermons" },
      { title: "About us", href: "/about", text: "Our story, statement of faith, pastor and leaders" },
      { title: "I'm New", href: "/im-new", text: "What to expect, parking, accessibility, children, plan your visit" },
      { title: "Events", href: "/events", text: "Upcoming events and registrations" },
      { title: "Sermons", href: "/sermons", text: "Past Sunday sermons and Bible studies" },
      { title: "Bible Study", href: "/bible-study", text: "This week's study, Zoom link, past studies" },
      { title: "Prayer", href: "/prayer", text: "Prayer meeting, Zoom link, prayer request form" },
      { title: "Testimonies", href: "/testimonies", text: "What God has done" },
      { title: "Offering", href: "/offerings", text: "Give any amount, one time, weekly or monthly" },
      { title: "Watch", href: "/watch", text: "YouTube live and recent services" },
      { title: "Contact", href: "/contact", text: "Address, map, contact form, live chat" },
    ];
    for (const p of pages) if ((p.title + " " + p.text).toLowerCase().includes(q)) hits.push({ kind: "Page", ...p });
    for (const s of db.sermons.filter((x) => x.published)) {
      if ((s.title + " " + s.summary + " " + s.scripture + " " + s.speaker).toLowerCase().includes(q)) {
        hits.push({ kind: s.type === "sermon" ? "Sermon" : "Bible study", title: s.title, href: `/sermons/${s.slug}`, text: s.summary });
      }
    }
    for (const e of db.events) {
      if ((e.title + " " + e.description).toLowerCase().includes(q)) hits.push({ kind: "Event", title: e.title, href: `/events/${e.slug}`, text: e.description });
    }
    for (const t of db.testimonies.filter((x) => x.status === "approved")) {
      if ((t.title + " " + t.body).toLowerCase().includes(q)) hits.push({ kind: "Testimony", title: t.title, href: "/testimonies", text: t.body });
    }
  }
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Search</h1>
        <form method="get" action="/search">
          <div className="field"><label htmlFor="q">Search sermons, studies, events, testimonies and pages</label>
          <input id="q" name="q" defaultValue={q} /></div>
          <button type="submit" className="btn">Search</button>
        </form>
        {q && (
          <>
            <p>{hits.length} result{hits.length === 1 ? "" : "s"} for “{q}”.</p>
            {hits.length === 0 && <p>Nothing matched. Try a different word — for example “prayer”, “Genesis” or “Thanksgiving”.</p>}
            {hits.map((h, i) => (
              <p key={i}><span style={{ color: "#46526a" }}>{h.kind} · </span><Link href={h.href} className="tl">{h.title}</Link><br />{h.text}</p>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
