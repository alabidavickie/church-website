import { loadDb } from "@/lib/store";
import { OfferingForm } from "@/components/OfferingForm";
import { stripeMode } from "@/lib/stripe";

export const metadata = { title: "Offering" };

export default async function OfferingsPage() {
  const db = loadDb();
  const s = db.settings;
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Offering</h1>
        <p style={{ fontSize: 20 }}>Give any amount, in your own currency, one time, weekly or monthly. Recurring gifts can be changed or stopped any time through Stripe&apos;s Customer Portal.</p>
        {stripeMode() === "preview" && (
          <p className="notice">Preview mode — Stripe is not connected yet, so this form will not take a payment. The church&apos;s Stripe payment page link is [Stripe payment page link].</p>
        )}
        <OfferingForm funds={s.funds} currencies={s.currencies} />
        <p style={{ color: "#46526a" }}>Prefer the church&apos;s payment page? {s.stripePaymentUrl.startsWith("[") ? "[Stripe payment page link]" : <a href={s.stripePaymentUrl}>Open the Stripe payment page</a>}</p>
      </div>
    </section>
  );
}
