import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDb } from "@/lib/store";

export default async function SermonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = loadDb();
  const sermon = db.sermons.find((s) => s.slug === slug && s.published);
  if (!sermon) notFound();
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <p style={{ color: "#46526a" }}>{sermon.type === "sermon" ? "Sermon" : "Bible study"} · {sermon.series}</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>{sermon.title}</h1>
        <p><strong>{sermon.scripture}</strong> · {sermon.speaker} · {new Date(sermon.preachedOn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        <p style={{ fontSize: 20 }}>{sermon.summary}</p>
        <p style={{ color: "#46526a" }}>Video: {sermon.youtubeVideoId.startsWith("[") ? "[YouTube video — the church has not supplied the video ID yet]" : `https://www.youtube.com/watch?v=${sermon.youtubeVideoId}`}</p>
        {sermon.questions.length > 0 && (
          <>
            <h2 style={{ fontSize: 26 }}>Questions to think about</h2>
            <ul>{sermon.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </>
        )}
        <p><Link href="/sermons" className="tl">Back to the sermon archive</Link></p>
      </div>
    </section>
  );
}
