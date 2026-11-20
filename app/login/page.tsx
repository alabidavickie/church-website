"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { TurnstileField } from "@/components/Turnstile";
import { login, verifyLoginCode } from "@/lib/actions-account";
import type { ActionResult } from "@/lib/actions";

export default function LoginPage() {
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const needsTotp = (loginState as (ActionResult & { needsTotp?: boolean; needsSetup?: boolean }) | null)?.needsTotp;
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Log in</h1>
        {needsTotp ? (
          <>
            <p>{loginState?.message}</p>
            {(loginState as { needsSetup?: boolean })?.needsSetup && <p><Link href="/admin/two-factor" className="tl">Set up two-step sign-in</Link> (or open it from My account after signing in).</p>}
            <form action={async (fd: FormData) => { await verifyLoginCode(null, fd); }}>
              <div className="field"><label htmlFor="code">6-digit code from your authenticator app (or a backup code)</label><input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required /></div>
              <button type="submit" className="btn">Verify and log in</button>
            </form>
          </>
        ) : (
          <form action={loginAction}>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
              <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <TurnstileField />
            <button type="submit" className="btn" disabled={loginPending}>{loginPending ? "Please wait…" : "Log in"}</button>
            {loginState && !loginState.ok && <p role="status" className="notice error" style={{ marginTop: 16 }}>{loginState.message}</p>}
          </form>
        )}
        <p><Link href="/forgot-password" className="tl">Forgot your password?</Link> · <Link href="/signup" className="tl">Create an account</Link></p>
      </div>
    </section>
  );
}
