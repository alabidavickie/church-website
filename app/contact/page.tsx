import Link from "next/link";
import { headers } from "next/headers";
import { loadDb } from "@/lib/store";
import { visitorTimeZone, formatGatheringTime, nextSundayService } from "@/lib/time";
import { ActionForm } from "@/components/ActionForm";
import { submitContact } from "@/lib/actions";

export const metadata = { title: "Contact & Visit" };

export default async function ContactPage() {
  const db = loadDb();
  const s = db.settings;
  const tz = visitorTimeZone(await headers());
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Contact &amp; visit</h1>
        <p><strong>{s.address}</strong></p>
        <p>Phone: {s.phone} · Email: {s.email} · Office hours: {s.officeHours}</p>
        <p>Sunday service {s.sundayTime} · Friday prayer {s.fridayPrayerTime} (New York time)</p>
        <p>Next service: {formatGatheringTime(nextSundayService().toISOString(), tz).local}</p>
        <h2 style={{ fontSize: 26 }}>Send us a message</h2>
        <ActionForm action={submitContact} submitLabel="Send your message">
          <input type="hidden" name="source" value="contact" />
          <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={5} required /></div>
        </ActionForm>
        <p>Prefer to chat? Use the <strong>Contact us</strong> button at the bottom right — it opens live chat once you allow it in your cookie choices. Or email us at {s.email}.</p>
        <p><Link href="/im-new" className="tl">Plan your visit</Link></p>
      </div>
    </section>
  );
}
