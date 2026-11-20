import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Page not found</h1>
        <p>That page is not here. Try a search, or one of these:</p>
        <p><Link href="/" className="tl">Home</Link> · <Link href="/events" className="tl">Events</Link> · <Link href="/sermons" className="tl">Sermons</Link> · <Link href="/contact" className="tl">Contact</Link></p>
        <form method="get" action="/search">
          <div className="field"><label htmlFor="q">Search the site</label><input id="q" name="q" /></div>
          <button type="submit" className="btn">Search</button>
        </form>
      </div>
    </section>
  );
}
