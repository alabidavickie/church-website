import Link from "next/link";
import { headers } from "next/headers";
import { loadDb } from "@/lib/store";
import { visitorTimeZone, formatGatheringTime } from "@/lib/time";
import { ActionForm } from "@/components/ActionForm";
import { subscribeReminder } from "@/lib/actions";

export const metadata = { title: "Bible Study" };

export default async function BibleStudyPage() {
  const db = loadDb();
  const s = db.settings;
  const tz = visitorTimeZone(await headers());
  const gathering = db.sessionsGatherings.find((g) => g.type === "bible_study");
  const studies = db.sermons.filter((x) => x.published && x.type === "bible_study").sort((a, b) => +new Date(b.preachedOn) - +new Date(a.preachedOn));
  return (
    <section className="sec">
      <div className="wrap">
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Bible Study</h1>
        {gathering && (
          <div style={{ background: "#efeadf", padding: 24, marginBottom: 32 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>This week: {gathering.topic}</h2>
            <p>{formatGatheringTime(gathering.startsAt, tz).local}</p>
            <p>
              {gathering.zoomUrl.startsWith("[")
                ? "Zoom link: [Zoom link — the church has not supplied it yet]"
                : <Link href={gathering.zoomUrl} className="tl">Join on Zoom</Link>}
            </p>
            <h3 style={{ fontSize: 20 }}>Email me a reminder</h3>
            <ActionForm action={subscribeReminder} submitLabel="Email me a reminder" previewNote="You will get an email the day before and one hour before, with the Zoom link.">
              <input type="hidden" name="topics" value="bible_study" />
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            </ActionForm>
          </div>
        )}
        <p>Bible study is {s.bibleStudyDay}s at {s.bibleStudyTime} (New York time).</p>
        <h2 style={{ fontSize: 26 }}>Past studies</h2>
        {studies.map((x) => (
          <p key={x.id}>
            <Link href={`/bible-study/${x.slug}`} className="tl">{x.title}</Link>
            <br />{x.summary}
          </p>
        ))}
      </div>
    </section>
  );
}
