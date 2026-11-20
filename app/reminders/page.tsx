import Link from "next/link";
import { loadDb } from "@/lib/store";
import { confirmReminder, unsubscribeAll } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";
import { subscribeReminder } from "@/lib/actions";

export const metadata = { title: "Reminders" };

const TOPICS = [
  { id: "bible_study", label: "Bible study" },
  { id: "prayer", label: "Prayer meeting" },
  { id: "events", label: "New events" },
  { id: "todays_message", label: "Today's Message" },
  { id: "news", label: "Church news" },
];

export default async function RemindersPage({ searchParams }: { searchParams: Promise<{ confirm?: string; manage?: string; unsubscribe?: string }> }) {
  const sp = await searchParams;
  let banner: string | null = null;
  let manageSub: { email: string; topics: string[] } | null = null;
  if (sp.confirm) {
    const r = await confirmReminder(sp.confirm);
    banner = r.message;
  }
  if (sp.unsubscribe) {
    const r = await unsubscribeAll(sp.unsubscribe);
    banner = r.message;
  }
  if (sp.manage) {
    const db = loadDb();
    const sub = db.reminderSubscriptions.find((s) => s.token === sp.manage);
    if (sub) manageSub = { email: sub.email, topics: sub.topics };
  }
  const db = loadDb();
  const nextStudy = db.sessionsGatherings.find((g) => g.type === "bible_study");
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Reminders</h1>
        {banner && <p role="status" className="notice">{banner}</p>}
        {manageSub ? (
          <>
            <p>You are all set, {manageSub.email}. Your reminders:</p>
            <ul>{TOPICS.map((t) => <li key={t.id}>{t.label}: {manageSub.topics.includes(t.id) ? "on" : "off"}</li>)}</ul>
            <p><Link href={`/reminders?unsubscribe=${sp.manage}`} className="tl">Unsubscribe from all reminders</Link></p>
            {nextStudy && (
              <p><a href={`/api/ics?title=${encodeURIComponent(nextStudy.topic)}&start=${encodeURIComponent(nextStudy.startsAt)}`} className="btn">Add to calendar (.ics)</a></p>
            )}
          </>
        ) : (
          <>
            <p>Get an email before Bible study and prayer, when a new event is published, and when Today&apos;s Message is published. Every reminder carries the Zoom link and an add-to-calendar link, and every one has a one-click unsubscribe.</p>
            <ActionForm action={subscribeReminder} submitLabel="Turn reminders on">
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
              <div className="field"><span>Reminders for</span>
                {TOPICS.map((t) => (
                  <label key={t.id} style={{ display: "block" }}><input type="checkbox" name="topics" value={t.id} defaultChecked={t.id === "bible_study"} /> {t.label}</label>
                ))}
              </div>
            </ActionForm>
          </>
        )}
      </div>
    </section>
  );
}
