// Stripe Checkout + webhooks. Test mode only until the church switches to
// live keys in Vercel. Without STRIPE_SECRET_KEY the Offering form answers
// stripeMode "preview" with no checkout URL — it never pretends to take a
// payment. The webhook is the record of truth and each event is recorded
// once, keyed by stripe_event_id (see supabase/migrations/0001_init.sql).
import Stripe from "stripe";

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function stripeMode(): "live" | "preview" {
  return stripeConfigured() ? "live" : "preview";
}

function stripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2026-11-18.endive" });
}

export type CheckoutInput = {
  amountMinor: number;
  currency: string;
  fund: string;
  frequency: "one_time" | "weekly" | "monthly";
  donorName: string;
  donorEmail: string;
  successUrl: string;
  cancelUrl: string;
};

export async function createCheckoutSession(input: CheckoutInput): Promise<{ mode: "preview" | "live"; url: string | null }> {
  if (!stripeConfigured()) return { mode: "preview", url: null };
  const stripe = stripeClient();
  const isRecurring = input.frequency !== "one_time";
  const session = await stripe.checkout.sessions.create({
    mode: isRecurring ? "subscription" : "payment",
    customer_email: input.donorEmail,
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: { name: `Offering — ${input.fund}` },
          unit_amount: input.amountMinor,
          ...(isRecurring
            ? { recurring: { interval: input.frequency === "weekly" ? "week" : "month" } }
            : {}),
        },
        quantity: 1,
      },
    ],
    metadata: { fund: input.fund, frequency: input.frequency, donor_name: input.donorName },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
  return { mode: "live", url: session.url };
}

/** Verify a Stripe webhook signature. Refuses unsigned events in preview mode. */
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<{ ok: boolean; event: Stripe.Event | null }> {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) return { ok: false, event: null };
  try {
    const stripe = stripeClient();
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    return { ok: true, event };
  } catch {
    return { ok: false, event: null };
  }
}

/** Smallest gift Stripe accepts is the equivalent of $0.50 after conversion. */
export function amountToMinor(amount: number, currency: string): number {
  const zeroDecimal = ["JPY", "KRW", "VND", "CLP"];
  const minor = zeroDecimal.includes(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100);
  return minor;
}

export function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0.5 && amount <= 1_000_000;
}
