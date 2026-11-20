// Admin section screens (Phase 6 + 8 + 10 + 11). Each screen is a server
// component; every mutation goes through a server action that re-checks the
// caller's role. Private prayer requests are filtered here by role too.
import Link from "next/link";
import { loadDb, publicName, type User } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { ActionForm } from "@/components/ActionForm";
import {
  adminSaveAnnouncement, adminSaveEvent, adminSaveGathering, adminSaveMessage,
  adminSaveSermon, adminSaveSettings, adminSetLive, adminSendNews,
  adminCreateSocialPost, adminSaveLaunchCheck,
} from "@/lib/actions-admin";
import { adminRunReminders } from "@/lib/actions-admin";
import { TotpSetup, DisableTotpForm } from "@/components/AccountClient";
import { stripeMode } from "@/lib/stripe";
import { reminderMode } from "@/lib/reminders";

export function VisitorsSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>New visitors</h1>
      {db.visitPlans.length === 0 && <p>No planned visits yet.</p>}
      {db.visitPlans.map((v) => (
        <div key={v.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{v.name}</strong> ({v.email}) — {v.visitDate} · {v.adults} adult(s), {v.children} child(ren) · {v.status}</p>
          <p style={{ margin: "0 0 6px" }}>{v.notes}{v.meetAtDoor ? " · Meet at the door." : ""}</p>
          <form action={async (fd: FormData) => { "use server"; const { adminUpdateVisitor } = await import("@/lib/actions-admin"); await adminUpdateVisitor(v.id, fd.get("status") as "welcomed" | "followed_up"); }}>
            <select name="status" defaultValue={v.status}>
              <option value="expected">Expected</option><option value="welcomed">Welcomed</option><option value="followed_up">Followed up</option>
            </select>
            <button type="submit" className="btn sm" style={{ marginLeft: 8 }}>Save</button>
          </form>
        </div>
      ))}
    </div>
  );
}

export function PrayerSection({ user }: { user: User }) {
  const db = loadDb();
  const isPastor = user.role === "pastor";
  const prayers = db.prayers.filter((p) => isPastor || !p.isPrivate);
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Prayer requests</h1>
      {!isPastor && <p className="notice">Private prayer requests are visible to pastors only.</p>}
      {prayers.length === 0 && <p>No prayer requests yet.</p>}
      {prayers.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{p.name}</strong> {p.isPrivate ? "· Private (pastor only)" : ""} · {p.status}</p>
          <p style={{ margin: "0 0 6px" }}>{p.request}</p>
          {p.wantsContact && <p style={{ margin: "0 0 6px" }}>Wants contact: {p.email}</p>}
          {p.note && <p style={{ margin: "0 0 6px" }}>Team note: {p.note}</p>}
          <form action={async (fd: FormData) => { "use server"; const { adminUpdatePrayer } = await import("@/lib/actions-admin"); await adminUpdatePrayer(p.id, fd.get("status") as "prayed" | "followed_up", fd.get("note") as string); }}>
            <select name="status" defaultValue={p.status}>
              <option value="new">New</option><option value="prayed">Prayed</option><option value="followed_up">Followed up</option>
            </select>
            <input name="note" placeholder="Team-only note" defaultValue={p.note} style={{ marginLeft: 8, padding: 8 }} />
            <button type="submit" className="btn sm" style={{ marginLeft: 8 }}>Save</button>
          </form>
        </div>
      ))}
    </div>
  );
}

export function ReviewSection() {
  const db = loadDb();
  const pending = db.testimonies.filter((t) => t.status === "pending");
  const decided = db.testimonies.filter((t) => t.status !== "pending");
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Testimonies for review</h1>
      <p>{pending.length} waiting · {db.testimonies.filter((t) => t.status === "approved").length} approved · {db.testimonies.filter((t) => t.status === "declined").length} declined</p>
      {pending.map((t) => (
        <div key={t.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{t.title}</strong> · {t.category} · by {publicName(t)} ({t.email})</p>
          <p>{t.body}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <form action={async () => { "use server"; const { adminReviewTestimony } = await import("@/lib/actions-admin"); await adminReviewTestimony(t.id, "approved", ""); }}>
              <button type="submit" className="btn sm">Approve &amp; publish</button>
            </form>
            <form action={async () => { "use server"; const { adminReviewTestimony } = await import("@/lib/actions-admin"); await adminReviewTestimony(t.id, "declined", ""); }}>
              <button type="submit" className="btn sm ghost">Decline</button>
            </form>
            <form action={async (fd: FormData) => { "use server"; const { adminReviewTestimony } = await import("@/lib/actions-admin"); await adminReviewTestimony(t.id, "changes_requested", String(fd.get("note") ?? "")); }}>
              <input name="note" placeholder="What should change?" style={{ padding: 8 }} />
              <button type="submit" className="btn sm ghost" style={{ marginLeft: 8 }}>Ask for changes</button>
            </form>
          </div>
        </div>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Decided</h2>
      {decided.map((t) => <p key={t.id}>{t.title} — {t.status}</p>)}
    </div>
  );
}

export function ChatSection() {
  const db = loadDb();
  const flagged = db.studyPosts.filter((p) => p.status === "flagged");
  const others = db.studyPosts.filter((p) => p.status !== "flagged");
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Bible study chat</h1>
      <h2 style={{ fontSize: 24 }}>Flagged ({flagged.length})</h2>
      {flagged.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{p.displayName}</strong></p>
          <p style={{ margin: "0 0 6px" }}>{p.body}</p>
          <form action={async () => { "use server"; const { adminUpdatePost } = await import("@/lib/actions-admin"); await adminUpdatePost(p.id, "published"); }}>
            <button type="submit" className="btn sm">Publish</button>
          </form>
        </div>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>All posts</h2>
      {others.map((p) => (
        <p key={p.id}>{p.displayName}: {p.body} — {p.status}
          <form style={{ display: "inline" }} action={async () => { "use server"; const { adminUpdatePost } = await import("@/lib/actions-admin"); await adminUpdatePost(p.id, "hidden"); }}>
            <button type="submit" className="btn sm ghost" style={{ marginLeft: 8 }}>Hide</button>
          </form>
        </p>
      ))}
    </div>
  );
}

export function RegistrationsSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Event registrations</h1>
      {db.registrations.length === 0 && <p>No registrations yet.</p>}
      {db.registrations.map((r) => (
        <p key={r.id}>{db.events.find((e) => e.id === r.eventId)?.title ?? "Event"} — {r.name} ({r.email}) · {r.adults} adult(s), {r.children} child(ren) · {r.status}</p>
      ))}
    </div>
  );
}

export function GatheringsSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Gatherings &amp; Zoom</h1>
      {db.sessionsGatherings.map((g) => (
        <p key={g.id}>{g.type === "bible_study" ? "Bible study" : "Prayer"} — {g.topic} · {new Date(g.startsAt).toLocaleString()} · Zoom: {g.zoomUrl}</p>
      ))}
      <h2 style={{ fontSize: 24 }}>Add or update a gathering</h2>
      <ActionForm action={adminSaveGathering} submitLabel="Save gathering">
        <div className="field"><label htmlFor="type">Type</label>
          <select id="type" name="type"><option value="bible_study">Bible study</option><option value="prayer">Prayer</option></select>
        </div>
        <div className="field"><label htmlFor="topic">Topic</label><input id="topic" name="topic" required /></div>
        <div className="field"><label htmlFor="startsAt">Starts at</label><input id="startsAt" name="startsAt" type="datetime-local" required /></div>
        <div className="field"><label htmlFor="zoomUrl">Zoom link</label><input id="zoomUrl" name="zoomUrl" /></div>
        <div className="field"><label htmlFor="videoUrl">Recording link (optional)</label><input id="videoUrl" name="videoUrl" /></div>
      </ActionForm>
    </div>
  );
}

export function LiveSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Live stream</h1>
      <p>Live now: <strong>{db.liveStatus.isLive ? "yes" : "no"}</strong> {db.liveStatus.youtubeVideoId ? `· Video: ${db.liveStatus.youtubeVideoId}` : ""}</p>
      <p>Automatic detection runs every 5 minutes during the Sunday service window (10:00 am–1:00 pm New York time) via the YouTube Data API, when YOUTUBE_API_KEY is set. Use the switch below as a manual backup.</p>
      <ActionForm action={adminSetLive} submitLabel="Save live status">
        <div className="field"><label><input type="checkbox" name="isLive" defaultChecked={db.liveStatus.isLive} /> We are live now</label></div>
        <div className="field"><label htmlFor="youtubeVideoId">YouTube video ID</label><input id="youtubeVideoId" name="youtubeVideoId" defaultValue={db.liveStatus.youtubeVideoId} /></div>
      </ActionForm>
    </div>
  );
}

export function AnnouncementSection() {
  const db = loadDb();
  const current = db.announcements[0];
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Announcement bar</h1>
      <p>Only one announcement is live at a time; it disappears on its own at the end time.</p>
      <ActionForm action={adminSaveAnnouncement} submitLabel="Save announcement">
        <div className="field"><label htmlFor="message">Message</label><input id="message" name="message" defaultValue={current?.message ?? ""} required /></div>
        <div className="field"><label htmlFor="link">Link (optional)</label><input id="link" name="link" defaultValue={current?.link ?? ""} /></div>
        <div className="field"><label htmlFor="style">Style</label>
          <select id="style" name="style" defaultValue={current?.style ?? "info"}><option value="info">Information</option><option value="urgent">Urgent</option></select>
        </div>
        <div className="field"><label htmlFor="startsAt">Starts</label><input id="startsAt" name="startsAt" type="datetime-local" /></div>
        <div className="field"><label htmlFor="endsAt">Ends</label><input id="endsAt" name="endsAt" type="datetime-local" /></div>
        <div className="field"><label><input type="checkbox" name="active" defaultChecked={current?.active ?? true} /> Active</label></div>
      </ActionForm>
    </div>
  );
}

export function RemindersSection() {
  const db = loadDb();
  const topics = ["bible_study", "prayer", "events", "todays_message", "news"];
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Reminders</h1>
      <p>Delivery: <strong>{reminderMode() === "preview" ? "Preview — Resend is not connected yet, so reminders are prepared and logged, not emailed." : "Live via Resend."}</strong></p>
      <h2 style={{ fontSize: 24 }}>Subscribers</h2>
      {topics.map((t) => (
        <p key={t}>{t.replace("_", " ")}: {db.reminderSubscriptions.filter((s) => s.confirmed && s.topics.includes(t)).length} confirmed</p>
      ))}
      <p>Total confirmed subscribers: {db.reminderSubscriptions.filter((s) => s.confirmed).length}</p>
      <form action={async () => { "use server"; await adminRunReminders(); }}>
        <button type="submit" className="btn sm">Run due reminders now (test)</button>
      </form>
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Church news</h2>
      <ActionForm action={adminSendNews} submitLabel="Send church news">
        <div className="field"><label htmlFor="subject">Subject</label><input id="subject" name="subject" required /></div>
        <div className="field"><label htmlFor="body">News</label><textarea id="body" name="body" rows={6} required /></div>
      </ActionForm>
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Recently sent</h2>
      {db.reminderLog.slice(-10).reverse().map((l) => (
        <p key={l.id}>{l.subject} — {l.email} · {l.status} · {new Date(l.sentAt).toLocaleString()}</p>
      ))}
      {db.reminderLog.length === 0 && <p>Nothing sent yet.</p>}
    </div>
  );
}

export function EventsSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Events &amp; banners</h1>
      {db.events.map((e) => (
        <p key={e.id}>{e.title} — {new Date(e.startsAt).toLocaleDateString()} · {e.registrationOpen ? "registration open" : "closed"}{e.showInBanner ? " · on homepage banner" : ""}</p>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Add an event</h2>
      <ActionForm action={adminSaveEvent} submitLabel="Save event">
        <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" required /></div>
        <div className="field"><label htmlFor="startsAt">Starts</label><input id="startsAt" name="startsAt" type="datetime-local" required /></div>
        <div className="field"><label htmlFor="endsAt">Ends</label><input id="endsAt" name="endsAt" type="datetime-local" required /></div>
        <div className="field"><label htmlFor="location">Location</label><input id="location" name="location" /></div>
        <div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" rows={3} /></div>
        <div className="field"><label htmlFor="capacity">Capacity (0 = no limit)</label><input id="capacity" name="capacity" type="number" min={0} defaultValue={0} /></div>
        <div className="field"><label><input type="checkbox" name="registrationOpen" defaultChecked /> Registration open</label></div>
        <div className="field"><label><input type="checkbox" name="showInBanner" /> Show on the homepage banner</label></div>
      </ActionForm>
    </div>
  );
}

export function SermonsSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Sermons &amp; studies</h1>
      {db.sermons.map((s) => (
        <p key={s.id}>{s.title} — {s.type} · {s.scripture} · {s.published ? "published" : "draft"}</p>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Add a sermon or study</h2>
      <ActionForm action={adminSaveSermon} submitLabel="Save sermon">
        <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" required /></div>
        <div className="field"><label htmlFor="type">Type</label>
          <select id="type" name="type"><option value="sermon">Sermon</option><option value="bible_study">Bible study</option></select>
        </div>
        <div className="field"><label htmlFor="speaker">Speaker</label><input id="speaker" name="speaker" /></div>
        <div className="field"><label htmlFor="series">Series</label><input id="series" name="series" /></div>
        <div className="field"><label htmlFor="scripture">Scripture</label><input id="scripture" name="scripture" /></div>
        <div className="field"><label htmlFor="book">Book of the Bible</label><input id="book" name="book" /></div>
        <div className="field"><label htmlFor="preachedOn">Date preached</label><input id="preachedOn" name="preachedOn" type="date" /></div>
        <div className="field"><label htmlFor="youtubeVideoId">YouTube video ID</label><input id="youtubeVideoId" name="youtubeVideoId" /></div>
        <div className="field"><label htmlFor="summary">Summary</label><textarea id="summary" name="summary" rows={3} /></div>
        <div className="field"><label htmlFor="questions">Questions (one per line)</label><textarea id="questions" name="questions" rows={3} /></div>
        <div className="field"><label><input type="checkbox" name="published" /> Published</label></div>
      </ActionForm>
    </div>
  );
}

export function MessageSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Today&apos;s Message</h1>
      <h2 style={{ fontSize: 24 }}>Write and publish</h2>
      <ActionForm action={adminSaveMessage} submitLabel="Publish this message">
        <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" required /></div>
        <div className="field"><label htmlFor="scripture">Scripture</label><input id="scripture" name="scripture" /></div>
        <div className="field"><label htmlFor="summary">Summary (2–3 sentences)</label><textarea id="summary" name="summary" rows={3} /></div>
        <div className="field"><label htmlFor="body">Full text (one paragraph per line)</label><textarea id="body" name="body" rows={8} /></div>
        <div className="field"><label htmlFor="verse">Highlighted verse</label><input id="verse" name="verse" /></div>
        <div className="field"><label htmlFor="steps">This week (one step per line)</label><textarea id="steps" name="steps" rows={3} /></div>
      </ActionForm>
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Published messages</h2>
      {db.todaysMessages.map((m) => <p key={m.id}>{m.title} — {m.scripture}</p>)}
    </div>
  );
}

export function SocialSection() {
  const db = loadDb();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Post to social</h1>
      <p>One caption becomes the Facebook post text, the Instagram caption and the YouTube description. YouTube needs a video; Instagram needs a photo or video (no text-only posts).</p>
      <h2 style={{ fontSize: 24 }}>Connected accounts</h2>
      {db.socialAccounts.map((a) => (
        <p key={a.platform}>{a.platform}: {a.connected ? `connected as ${a.accountName}` : "Not connected — connect once in the church's own Meta / Google account. Until then, posts are saved as previews."}</p>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>New post</h2>
      <ActionForm action={adminCreateSocialPost} submitLabel="Publish to the ticked platforms">
        <div className="field"><label htmlFor="caption">Caption (max 2,200 characters)</label><textarea id="caption" name="caption" rows={5} maxLength={2200} required /></div>
        <div className="field"><label htmlFor="mediaType">Media</label>
          <select id="mediaType" name="mediaType"><option value="none">No media</option><option value="photo">Photo</option><option value="video">Video</option></select>
        </div>
        <div className="field"><label htmlFor="mediaName">Media file name</label><input id="mediaName" name="mediaName" placeholder="e.g. sunday-flyer.jpg" /></div>
        <div className="field"><span>Post to</span>
          <label style={{ display: "block" }}><input type="checkbox" name="platforms" value="facebook" defaultChecked /> Facebook</label>
          <label style={{ display: "block" }}><input type="checkbox" name="platforms" value="instagram" /> Instagram</label>
          <label style={{ display: "block" }}><input type="checkbox" name="platforms" value="youtube" /> YouTube</label>
        </div>
        <div className="field"><label htmlFor="youtubeTitle">YouTube title</label><input id="youtubeTitle" name="youtubeTitle" /></div>
        <div className="field"><label htmlFor="youtubeVisibility">YouTube visibility</label>
          <select id="youtubeVisibility" name="youtubeVisibility"><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select>
        </div>
        <div className="field"><label htmlFor="instagramType">Instagram post type</label>
          <select id="instagramType" name="instagramType"><option value="post">Post</option><option value="reel">Reel</option><option value="story">Story</option></select>
        </div>
        <div className="field"><label htmlFor="scheduledAt">Schedule for (leave empty to post now)</label><input id="scheduledAt" name="scheduledAt" type="datetime-local" /></div>
      </ActionForm>
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Posts</h2>
      {db.socialPosts.length === 0 && <p>No posts yet.</p>}
      {db.socialPosts.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{p.caption.slice(0, 80)}</strong> — {p.status}{p.scheduledAt ? ` · scheduled ${new Date(p.scheduledAt).toLocaleString()}` : ""}</p>
          {p.results.map((r) => (
            <p key={r.platform} style={{ margin: "0 0 6px" }}>{r.platform}: {r.status}
              {r.link ? <> · <a href={r.link}>View post</a></> : null}
              {r.error ? <> · {r.error}</> : null}
              {r.status === "failed" && (
                <form style={{ display: "inline" }} action={async () => { "use server"; const { adminRetrySocial } = await import("@/lib/actions-admin"); await adminRetrySocial(p.id, r.platform); }}>
                  <button type="submit" className="btn sm" style={{ marginLeft: 8 }}>Retry this platform</button>
                </form>
              )}
            </p>
          ))}
          {p.status === "scheduled" && (
            <form action={async () => { "use server"; const { adminCancelSocial } = await import("@/lib/actions-admin"); await adminCancelSocial(p.id); }}>
              <button type="submit" className="btn sm ghost">Cancel scheduled post</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}

export function OfferingsSection() {
  const db = loadDb();
  const byFund: Record<string, number> = {};
  const byCurrency: Record<string, number> = {};
  for (const o of db.offerings) {
    byFund[o.fund] = (byFund[o.fund] ?? 0) + o.amount;
    byCurrency[o.currency] = (byCurrency[o.currency] ?? 0) + o.amount;
  }
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Offerings</h1>
      <p>Stripe mode: <strong>{stripeMode()}</strong> {stripeMode() === "preview" ? "— no live Stripe keys yet, so no real gifts are recorded." : ""} Stripe remains the official ledger; the webhook is the record of truth.</p>
      <h2 style={{ fontSize: 24 }}>Totals by fund</h2>
      {Object.keys(byFund).length === 0 && <p>No gifts recorded yet.</p>}
      {Object.entries(byFund).map(([fund, total]) => <p key={fund}>{fund}: {formatMoney(total, "USD")}</p>)}
      <h2 style={{ fontSize: 24 }}>Totals by currency</h2>
      {Object.entries(byCurrency).map(([cur, total]) => <p key={cur}>{cur}: {formatMoney(total, cur)}</p>)}
      <p><a href="/api/admin/offerings.csv" className="btn sm">Download CSV for the treasurer</a></p>
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Gifts</h2>
      {db.offerings.map((o) => (
        <p key={o.id}>{formatMoney(o.amount, o.currency)} · {o.fund} · {o.frequency.replace("_", " ")} · {o.donorName} ({o.donorEmail}) · {o.status}</p>
      ))}
    </div>
  );
}

export function UsersSection({ user }: { user: User }) {
  const db = loadDb();
  void user;
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Users &amp; roles</h1>
      <p>Keep at least two people with the Admin or Pastor role so the church is never locked out. Pastors, admins, editors and the treasurer must use two-step sign-in.</p>
      {db.users.map((u) => (
        <div key={u.id} className="card" style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px" }}><strong>{u.name}</strong> ({u.email}) — {u.role} · two-step {u.totpEnabled ? "on" : "off"} · {u.emailConfirmed ? "email confirmed" : "email not confirmed"}</p>
          <form action={async (fd: FormData) => { "use server"; const { adminSetRole } = await import("@/lib/actions-admin"); await adminSetRole(u.id, fd.get("role") as never); }}>
            <select name="role" defaultValue={u.role}>
              {["member", "prayer_team", "welcome_team", "editor", "treasurer", "admin", "pastor"].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" className="btn sm" style={{ marginLeft: 8 }}>Change role</button>
          </form>
        </div>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Invite someone to the team</h2>
      <ActionForm action={async (prev, fd) => { const { adminInvite } = await import("@/lib/actions-admin"); return adminInvite(prev, fd); }} submitLabel="Send the invite">
        <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
        <div className="field"><label htmlFor="role">Role</label>
          <select id="role" name="role">
            <option value="editor">Editor</option><option value="admin">Admin</option><option value="pastor">Pastor</option><option value="treasurer">Treasurer</option><option value="prayer_team">Prayer team</option><option value="welcome_team">Welcome team</option><option value="member">Member</option>
          </select>
        </div>
      </ActionForm>
    </div>
  );
}

export function SettingsSection() {
  const db = loadDb();
  const s = db.settings;
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Settings</h1>
      <p>Secret keys are never stored here — they live only in environment variables (Vercel).</p>
      <ActionForm action={adminSaveSettings} submitLabel="Save settings">
        <div className="field"><label htmlFor="churchName">Church name</label><input id="churchName" name="churchName" defaultValue={s.churchName} /></div>
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={s.phone} /></div>
        <div className="field"><label htmlFor="email">Main email</label><input id="email" name="email" type="email" defaultValue={s.email} /></div>
        <div className="field"><label htmlFor="officeHours">Office hours</label><input id="officeHours" name="officeHours" defaultValue={s.officeHours} /></div>
        <div className="field"><label htmlFor="address">Address</label><input id="address" name="address" defaultValue={s.address} /></div>
        <div className="field"><label htmlFor="sundayTime">Sunday service time (New York)</label><input id="sundayTime" name="sundayTime" defaultValue={s.sundayTime} /></div>
        <div className="field"><label htmlFor="fridayPrayerTime">Friday prayer time (New York)</label><input id="fridayPrayerTime" name="fridayPrayerTime" defaultValue={s.fridayPrayerTime} /></div>
        <div className="field"><label htmlFor="youtubeChannelUrl">YouTube channel link</label><input id="youtubeChannelUrl" name="youtubeChannelUrl" defaultValue={s.youtubeChannelUrl} /></div>
        <div className="field"><label htmlFor="youtubeChannelId">YouTube channel ID</label><input id="youtubeChannelId" name="youtubeChannelId" defaultValue={s.youtubeChannelId} /></div>
        <div className="field"><label htmlFor="facebookPageUrl">Facebook Page link</label><input id="facebookPageUrl" name="facebookPageUrl" defaultValue={s.facebookPageUrl} /></div>
        <div className="field"><label htmlFor="instagramUrl">Instagram link</label><input id="instagramUrl" name="instagramUrl" defaultValue={s.instagramUrl} /></div>
        <div className="field"><label htmlFor="zoomBibleStudy">Zoom link for Bible study</label><input id="zoomBibleStudy" name="zoomBibleStudy" defaultValue={s.zoomBibleStudy} /></div>
        <div className="field"><label htmlFor="zoomPrayer">Zoom link for prayer</label><input id="zoomPrayer" name="zoomPrayer" defaultValue={s.zoomPrayer} /></div>
        <div className="field"><label htmlFor="stripePaymentUrl">Stripe payment page link</label><input id="stripePaymentUrl" name="stripePaymentUrl" defaultValue={s.stripePaymentUrl} /></div>
        <div className="field"><label htmlFor="tawktoId">Tawk.to ID</label><input id="tawktoId" name="tawktoId" defaultValue={s.tawktoId} /></div>
        <div className="field"><label htmlFor="funds">Funds (comma separated)</label><input id="funds" name="funds" defaultValue={s.funds.join(", ")} /></div>
        <div className="field"><label htmlFor="currencies">Currencies (comma separated)</label><input id="currencies" name="currencies" defaultValue={s.currencies.join(", ")} /></div>
        <div className="field"><label htmlFor="aboutStory">Our story</label><textarea id="aboutStory" name="aboutStory" rows={4} defaultValue={s.aboutStory} /></div>
        <div className="field"><label htmlFor="statementOfFaith">Statement of faith</label><textarea id="statementOfFaith" name="statementOfFaith" rows={4} defaultValue={s.statementOfFaith} /></div>
        <div className="field"><label htmlFor="legalName">Legal name (receipts)</label><input id="legalName" name="legalName" defaultValue={s.legalName} /></div>
        <div className="field"><label htmlFor="ein">EIN (receipts)</label><input id="ein" name="ein" defaultValue={s.ein} /></div>
      </ActionForm>
    </div>
  );
}

const LAUNCH_CHECKS: { key: string; label: string; needsClient: boolean }[] = [
  { key: "turnstile", label: "Every form and login rejects a missing or fake Turnstile token (server check)", needsClient: false },
  { key: "pending-testimony", label: "A pending testimony cannot be seen by a logged-out visitor", needsClient: false },
  { key: "private-prayer", label: "Private prayer requests are visible to pastors only", needsClient: false },
  { key: "phone-check", label: "Pages pass a phone check and keyboard-only navigation", needsClient: false },
  { key: "privacy", label: "Privacy policy published", needsClient: false },
  { key: "cookie-banner", label: "Cookie banner shows on first visit; Reject all loads no trackers", needsClient: false },
  { key: "reminders-once", label: "Reminders arrive once, and unsubscribe works", needsClient: false },
  { key: "announcement", label: "Announcement bar appears and disappears on its times", needsClient: false },
  { key: "stripe-test", label: "Stripe test gifts (one-time and monthly) appear in admin; webhook signature checked", needsClient: true },
  { key: "stripe-live", label: "Stripe switched to live keys; receipt branding says 'Offering'", needsClient: true },
  { key: "two-admins", label: "At least two people with the Admin or Pastor role, with two-step sign-in on", needsClient: true },
  { key: "resend", label: "Resend connected with a verified sender and domain records", needsClient: true },
  { key: "social-live", label: "One upload posts to YouTube, Facebook and Instagram as a test post; Retry and Reconnect work", needsClient: true },
  { key: "google-in-production", label: "Google OAuth consent screen is 'In production'", needsClient: true },
  { key: "live-player", label: "Live player appears on its own during a real or private test stream", needsClient: true },
  { key: "lagos-time", label: "Times show correctly from a phone set to Lagos time", needsClient: false },
  { key: "backups", label: "Database backups in place", needsClient: true },
  { key: "alerts", label: "Error and uptime alerts reach two people", needsClient: true },
  { key: "acceptance", label: "The church has signed off its acceptance testing", needsClient: true },
];

export function LaunchSection() {
  const db = loadDb();
  const done = new Set(db.launchChecks.filter((c) => c.done).map((c) => c.key));
  const autoChecks = [
    { label: "Church name set", ok: !db.settings.churchName.startsWith("[") },
    { label: "Phone and email set", ok: !db.settings.phone.startsWith("[") && !db.settings.email.startsWith("[") },
    { label: "Address set", ok: !db.settings.address.startsWith("[") },
    { label: "YouTube channel set", ok: !db.settings.youtubeChannelId.startsWith("[") },
    { label: "Zoom links set", ok: !db.settings.zoomBibleStudy.startsWith("[") && !db.settings.zoomPrayer.startsWith("[") },
    { label: "Stripe payment link set", ok: !db.settings.stripePaymentUrl.startsWith("[") },
    { label: "Tawk.to ID set", ok: !db.settings.tawktoId.startsWith("[") },
    { label: "Legal name and EIN set", ok: !db.settings.legalName.startsWith("[") && !db.settings.ein.startsWith("[") },
  ];
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Launch</h1>
      <h2 style={{ fontSize: 24 }}>Automatic checks</h2>
      {autoChecks.map((c) => <p key={c.label}>{c.ok ? "✓" : "○"} {c.label}</p>)}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Launch checklist</h2>
      {LAUNCH_CHECKS.map((c) => (
        <p key={c.key}>
          <form style={{ display: "inline" }} action={async () => { "use server"; const { adminSaveLaunchCheck } = await import("@/lib/actions-admin"); await adminSaveLaunchCheck(c.key, !done.has(c.key)); }}>
            <button type="submit" className="btn sm" style={{ marginRight: 8 }}>{done.has(c.key) ? "✓ Done" : "○ Mark done"}</button>
          </form>
          {c.label} {c.needsClient ? "(needs the client)" : ""}
        </p>
      ))}
      <h2 style={{ fontSize: 24, marginTop: 32 }}>Waiting on the client</h2>
      <ul>
        <li>Church name, logo, phone, email, office hours, pastor and leaders</li>
        <li>Confirm Sunday 10:30 am and Friday 7:00 pm (New York time)</li>
        <li>Zoom links for Bible study and prayer</li>
        <li>YouTube channel, Facebook Page and Instagram account — and who connects each one</li>
        <li>Stripe account and live keys (entered by the church in Vercel)</li>
        <li>Resend sender and domain records</li>
        <li>Domain name and DNS</li>
        <li>Acceptance testing sign-off</li>
      </ul>
    </div>
  );
}

export function TwoFactorSection({ user }: { user: User }) {
  return (
    <div>
      <h1 className="display" style={{ fontSize: 36 }}>Two-step sign-in</h1>
      <p>Two-step sign-in is required for pastor, admin, editor and treasurer roles.</p>
      <p>Status for {user.name}: <strong>{user.totpEnabled ? "on" : "off"}</strong></p>
      {user.totpEnabled ? <DisableTotpForm /> : <TotpSetup />}
    </div>
  );
}
