import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { forgotPassword } from "@/lib/actions-account";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Forgot your password?</h1>
        <p>Enter your email and we will send a reset link. It works once and expires in one hour.</p>
        <AuthForm action={forgotPassword} submitLabel="Send the reset link">
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        </AuthForm>
        <p><Link href="/login" className="tl">Back to log in</Link></p>
      </div>
    </section>
  );
}
