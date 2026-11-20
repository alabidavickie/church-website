// Site chrome: announcement bar, header with the menu spelled out under the
// logo (no menu icon, on any screen), sticky compact bar, footer, cookie
// banner (Consent Mode v2 denied by default) and the Contact us button.
// No optional tracker loads until the visitor allows it.
"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { logConsent } from "@/lib/actions";

export const MENU: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/im-new", label: "I'm New" },
  { href: "/events", label: "Events" },
  { href: "/sermons", label: "Sermons" },
  { href: "/bible-study", label: "Bible Study" },
  { href: "/prayer", label: "Prayer" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/todays-message", label: "Today's Message" },
  { href: "/watch", label: "Watch" },
  { href: "/contact", label: "Contact" },
];

export function Header({ churchName, announcement }: { churchName: string; announcement: { message: string; link: string } | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      {announcement && !dismissed && (
        <div style={{ background: "#0b1830", color: "#f4f1ea" }}>
          <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 52 }}>
            <p style={{ margin: 0 }}>{announcement.link ? <Link href={announcement.link} style={{ color: "#f4f1ea" }}>{announcement.message}</Link> : announcement.message}</p>
            <button type="button" aria-label="Dismiss announcement" onClick={() => setDismissed(true)} style={{ background: "transparent", border: 0, color: "#f4f1ea", fontSize: 20, cursor: "pointer", minWidth: 44, minHeight: 44 }}>×</button>
          </div>
        </div>
      )}
      <header>
        <div className="wrap" style={{ paddingTop: 14, paddingBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minHeight: 60 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "League Spartan, Figtree, sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: "-0.04em", color: "#0b1830", textDecoration: "none" }}>
              <span aria-hidden style={{ width: 22, height: 28, borderRadius: "11px 11px 0 0", background: "#e6a82a", display: "block", flexShrink: 0 }} />
              {churchName}
            </Link>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link href="/search">Search</Link>
              <Link href="/offerings" className="btn sm">Offering</Link>
            </div>
          </div>
          <nav className="menu" aria-label="Main menu">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href}>{m.label}</Link>
            ))}
          </nav>
        </div>
      </header>
      {scrolled && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, background: "#faf8f3", borderBottom: "1px solid #efeadf" }}>
          <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 64 }}>
            <Link href="/" style={{ fontFamily: "League Spartan, Figtree, sans-serif", fontWeight: 700, textDecoration: "none", color: "#0b1830" }}>{churchName}</Link>
            <nav className="menu" aria-label="Compact menu" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
              {MENU.slice(0, 6).map((m) => (
                <Link key={m.href} href={m.href}>{m.label}</Link>
              ))}
            </nav>
            <Link href="/offerings" className="btn sm">Offering</Link>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ churchName, address, email, phone }: { churchName: string; address: string; email: string; phone: string }) {
  return (
    <footer style={{ background: "#0b1830", color: "#f4f1ea", padding: "56px 0" }}>
      <div className="wrap">
        <p className="display" style={{ fontSize: 28, margin: "0 0 12px" }}>{churchName}</p>
        <p style={{ margin: "0 0 6px" }}>{address}</p>
        <p style={{ margin: "0 0 24px" }}>{phone} · {email}</p>
        <nav className="menu" aria-label="Footer menu" style={{ marginBottom: 24 }}>
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} style={{ color: "#f4f1ea" }}>{m.label}</Link>
          ))}
        </nav>
        <p style={{ margin: 0 }}>
          <Link href="/privacy" style={{ color: "#f4f1ea" }}>Privacy and cookies</Link>
          {" · "}
          <button type="button" id="cookie-settings-link" style={{ background: "none", border: 0, color: "#f4f1ea", textDecoration: "underline", cursor: "pointer", font: "inherit", padding: 0 }}>Cookie settings</button>
        </p>
      </div>
    </footer>
  );
}

type Consent = { chat: boolean; media: boolean; analytics: boolean };
const CONSENT_KEY = "cw_consent_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return !localStorage.getItem(CONSENT_KEY); } catch { return true; }
  });
  const [choose, setChoose] = useState(false);
  const [chat, setChat] = useState(false);
  const [media, setMedia] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const open = () => { setVisible(true); setChoose(true); };
    document.getElementById("cookie-settings-link")?.addEventListener("click", open);
    return () => document.getElementById("cookie-settings-link")?.removeEventListener("click", open);
  }, []);

  const save = async (c: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...c, at: new Date().toISOString() }));
    } catch { /* consent still applies for this visit */ }
    const fd = new FormData();
    fd.set("anonId", Math.random().toString(36).slice(2));
    fd.set("chat", String(c.chat)); fd.set("media", String(c.media)); fd.set("analytics", String(c.analytics));
    await logConsent(fd);
    setVisible(false);
    if (c.chat) loadTawkto();
  };

  if (!visible) return null;
  return (
    <div role="dialog" aria-label="Cookie choices" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, background: "#fff", borderTop: "3px solid #e6a82a", padding: 20 }}>
      <div className="wrap">
        <h2 style={{ margin: "0 0 8px", fontSize: 24 }}>Your privacy choices</h2>
        <p style={{ margin: "0 0 16px" }}>We use cookies for the site to work, and — only if you allow them — for live chat, videos and visit counts. Nothing optional loads until you choose.</p>
        {choose ? (
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <label><input type="checkbox" checked disabled /> Needed for the site — always on (Turnstile, Stripe, remembering this choice)</label>
            <label><input type="checkbox" checked={chat} onChange={(e) => setChat(e.target.checked)} /> Live chat (Tawk.to)</label>
            <label><input type="checkbox" checked={media} onChange={(e) => setMedia(e.target.checked)} /> Videos, posts and maps (YouTube, Facebook, Instagram, Google Maps)</label>
            <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Visit counts (Google Analytics)</label>
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button type="button" className="btn" onClick={() => save({ chat: true, media: true, analytics: true })}>Accept all</button>
          <button type="button" className="btn ghost" onClick={() => save({ chat: false, media: false, analytics: false })}>Reject all</button>
          {choose
            ? <button type="button" className="btn ghost" onClick={() => save({ chat, media, analytics })}>Save my choices</button>
            : <button type="button" className="btn ghost" onClick={() => setChoose(true)}>Choose which cookies</button>}
        </div>
      </div>
    </div>
  );
}

function loadTawkto() {
  if (document.getElementById("tawkto-script")) return;
  const id = (window as unknown as { __tawktoId?: string }).__tawktoId;
  if (!id || id.startsWith("[")) return; // [Tawk.to ID] not supplied yet
  const s = document.createElement("script");
  s.id = "tawkto-script";
  s.src = `https://embed.tawk.to/${id}/default`;
  s.async = true;
  document.body.appendChild(s);
}

export function ContactUsButton() {
  const [allowed, setAllowed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw).chat === true : false;
    } catch { return false; }
  });
  return (
    <button
      type="button"
      onClick={() => {
        if (!allowed) { alert("Live chat needs your permission first — open Cookie settings in the footer and allow live chat."); return; }
        loadTawkto();
        const w = window as unknown as { Tawk_API?: { maximize?: () => void } };
        w.Tawk_API?.maximize?.();
      }}
      style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50, minHeight: 54, padding: "0 22px", borderRadius: "999px 999px 0 0", background: "#0b1830", color: "#faf8f3", border: 0, font: "inherit", fontWeight: 700, cursor: "pointer" }}
    >
      Contact us
    </button>
  );
}

export function TimezoneSetter() {
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && !document.cookie.includes("cw_tz=")) {
        document.cookie = `cw_tz=${encodeURIComponent(tz)}; path=/; max-age=${60 * 60 * 24 * 180}`;
      }
    } catch { /* keep server fallback */ }
  }, []);
  return null;
}

export function SiteChrome({ churchName, address, email, phone, announcement, children }: {
  churchName: string; address: string; email: string; phone: string;
  announcement: { message: string; link: string } | null; children: ReactNode;
}) {
  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <TimezoneSetter />
      <Header churchName={churchName} announcement={announcement} />
      <main id="main">{children}</main>
      <Footer churchName={churchName} address={address} email={email} phone={phone} />
      <CookieBanner />
      <ContactUsButton />
    </>
  );
}
