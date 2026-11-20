import Link from "next/link";
import { headers } from "next/headers";
import { loadDb } from "@/lib/store";
import { visitorTimeZone, formatGatheringTime, nextSundayService, countdownLabel } from "@/lib/time";
import { ActionForm } from "@/components/ActionForm";
import { submitContact } from "@/lib/actions";

export default async function HomePage() {
  const db = loadDb();
  const s = db.settings;
  const tz = visitorTimeZone(await headers());
  const sunday = nextSundayService();
  const sundayTime = formatGatheringTime(sunday.toISOString(), tz);
  const bibleStudy = db.sessionsGatherings.find((g) => g.type === "bible_study");
  const prayer = db.sessionsGatherings.find((g) => g.type === "prayer");
  const message = db.todaysMessages[0];
  const events = db.events.filter((e) => new Date(e.startsAt) > new Date()).slice(0, 3);
  const testimonies = db.testimonies.filter((t) => t.status === "approved" && t.featured).slice(0, 3);
  const sermons = db.sermons.filter((x) => x.published && x.type === "sermon").slice(0, 3);
  const live = db.liveStatus.isLive;

  return (
    <>
      {live && (
        <section className="sec" style={{ background: "#0b1830", color: "#f4f1ea", paddingTop: 48, paddingBottom: 48 }}>
          <div className="wrap">
            <p style={{ margin: 0, fontWeight: 700 }}><span aria-hidden style={{ color: "#f26d5b" }}>●</span> Live now</p>
            <h1 className="display" style={{ fontSize: 40 }}>Watch the service live</h1>
            <p>The service is streaming now on YouTube.</p>
            <Link href="/watch" className="btn">Watch live</Link>
          </div>
        </section>
      )}

      <section className="sec" style={{ background: "#0b1830", color: "#f4f1ea" }}>
        <div className="wrap">
          <p style={{ color: "#e6a82a", fontSize: 26, margin: "0 0 18px" }}>{message?.title ?? "Today's Message"}</p>
          <h1 className="display" style={{ fontSize: "clamp(44px, 5vw, 84px)", margin: 0 }}>{message?.title ?? "Today's Message"}</h1>
          <p style={{ fontSize: 20, maxWidth: "38ch" }}>{message?.summary}</p>
          <p style={{ color: "#b9c4d6" }}>{message?.scripture} · {message?.publishedAt ? new Date(message.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px" }}>
            <Link href="/todays-message" className="tl">Read the full message</Link>
            <Link href="/todays-message" className="tl">Previous messages</Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="display" style={{ fontSize: "clamp(34px, 3vw, 60px)", margin: "0 0 36px" }}>This week</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 36 }}>
            <div>
              <h3 style={{ fontSize: 24 }}>Sunday service</h3>
              <p><strong>{sundayTime.local}</strong></p>
              {sundayTime.ny && <p style={{ color: "#46526a" }}>{sundayTime.ny}</p>}
              <p>Next service {countdownLabel(sunday)} · {s.address}</p>
              <p><Link href="/im-new" className="tl">Plan your visit</Link></p>
            </div>
            <div>
              <h3 style={{ fontSize: 24 }}>Bible study</h3>
              <p><strong>{bibleStudy?.topic ?? "Bible study"}</strong></p>
              <p>{bibleStudy ? formatGatheringTime(bibleStudy.startsAt, tz).local : ""}</p>
              <p><Link href="/bible-study" className="tl">Join on Zoom</Link> · <Link href="/bible-study" className="tl">Past studies</Link></p>
            </div>
            <div>
              <h3 style={{ fontSize: 24 }}>Prayer meeting</h3>
              <p><strong>{prayer?.topic ?? "Friday prayer"}</strong></p>
              <p>{prayer ? formatGatheringTime(prayer.startsAt, tz).local : ""}</p>
              <p><Link href="/prayer" className="tl">Join on Zoom</Link> · <Link href="/prayer" className="tl">Prayer request</Link></p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "#efeadf" }}>
        <div className="wrap">
          <h2 className="display" style={{ fontSize: "clamp(34px, 3vw, 60px)", margin: "0 0 24px" }}>Upcoming events</h2>
          {events.length === 0 && <p>No upcoming events yet.</p>}
          {events.map((e) => (
            <p key={e.id} style={{ fontSize: 22 }}>
              <Link href={`/events/${e.slug}`} className="tl">{e.title}</Link>
              {" — "}{formatGatheringTime(e.startsAt, tz).local}
            </p>
          ))}
          <p><Link href="/events" className="btn">All events</Link></p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="display" style={{ fontSize: "clamp(34px, 3vw, 60px)", margin: "0 0 24px" }}>What God has done</h2>
          {testimonies.map((t) => (
            <blockquote key={t.id} style={{ fontSize: 24, maxWidth: "28ch", margin: "0 0 24px" }}>
              “{t.body}” <footer style={{ fontSize: 16, fontWeight: 600 }}>— {t.display === "anonymous" ? "Anonymous" : t.name.split(" ")[0]}, {t.category}</footer>
            </blockquote>
          ))}
          <p><Link href="/testimonies" className="tl">Read all testimonies</Link></p>
        </div>
      </section>

      <section className="sec" style={{ background: "#0b1830", color: "#f4f1ea" }}>
        <div className="wrap">
          <h2 className="display" style={{ fontSize: "clamp(34px, 3vw, 60px)", margin: "0 0 24px" }}>Recent sermons</h2>
          {sermons.map((x) => (
            <p key={x.id} style={{ fontSize: 20 }}>
              <Link href={`/sermons/${x.slug}`} style={{ color: "#f4f1ea" }} className="tl">{x.title}</Link>
              {" — "}{x.scripture} · {x.speaker}
            </p>
          ))}
          <p><Link href="/sermons" className="tl">Sermon archive</Link></p>
        </div>
      </section>

      <section className="sec" style={{ background: "#e6a82a" }}>
        <div className="wrap">
          <h2 className="display" style={{ fontSize: "clamp(34px, 3vw, 60px)", margin: "0 0 16px" }}>Offering</h2>
          <p style={{ maxWidth: "46ch" }}>Give any amount, in your own currency, one time, weekly or monthly. Card details go straight to Stripe — the church never sees them.</p>
          <Link href="/offerings" className="btn" style={{ background: "#0b1830", color: "#faf8f3" }}>Give an Offering</Link>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <h2 className="display" style={{ fontSize: "clamp(34px, 3vw, 60px)", margin: "0 0 16px" }}>Find us</h2>
          <p>{s.address}</p>
          <p>Sunday {s.sundayTime} · Friday prayer {s.fridayPrayerTime} (New York time)</p>
          <p><Link href="/im-new" className="tl">Plan your visit</Link> · <Link href="/contact" className="tl">Contact us</Link></p>
        </div>
      </section>

      <section className="sec" style={{ background: "#efeadf" }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <h2 className="display" style={{ fontSize: 32, margin: "0 0 16px" }}>Ask us anything</h2>
          <ActionForm action={submitContact} submitLabel="Send your message">
            <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={5} required /></div>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
