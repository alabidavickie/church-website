import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, isStaff } from "@/lib/auth";
import { loadDb } from "@/lib/store";

export const SECTIONS: { slug: string; label: string; roles: string[] }[] = [
  { slug: "", label: "Overview", roles: ["pastor", "admin", "editor", "treasurer", "prayer_team", "welcome_team"] },
  { slug: "visitors", label: "New visitors", roles: ["pastor", "admin", "welcome_team"] },
  { slug: "prayer", label: "Prayer requests", roles: ["pastor", "admin", "prayer_team"] },
  { slug: "review", label: "Testimonies", roles: ["pastor", "admin", "editor"] },
  { slug: "chat", label: "Bible study chat", roles: ["pastor", "admin", "editor"] },
  { slug: "registrations", label: "Registrations", roles: ["pastor", "admin", "editor", "welcome_team"] },
  { slug: "gatherings", label: "Gatherings & Zoom", roles: ["pastor", "admin"] },
  { slug: "live", label: "Live stream", roles: ["pastor", "admin"] },
  { slug: "announcement", label: "Announcement bar", roles: ["pastor", "admin", "editor"] },
  { slug: "reminders", label: "Reminders", roles: ["pastor", "admin"] },
  { slug: "events", label: "Events & banners", roles: ["pastor", "admin", "editor"] },
  { slug: "sermons", label: "Sermons & studies", roles: ["pastor", "admin", "editor"] },
  { slug: "message", label: "Today's Message", roles: ["pastor", "admin", "editor"] },
  { slug: "social", label: "Post to social", roles: ["pastor", "admin", "editor"] },
  { slug: "offerings", label: "Offerings", roles: ["pastor", "admin", "treasurer"] },
  { slug: "users", label: "Users & roles", roles: ["pastor", "admin"] },
  { slug: "settings", label: "Settings", roles: ["pastor", "admin"] },
  { slug: "launch", label: "Launch", roles: ["pastor", "admin"] },
  { slug: "two-factor", label: "Two-step sign-in", roles: ["pastor", "admin", "editor", "treasurer"] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user || !isStaff(user)) redirect("/login");
  const db = loadDb();
  const counts: Record<string, number> = {
    visitors: db.visitPlans.filter((v) => v.status === "expected").length,
    prayer: db.prayers.filter((p) => p.status === "new").length,
    review: db.testimonies.filter((t) => t.status === "pending").length,
    chat: db.studyPosts.filter((p) => p.status === "flagged").length,
    registrations: db.registrations.filter((r) => r.status === "registered").length,
  };
  const visible = SECTIONS.filter((s) => s.roles.includes(user.role));
  return (
    <div style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: "#faf8f3", minHeight: "100vh" }}>
      <div style={{ background: "#0b1830", color: "#f4f1ea", padding: "12px 0" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700 }}>Admin · {user.name} ({user.role})</span>
          <span><Link href="/" style={{ color: "#f4f1ea" }}>View site</Link> · <Link href="/account" style={{ color: "#f4f1ea" }}>My account</Link></span>
        </div>
      </div>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: 32, paddingTop: 24, paddingBottom: 48 }}>
        <nav aria-label="Admin menu" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {visible.map((s) => (
            <Link
              key={s.slug || "overview"}
              href={s.slug ? `/admin/${s.slug}` : "/admin"}
              style={{
                padding: "10px 14px", textDecoration: "none", color: "#0b1830",
                background: counts[s.slug] ? "#fdf3d7" : "transparent",
                borderLeft: "4px solid #e6a82a",
              }}
            >
              {s.label}{counts[s.slug] ? ` (${counts[s.slug]})` : ""}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
