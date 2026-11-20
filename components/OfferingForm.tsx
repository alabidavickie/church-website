// Offering form. Turnstile is verified on the server before any Stripe
// Checkout Session is created. In preview mode (no Stripe keys) no payment
// is taken and the form says so honestly.
"use client";

import { useActionState } from "react";
import { TurnstileField } from "@/components/Turnstile";
import { submitOffering } from "@/lib/actions";
import { useEffect } from "react";

export function OfferingForm({ funds, currencies }: { funds: string[]; currencies: string[] }) {
  const [state, formAction, pending] = useActionState(submitOffering, null);
  useEffect(() => {
    if (state?.ok && state.url) window.location.href = state.url;
  }, [state]);
  return (
    <form action={formAction}>
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field"><label htmlFor="amount">Amount (any amount — no presets)</label><input id="amount" name="amount" type="number" min={0.5} step="0.01" required placeholder="e.g. 50" /></div>
      <div className="field"><label htmlFor="currency">Currency</label>
        <select id="currency" name="currency" defaultValue="USD">{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="fund">Fund</label>
        <select id="fund" name="fund">{funds.map((f) => <option key={f} value={f}>{f}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="frequency">How often</label>
        <select id="frequency" name="frequency">
          <option value="one_time">One time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
        </select>
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <TurnstileField />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Please wait…" : "Continue to Stripe Checkout"}</button>
      {state && (
        <p role="status" className={`notice${state.ok ? "" : " error"}`} style={{ marginTop: 16 }}>
          {state.message}
          {state.mode === "preview" && <><br />Preview mode: Stripe is not connected yet, so no payment was taken.</>}
        </p>
      )}
      <p style={{ color: "#46526a" }}>Card details go straight to Stripe&apos;s checkout page. The church never sees them. The smallest gift is the equivalent of $0.50.</p>
    </form>
  );
}
