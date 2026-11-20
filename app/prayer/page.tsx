import { headers } from "next/headers";
import { loadDb } from "@/lib/store";
import { visitorTimeZone, formatGatheringTime } from "@/lib/time";
import { ActionForm } from "@/components/ActionForm";
import { submitPrayer, subscribeReminder } from "@/lib/actions";

export const metadata = { title: "Prayer" };

export default async function PrayerPage() {
  const db = loadDb();
  const s = db.settings;
  const tz = visitorTimeZone(await headers());
  const gathering = db.sessionsGatherings.find((g) => g.type === "prayer");
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Prayer</h1>
        {gathering && (
          <>
            <h2 style={{ fontSize: 26 }}>Next prayer meeting: {gathering.topic}</h2>
            <p>{formatGatheringTime(gathering.startsAt, tz).local}</p>
            <p>{gathering.zoomUrl.startsWith("[") ? "Zoom link: [Zoom link — the church has not supplied it yet]" : `Join on Zoom: ${gathering.zoomUrl}`}</p>
            <h3 style={{ fontSize: 20 }}>Email me a reminder</h3>
            <ActionForm action={subscribeReminder} submitLabel="Email me a reminder" previewNote="You will get an email one hour before, with the Zoom link.">
              <input type="hidden" name="topics" value="prayer" />
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            </ActionForm>
          </>
        )}
        <p>Friday prayer is {s.fridayPrayerTime} (New York time).</p>
        <h2 style={{ fontSize: 26 }}>Send a prayer request</h2>
        <p>The prayer team prays over every request. Mark it private and only the pastor will see it.</p>
        <ActionForm action={submitPrayer} submitLabel="Send your prayer request">
          <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email (only needed if you want us to contact you)</label><input id="email" name="email" type="email" autoComplete="email" /></div>
          <div className="field"><label htmlFor="request">Your prayer request</label><textarea id="request" name="request" rows={5} required /></div>
          <div className="field"><label><input type="checkbox" name="isPrivate" /> Keep this private — pastor only</label></div>
          <div className="field"><label><input type="checkbox" name="wantsContact" /> Please contact me about this</label></div>
        </ActionForm>
      </div>
    </section>
  );
}
