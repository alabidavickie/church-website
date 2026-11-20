import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { loadDb } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { ActionForm } from "@/components/ActionForm";
import { updateProfile, changePassword, deleteAccount, logout } from "@/lib/actions-account";
import { ReminderSwitches, TotpSetup, DisableTotpForm, OfferingCommitmentForm, StopCommitmentButton } from "@/components/AccountClient";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const db = loadDb();
  const s = db.settings;
  const myTestimonies = db.testimonies.filter((t) => t.userId === user.id);
  const myRegistrations = db.registrations.filter((r) => r.userId === user.id || r.email === user.email);
  const myGifts = db.offerings.filter((o) => o.userId === user.id || o.donorEmail === user.email);
  const myCommitments = db.offeringCommitments.filter((o) => o.userId === user.id && o.active);
  const mySub = db.reminderSubscriptions.find((x) => x.userId === user.id);
  const totalGiven = myGifts.reduce((sum, g) => sum + g.amount, 0);
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 8px" }}>My account</h1>
        <p>{user.name} · {user.email} · Role: {user.role}</p>
        <form action={logout}><button type="submit" className="btn sm ghost">Log out</button></form>

        <h2 style={{ fontSize: 26, marginTop: 40 }}>Profile</h2>
        <ActionForm action={updateProfile} submitLabel="Save my profile">
          <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" defaultValue={user.name} required /></div>
          <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={user.phone} type="tel" /></div>
        </ActionForm>

        <h2 style={{ fontSize: 26, marginTop: 40 }}>Two-step sign-in</h2>
        <p>{user.totpEnabled ? "Two-step sign-in is on for your account." : "Two-step sign-in is off. It is required for pastor, admin, editor and treasurer roles."}</p>
        {user.totpEnabled ? <DisableTotpForm /> : <TotpSetup />}

        <h2 style={{ fontSize: 26, marginTop: 40 }}>Reminders</h2>
        <ReminderSwitches topics={mySub?.topics ?? []} />
        <p style={{ color: "#46526a" }}>Manage or stop all reminders from the link in any reminder email.</p>

        <h2 style={{ fontSize: 26, marginTop: 40 }}>My testimonies</h2>
        {myTestimonies.length === 0 && <p>You have not shared a testimony yet.</p>}
        {myTestimonies.map((t) => <p key={t.id}>{t.title} — {t.status}</p>)}

        <h2 style={{ fontSize: 26, marginTop: 40 }}>My registrations</h2>
        {myRegistrations.length === 0 && <p>No event registrations yet.</p>}
        {myRegistrations.map((r) => <p key={r.id}>{db.events.find((e) => e.id === r.eventId)?.title ?? "Event"} — {r.status}</p>)}

        <h2 style={{ fontSize: 26, marginTop: 40 }}>My giving</h2>
        <p>Total recorded gifts: {formatMoney(totalGiven, "USD")} (amounts shown in their own currencies in the list below).</p>
        {myGifts.length === 0 && <p>No gifts recorded yet.</p>}
        {myGifts.map((g) => <p key={g.id}>{formatMoney(g.amount, g.currency)} · {g.fund} · {g.frequency.replace("_", " ")} · {new Date(g.createdAt).toLocaleDateString()}</p>)}
        <p><a href="/api/account/statement" className="btn sm">Download my year-end statement</a></p>
        <h3 style={{ fontSize: 20 }}>Regular Offering</h3>
        {myCommitments.map((c) => (
          <p key={c.id}>{formatMoney(Math.round(c.amount * 100), c.currency)} {c.fund} · {c.frequency} <StopCommitmentButton id={c.id} /></p>
        ))}
        <OfferingCommitmentForm funds={s.funds} currencies={s.currencies} />

        <h2 style={{ fontSize: 26, marginTop: 40 }}>Change password</h2>
        <ActionForm action={changePassword} submitLabel="Change my password">
          <div className="field"><label htmlFor="current">Current password</label><input id="current" name="current" type="password" required autoComplete="current-password" /></div>
          <div className="field"><label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
        </ActionForm>

        <h2 style={{ fontSize: 26, marginTop: 40 }}>Delete my account</h2>
        <p>Deleting removes your account, sessions, reminder switches, recorded Offering and your testimonies. Event registrations are kept for the event teams, without your account link.</p>
        <ActionForm action={deleteAccount} submitLabel="Delete my account">
          <div className="field"><label htmlFor="password">Your password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
        </ActionForm>
      </div>
    </section>
  );
}
