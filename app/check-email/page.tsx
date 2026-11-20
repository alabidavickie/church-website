import Link from "next/link";
import { confirmEmail } from "@/lib/actions-account";
import { AuthForm } from "@/components/AuthForm";
import { resendConfirmation } from "@/lib/actions-account";

export const metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ confirm?: string }> }) {
  const token = (await searchParams).confirm;
  let confirmed: string | null = null;
  if (token) {
    const r = await confirmEmail(token);
    confirmed = r.message;
  }
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Check your email</h1>
        {confirmed ? (
          <>
            <p role="status" className="notice">{confirmed}</p>
            <p><Link href="/login" className="btn">Log in</Link></p>
          </>
        ) : (
          <>
            <p>We sent a confirmation link to your email. Open it to finish creating your account.</p>
            <p>Did it not arrive? Ask for a new one:</p>
            <AuthForm action={resendConfirmation} submitLabel="Send the link again">
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            </AuthForm>
          </>
        )}
      </div>
    </section>
  );
}
