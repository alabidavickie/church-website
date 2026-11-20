// My account: profile, two-step, reminders, testimonies, registrations,
// giving history and year-end statement, delete account.
"use client";

import { useState } from "react";
import { setReminderPref, saveOfferingCommitment, stopOfferingCommitment } from "@/lib/actions-account";
import { beginTotpSetup, confirmTotpSetup, disableTotp } from "@/lib/actions-account";

export function ReminderSwitches({ topics }: { topics: string[] }) {
  const all = ["bible_study", "prayer", "events", "todays_message", "news"];
  const [on, setOn] = useState<string[]>(topics);
  return (
    <div>
      {all.map((t) => (
        <label key={t} style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={on.includes(t)}
            onChange={async (e) => {
              setOn(e.target.checked ? [...on, t] : on.filter((x) => x !== t));
              await setReminderPref(t, e.target.checked);
            }}
          /> {t.replace("_", " ")}
        </label>
      ))}
    </div>
  );
}

export function TotpSetup() {
  const [secret, setSecret] = useState<{ secret: string; url: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div>
      <button type="button" className="btn sm" onClick={async () => {
        const r = await beginTotpSetup();
        if ("error" in r) setMessage(r.error); else setSecret(r);
      }}>Set up two-step sign-in</button>
      {secret && (
        <div style={{ marginTop: 16 }}>
          <p>Scan this in your authenticator app, or enter the secret by hand: <code>{secret.secret}</code></p>
          <p style={{ wordBreak: "break-all" }}><code>{secret.url}</code></p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set("code", code);
            const r = await confirmTotpSetup(null, fd);
            setMessage(r.message);
            if (r.backupCodes) setBackupCodes(r.backupCodes);
          }}>
            <div className="field"><label htmlFor="totp-code">6-digit code</label><input id="totp-code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" required /></div>
            <button type="submit" className="btn sm">Turn two-step on</button>
          </form>
        </div>
      )}
      {backupCodes && (
        <div className="notice" role="status">
          <p><strong>Save these 8 backup codes somewhere safe — each works once:</strong></p>
          <ul>{backupCodes.map((c) => <li key={c}><code>{c}</code></li>)}</ul>
        </div>
      )}
      {message && <p role="status" className="notice">{message}</p>}
    </div>
  );
}

export function DisableTotpForm() {
  return (
    <form action={async (fd: FormData) => { await disableTotp(null, fd); }}>
      <div className="field"><label htmlFor="password">Your password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
      <button type="submit" className="btn sm ghost">Turn two-step off</button>
    </form>
  );
}

export function OfferingCommitmentForm({ funds, currencies }: { funds: string[]; currencies: string[] }) {
  return (
    <form action={async (fd: FormData) => { await saveOfferingCommitment(null, fd); }}>
      <div className="field"><label htmlFor="amount">Amount</label><input id="amount" name="amount" type="number" min={0.5} step="0.01" required /></div>
      <div className="field"><label htmlFor="currency">Currency</label>
        <select id="currency" name="currency" defaultValue="USD">{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="fund">Fund</label>
        <select id="fund" name="fund">{funds.map((f) => <option key={f} value={f}>{f}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="frequency">How often</label>
        <select id="frequency" name="frequency"><option value="monthly">Monthly</option><option value="weekly">Weekly</option></select>
      </div>
      <button type="submit" className="btn sm">Record my regular Offering</button>
    </form>
  );
}

export function StopCommitmentButton({ id }: { id: string }) {
  return <button type="button" className="btn sm ghost" onClick={() => stopOfferingCommitment(id)}>Stop this Offering</button>;
}
