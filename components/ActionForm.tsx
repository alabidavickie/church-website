// Generic form wrapper: honeypot field + Turnstile widget + result message.
// Every form in the app uses this, so no form can skip the human check.
"use client";

import { useActionState, type ReactNode } from "react";
import { TurnstileField } from "./Turnstile";
import type { ActionResult } from "@/lib/actions";

export function ActionForm({
  action, children, submitLabel, previewNote,
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
  previewNote?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction}>
      {children}
      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <TurnstileField />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Please wait…" : submitLabel}</button>
      {state && (
        <p role="status" className={`notice${state.ok ? "" : " error"}`} style={{ marginTop: 16 }}>
          {state.message}
          {state.preview && (<><br /><a href={state.preview}>{state.preview}</a></>)}
        </p>
      )}
      {previewNote && <p style={{ color: "#46526a" }}>{previewNote}</p>}
    </form>
  );
}
