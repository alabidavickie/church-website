import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { signup } from "@/lib/actions-account";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Sign up</h1>
        <p>Create a member account to see your registrations, testimonies, reminders and giving history.</p>
        <AuthForm action={signup} submitLabel="Create my account">
          <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="password">Password (at least 8 characters)</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
        </AuthForm>
        <p>Already have an account? <Link href="/login" className="tl">Log in</Link></p>
      </div>
    </section>
  );
}
