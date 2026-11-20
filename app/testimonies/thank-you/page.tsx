import Link from "next/link";

export const metadata = { title: "Thank you — testimony received" };

export default function TestimonyReceivedPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Thank you</h1>
        <p>Your testimony is received and waiting for review. The ministry team reads every one, and nothing is published until they approve it. If they ask for changes, you will get an email and can resend it.</p>
        <p><Link href="/testimonies" className="tl">Back to testimonies</Link></p>
      </div>
    </section>
  );
}
