export const metadata = { title: "Privacy and cookies" };

export default function PrivacyPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Privacy and cookies</h1>
        <p>[Privacy policy — the church has not had this reviewed yet. The summary below is what the site actually does.]</p>
        <h2 style={{ fontSize: 26 }}>What we collect</h2>
        <ul>
          <li>Form details you send us (contact, prayer requests, testimonies, registrations, visit plans) — kept so the ministry team can reply and follow up.</li>
          <li>Account details if you sign up (name, email, phone) — kept while your account exists; deleting your account removes them.</li>
          <li>Cookie choices, recorded anonymously as proof of consent.</li>
          <li>Your IP address is not stored. Visitor times use MaxMind&apos;s City database to find your time zone, then the browser time zone as a fallback.</li>
        </ul>
        <h2 style={{ fontSize: 26 }}>Outside services</h2>
        <ul>
          <li>Cloudflare Turnstile — checks you are human on forms and logins.</li>
          <li>Stripe — takes card payments on its own checkout page; the church never sees card numbers.</li>
          <li>Resend — sends emails (confirmations, reminders, alerts).</li>
          <li>Tawk.to — live chat, only after you allow it.</li>
          <li>YouTube, Facebook, Instagram and Google Maps — embedded only after you allow videos, posts and maps.</li>
          <li>Google Analytics — visit counts, only after you allow them. Google Consent Mode v2 starts denied.</li>
        </ul>
        <p>Use <strong>Cookie settings</strong> in the footer to change or withdraw your choices at any time.</p>
        <p>MaxMind credit: this site uses MaxMind&apos;s GeoLite2 data, as their licence requires.</p>
      </div>
    </section>
  );
}
