import { AuthForm } from "@/components/AuthForm";
import { resetPassword } from "@/lib/actions-account";

export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)", margin: "0 0 16px" }}>Set a new password</h1>
        {token ? (
          <AuthForm action={resetPassword} submitLabel="Set my new password">
            <input type="hidden" name="token" value={token} />
            <div className="field"><label htmlFor="password">New password (at least 8 characters)</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
          </AuthForm>
        ) : (
          <p>This page needs a reset link from your email. <a href="/forgot-password" className="tl">Ask for a new one</a>.</p>
        )}
      </div>
    </section>
  );
}
