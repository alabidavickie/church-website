import { loadDb } from "@/lib/store";

export const metadata = { title: "About us" };

export default async function AboutPage() {
  const db = loadDb();
  const s = db.settings;
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>About us</h1>
        <h2 style={{ fontSize: 26 }}>Our story</h2>
        <p>{s.aboutStory}</p>
        <h2 style={{ fontSize: 26 }}>Statement of faith</h2>
        <p>{s.statementOfFaith}</p>
        <h2 style={{ fontSize: 26 }}>Pastor</h2>
        <p><strong>[Pastor]</strong> — [short welcome and bio — the church has not supplied this yet.]</p>
        <h2 style={{ fontSize: 26 }}>Leaders</h2>
        <p>[Leaders and photos — the church has not supplied these yet.]</p>
        <p style={{ color: "#46526a" }}>Church details are still [placeholders] until the client sends them.</p>
      </div>
    </section>
  );
}
