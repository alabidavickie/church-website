import Link from "next/link";

export const metadata = { title: "Thank you for your Offering" };

export default function OfferingThankYouPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Thank you</h1>
        <p>Thank you for your Offering. Stripe will email your receipt. If you signed in, your gift will appear in My account once the payment is confirmed — the Stripe webhook is the record of truth, so a gift is recorded exactly once.</p>
        <p><Link href="/" className="btn">Back home</Link> <Link href="/account" className="tl">My account</Link></p>
      </div>
    </section>
  );
}
