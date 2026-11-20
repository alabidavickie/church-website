import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { loadDb } from "@/lib/store";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin · Overview" };

export default async function AdminDashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const db = loadDb();
  const needs = [
    { label: "New visitors to follow up", n: db.visitPlans.filter((v) => v.status === "expected").length, href: "/admin/visitors" },
    { label: "New prayer requests", n: db.prayers.filter((p) => p.status === "new").length, href: "/admin/prayer" },
    { label: "Testimonies waiting for review", n: db.testimonies.filter((t) => t.status === "pending").length, href: "/admin/review" },
    { label: "Flagged Bible study posts", n: db.studyPosts.filter((p) => p.status === "flagged").length, href: "/admin/chat" },
    { label: "Unhandled contact messages", n: db.contactMessages.filter((m) => !m.handled).length, href: "/admin/registrations" },
  ];
  return (
    <div>
      <h1 className="display" style={{ fontSize: 40, margin: "0 0 8px" }}>Overview</h1>
      <p>Welcome back, {user.name}. Here is what needs attention.</p>
      {needs.map((x) => (
        <p key={x.href}><Link href={x.href} className="tl">{x.label}</Link> — <strong>{x.n}</strong></p>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Totals</h2>
      <p>Members: {db.users.length} · Events: {db.events.length} · Sermons: {db.sermons.length} · Offerings recorded: {db.offerings.length} · Reminder subscribers: {db.reminderSubscriptions.filter((s) => s.confirmed).length}</p>
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Recent contact messages</h2>
      {db.contactMessages.slice(-5).reverse().map((m) => (
        <div key={m.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{m.name}</strong> ({m.email}) — {m.handled ? "handled" : "not handled"}</p>
          <p style={{ margin: 0 }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}
