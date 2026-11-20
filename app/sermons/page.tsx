import Link from "next/link";
import { loadDb } from "@/lib/store";

export const metadata = { title: "Sermons" };

export default async function SermonsPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; speaker?: string; series?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase();
  const db = loadDb();
  let sermons = db.sermons.filter((s) => s.published);
  if (sp.type) sermons = sermons.filter((s) => s.type === sp.type);
  if (sp.speaker) sermons = sermons.filter((s) => s.speaker === sp.speaker);
  if (sp.series) sermons = sermons.filter((s) => s.series === sp.series);
  if (q) sermons = sermons.filter((s) => (s.title + " " + s.summary + " " + s.scripture).toLowerCase().includes(q));
  sermons = sermons.sort((a, b) => +new Date(b.preachedOn) - +new Date(a.preachedOn));
  const speakers = Array.from(new Set(db.sermons.map((s) => s.speaker)));
  const series = Array.from(new Set(db.sermons.map((s) => s.series)));
  return (
    <section className="sec">
      <div className="wrap">
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Sermons</h1>
        <form method="get" action="/sermons" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search by title, topic or scripture" style={{ padding: 12, border: "2px solid #0b1830", flex: "1 1 240px" }} />
          <select name="type" defaultValue={sp.type ?? ""} style={{ padding: 12, border: "2px solid #0b1830" }}>
            <option value="">All types</option><option value="sermon">Sermons</option><option value="bible_study">Bible studies</option>
          </select>
          <select name="speaker" defaultValue={sp.speaker ?? ""} style={{ padding: 12, border: "2px solid #0b1830" }}>
            <option value="">All speakers</option>{speakers.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="series" defaultValue={sp.series ?? ""} style={{ padding: 12, border: "2px solid #0b1830" }}>
            <option value="">All series</option>{series.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn sm">Search</button>
        </form>
        {sermons.length === 0 && <p>No sermons match. Try clearing a filter.</p>}
        {sermons.map((s) => (
          <p key={s.id} style={{ fontSize: 20 }}>
            <Link href={`/sermons/${s.slug}`} className="tl">{s.title}</Link>
            <br />{s.type === "sermon" ? "Sermon" : "Bible study"} · {s.scripture} · {s.speaker} · {new Date(s.preachedOn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        ))}
      </div>
    </section>
  );
}
