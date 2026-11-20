import { ActionForm } from "@/components/ActionForm";
import { submitTestimony } from "@/lib/actions";

export const metadata = { title: "Share a Testimony" };

export default function ShareTestimonyPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 24px" }}>Share a testimony</h1>
        <p>Tell us what God has done. Nothing is published until the ministry team approves it, and your email is never published.</p>
        <ActionForm action={submitTestimony} submitLabel="Share your testimony">
          <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email (never published)</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="category">Category</label>
            <select id="category" name="category">
              <option>Healing</option><option>Salvation</option><option>Provision</option><option>Deliverance</option><option>Answered prayer</option><option>Other</option>
            </select>
          </div>
          <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" required /></div>
          <div className="field"><label htmlFor="body">Your testimony (up to 3,000 characters)</label><textarea id="body" name="body" rows={8} maxLength={3000} required /></div>
          <div className="field"><label htmlFor="display">Show my name as</label>
            <select id="display" name="display">
              <option value="first">First name only</option><option value="full">Full name</option><option value="anonymous">Anonymous</option>
            </select>
          </div>
          <div className="field"><label><input type="checkbox" name="consent" required /> I am happy for this testimony to be published on the website.</label></div>
        </ActionForm>
      </div>
    </section>
  );
}
