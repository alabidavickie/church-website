import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { loadDb } from "@/lib/store";
import { visitorTimeZone, formatGatheringTime } from "@/lib/time";
import { ActionForm } from "@/components/ActionForm";
import { submitEventRegistration } from "@/lib/actions";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = loadDb();
  const event = db.events.find((e) => e.slug === slug);
  if (!event) notFound();
  const tz = visitorTimeZone(await headers());
  const time = formatGatheringTime(event.startsAt, tz);
  const registered = db.registrations.filter((r) => r.eventId === event.id && r.status === "registered").length;
  const full = event.capacity > 0 && registered >= event.capacity;
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>{event.title}</h1>
        <p><strong>{time.local}</strong></p>
        {time.ny && <p style={{ color: "#46526a" }}>{time.ny}</p>}
        <p>{event.location}</p>
        <p>{event.description}</p>
        <p>{event.capacity > 0 ? `${registered} of ${event.capacity} places taken` : "Open to everyone"}</p>
        {full && <p className="notice">This event is full — you can join the waiting list below.</p>}
        {event.registrationOpen ? (
          <>
            <h2 style={{ fontSize: 26 }}>Register</h2>
            <ActionForm action={submitEventRegistration.bind(null, event.id)} submitLabel={full ? "Join the waiting list" : "Register"}>
              <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
              <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
              <div className="field"><label htmlFor="adults">Adults</label><input id="adults" name="adults" type="number" min={1} defaultValue={1} /></div>
              <div className="field"><label htmlFor="children">Children</label><input id="children" name="children" type="number" min={0} defaultValue={0} /></div>
              <div className="field"><label htmlFor="notes">Notes (optional)</label><textarea id="notes" name="notes" rows={3} /></div>
            </ActionForm>
          </>
        ) : (
          <p>Registration is closed for this event.</p>
        )}
      </div>
    </section>
  );
}
