import Link from "next/link";
import { loadDb } from "@/lib/store";
import { ActionForm } from "@/components/ActionForm";
import { submitContact } from "@/lib/actions";

export const metadata = { title: "Today's Message" };

export default async function TodaysMessagePage() {
  const db = loadDb();
  const messages = db.todaysMessages;
  const latest = messages[0];
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        {latest && (
          <>
            <p style={{ color: "#46526a" }}>{latest.scripture} · {new Date(latest.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>{latest.title}</h1>
            <p style={{ fontSize: 20 }}>{latest.summary}</p>
            {latest.body.map((p, i) => <p key={i}>{p}</p>)}
            <blockquote style={{ background: "#e6a82a", padding: 24, borderRadius: "999px 999px 0 0" }}>{latest.verse}</blockquote>
            <h2 style={{ fontSize: 26 }}>This week</h2>
            <ul>{latest.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </>
        )}
        <h2 style={{ fontSize: 26, marginTop: 48 }}>Previous messages</h2>
        {messages.slice(1).map((m) => (
          <p key={m.id}><Link href={`/todays-message/${m.slug}`} className="tl">{m.title}</Link> — {m.scripture}</p>
        ))}
        <h2 style={{ fontSize: 26, marginTop: 48 }}>Respond to this message</h2>
        <ActionForm action={submitContact} submitLabel="Send your response">
          <input type="hidden" name="source" value="todays-message" />
          <input type="hidden" name="messageSlug" value={latest?.slug ?? ""} />
          <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={5} required /></div>
        </ActionForm>
      </div>
    </section>
  );
}
