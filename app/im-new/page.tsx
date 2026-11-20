import { loadDb } from "@/lib/store";
import { ActionForm } from "@/components/ActionForm";
import { submitVisitPlan } from "@/lib/actions";

export const metadata = { title: "I'm New" };

export default async function ImNewPage() {
  const db = loadDb();
  const s = db.settings;
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>I&apos;m New</h1>
        <p style={{ fontSize: 20 }}>You are welcome here. A Sunday service lasts about two hours, with worship, prayer and a message from the Bible. Come as you are — there is no dress code.</p>
        <h2 style={{ fontSize: 26 }}>Parking and access</h2>
        <p>Parking is at the church, {s.address}. [Step-free access, children&apos;s program and which door to use — the church has not supplied these details yet.]</p>
        <h2 style={{ fontSize: 26 }}>Plan your visit</h2>
        <p>Tell us you are coming and we will meet you at the door, show you around and save you a seat.</p>
        <ActionForm action={submitVisitPlan} submitLabel="Plan my visit">
          <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
          <div className="field"><label htmlFor="visitDate">Which Sunday</label><input id="visitDate" name="visitDate" type="date" required /></div>
          <div className="field"><label htmlFor="adults">Adults</label><input id="adults" name="adults" type="number" min={1} defaultValue={1} /></div>
          <div className="field"><label htmlFor="children">Children</label><input id="children" name="children" type="number" min={0} defaultValue={0} /></div>
          <div className="field"><label htmlFor="notes">Anything we should know?</label><textarea id="notes" name="notes" rows={3} /></div>
          <div className="field"><label><input type="checkbox" name="meetAtDoor" /> Please meet me at the door</label></div>
        </ActionForm>
      </div>
    </section>
  );
}
