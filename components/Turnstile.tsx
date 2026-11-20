// Cloudflare Turnstile widget (client). The widget alone never authorises
// anything — the server verifies the token in lib/turnstile.ts.
// In test mode the widget is Cloudflare's test widget; if its script cannot
// load (offline sandbox), the form shows "human check could not load" and
// stays disabled, exactly as the blueprint requires.
"use client";

import { useEffect, useRef, useState } from "react";
import { turnstileSiteKey } from "@/lib/turnstile-client";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id: string) => void } }
}

export function TurnstileField({ inputName = "cf-turnstile-response" }: { inputName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const scriptId = "turnstile-script";
    const render = () => {
      if (!ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: turnstileSiteKey(),
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
      setLoaded(true);
    };
    if (window.turnstile) { render(); return; }
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      const t = setInterval(() => { if (window.turnstile) { clearInterval(t); render(); } }, 200);
      return () => clearInterval(t);
    }
  }, []);

  return (
    <div className="field">
      <input type="hidden" name={inputName} value={token} readOnly />
      <div ref={ref} />
      {!loaded && <p role="status">Human check could not load — check your connection and try again.</p>}
    </div>
  );
}
