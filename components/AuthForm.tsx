// Auth form shell: honeypot + Turnstile + result message.
"use client";

import { useActionState, type ReactNode } from "react";
import { TurnstileField } from "./Turnstile";
import type { ActionResult } from "@/lib/actions";

export function AuthForm({
  action, children, submitLabel,
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction}>
      {children}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <TurnstileField />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Please wait…" : submitLabel}</button>
      {state && (
        <p role="status" className={`notice${state.ok ? "" : " error"}`} style={{ marginTop: 16 }}>
          {state.message}
          {state.preview && (<><br />Preview link (no email service connected yet): <a href={state.preview}>{state.preview}</a></>)}
        </p>
      )}
    </form>
  );
}
