import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDb } from "@/lib/store";
import { ActionForm } from "@/components/ActionForm";
import { postDiscussion } from "@/lib/actions";

export default async function BibleStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = loadDb();
  const study = db.sermons.find((s) => s.slug === slug && s.type === "bible_study" && s.published);
  if (!study) notFound();
  const posts = db.studyPosts.filter((p) => p.studyId === study.id && p.status === "published");
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <p style={{ color: "#46526a" }}>Bible study · {study.series}</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>{study.title}</h1>
        <p><strong>{study.scripture}</strong> · {study.speaker}</p>
        <p style={{ fontSize: 20 }}>{study.summary}</p>
        <p style={{ color: "#46526a" }}>Recording: {study.youtubeVideoId.startsWith("[") ? "[YouTube video — not supplied yet]" : `https://www.youtube.com/watch?v=${study.youtubeVideoId}`}</p>
        <h2 style={{ fontSize: 26 }}>Questions to think about</h2>
        <ul>{study.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        <h2 style={{ fontSize: 26 }}>Discussion &amp; questions</h2>
        <p>Anyone can read. To post, add your name and pass the human check. Posts with links wait for a moderator.</p>
        {posts.length === 0 && <p>No posts yet — start the discussion.</p>}
        {posts.map((p) => (
          <div key={p.id} className="card" style={{ marginBottom: 12 }}>
            <p style={{ margin: "0 0 6px" }}><strong>{p.displayName}</strong> {p.isTeacher && <span style={{ background: "#e6a82a", padding: "2px 8px", fontSize: 13 }}>Teacher</span>}</p>
            <p style={{ margin: 0 }}>{p.body}</p>
          </div>
        ))}
        <ActionForm action={postDiscussion.bind(null, study.id)} submitLabel="Post your question">
          <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="body">Your question or thought</label><textarea id="body" name="body" rows={4} required /></div>
        </ActionForm>
        <p><Link href="/bible-study" className="tl">Back to Bible study</Link></p>
      </div>
    </section>
  );
}
