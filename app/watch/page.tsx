import { loadDb } from "@/lib/store";

export const metadata = { title: "Watch" };

export default async function WatchPage() {
  const db = loadDb();
  const s = db.settings;
  const live = db.liveStatus.isLive;
  const sermons = db.sermons.filter((x) => x.published).slice(0, 6);
  return (
    <section className="sec">
      <div className="wrap">
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Watch</h1>
        {live ? (
          <div style={{ background: "#0b1830", color: "#f4f1ea", padding: 32, marginBottom: 32 }}>
            <p style={{ fontWeight: 700 }}>● Live now</p>
            <p>The service is streaming now on YouTube.</p>
            <p style={{ color: "#b9c4d6" }}>The player appears here when the church is live. Videos only load after you allow “Videos, posts and maps” in your cookie choices.</p>
          </div>
        ) : (
          <p>No live stream right now. The player appears here by itself when the church goes live on YouTube.</p>
        )}
        <p>YouTube channel: {s.youtubeChannelUrl.startsWith("[") ? "[YouTube channel link — the church has not supplied it yet]" : s.youtubeChannelUrl}</p>
        <h2 style={{ fontSize: 26 }}>Recent services</h2>
        {sermons.map((x) => (
          <p key={x.id}><a href={`/sermons/${x.slug}`} className="tl">{x.title}</a> — {x.scripture} · {x.speaker}</p>
        ))}
        <p style={{ color: "#46526a" }}>Video embeds load only after you allow videos in your cookie choices.</p>
      </div>
    </section>
  );
}
