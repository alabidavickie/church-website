import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDb } from "@/lib/store";

export default async function MessageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = loadDb();
  const message = db.todaysMessages.find((m) => m.slug === slug);
  if (!message) notFound();
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <p style={{ color: "#46526a" }}>{message.scripture} · {new Date(message.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>{message.title}</h1>
        <p style={{ fontSize: 20 }}>{message.summary}</p>
        {message.body.map((p, i) => <p key={i}>{p}</p>)}
        <blockquote style={{ background: "#e6a82a", padding: 24 }}>{message.verse}</blockquote>
        <h2 style={{ fontSize: 26 }}>This week</h2>
        <ul>{message.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <h2 style={{ fontSize: 26, marginTop: 48 }}>Earlier messages</h2>
        {db.todaysMessages.filter((m) => m.id !== message.id).map((m) => (
          <p key={m.id}><Link href={`/todays-message/${m.slug}`} className="tl">{m.title}</Link></p>
        ))}
      </div>
    </section>
  );
}
