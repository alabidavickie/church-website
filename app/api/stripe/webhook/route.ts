// Stripe webhook — the record of truth for Offerings. Signature-checked;
// each Stripe event is recorded once (stripe_event_id is unique).
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { withDb } from "@/lib/store";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  const { ok, event } = await verifyWebhookSignature(raw, signature);
  if (!ok || !event) {
    // In preview mode (no webhook secret) unsigned events are refused.
    return NextResponse.json({ ok: false, recorded: false, reason: "Invalid or missing Stripe signature." }, { status: 400 });
  }
  const recorded = withDb((db) => {
    if (db.offerings.some((o) => o.stripeEventId === event.id)) return false;
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; amount_total?: number; currency?: string; customer_email?: string; metadata?: Record<string, string>; subscription?: string };
      db.offerings.push({
        id: `off_${event.id.slice(-12)}`, userId: null, stripeEventId: event.id,
        stripeSessionId: session.id, stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
        amount: session.amount_total ?? 0, currency: (session.currency ?? "usd").toUpperCase(),
        settledUsdCents: null, fund: session.metadata?.fund ?? "Offering",
        frequency: (session.metadata?.frequency ?? "one_time") as "one_time" | "weekly" | "monthly",
        donorName: session.metadata?.donor_name ?? "", donorEmail: session.customer_email ?? "",
        status: "recorded", createdAt: new Date().toISOString(),
      });
      return true;
    }
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as { id: string; amount_paid?: number; currency?: string; customer_email?: string; subscription?: string };
      db.offerings.push({
        id: `off_${event.id.slice(-12)}`, userId: null, stripeEventId: event.id,
        stripeSessionId: null, stripeSubscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : null,
        amount: invoice.amount_paid ?? 0, currency: (invoice.currency ?? "usd").toUpperCase(),
        settledUsdCents: null, fund: "Offering", frequency: "monthly",
        donorName: "", donorEmail: invoice.customer_email ?? "",
        status: "recorded", createdAt: new Date().toISOString(),
      });
      return true;
    }
    return false;
  });
  return NextResponse.json({ ok: true, recorded, event: event.type });
}
