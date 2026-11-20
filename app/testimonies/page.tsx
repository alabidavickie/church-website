import Link from "next/link";
import { loadDb, publicName } from "@/lib/store";

export const metadata = { title: "Testimonies" };

const CATEGORIES = ["All", "Healing", "Salvation", "Provision", "Deliverance", "Answered prayer"];

export default async function TestimoniesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const category = (await searchParams).category ?? "All";
  const db = loadDb();
  let list = db.testimonies.filter((t) => t.status === "approved");
  if (category !== "All") list = list.filter((t) => t.category === category);
  return (
    <section className="sec">
      <div className="wrap">
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Testimonies</h1>
        <p style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Link key={c} href={c === "All" ? "/testimonies" : `/testimonies?category=${encodeURIComponent(c)}`} className="btn sm" style={category === c ? {} : { background: "#efeadf" }}>
              {c} {c === "All" ? `(${db.testimonies.filter((t) => t.status === "approved").length})` : `(${db.testimonies.filter((t) => t.status === "approved" && t.category === c).length})`}
            </Link>
          ))}
        </p>
        {list.length === 0 && <p>No testimonies in this category yet.</p>}
        {list.map((t) => (
          <div key={t.id} className="card" style={{ marginBottom: 16 }}>
            <p style={{ color: "#46526a", margin: "0 0 6px" }}>{t.category}</p>
            <h2 style={{ fontSize: 26, margin: "0 0 8px" }}>{t.title}</h2>
            <p>{t.body}</p>
            <p style={{ fontWeight: 600, margin: 0 }}>— {publicName(t)}</p>
          </div>
        ))}
        <p><Link href="/testimonies/share" className="btn">Share a testimony</Link></p>
      </div>
    </section>
  );
}
