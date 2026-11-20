// Cloudflare Turnstile, verified ON THE SERVER for every form and login.
// See docs/BLUEPRINT.md and docs/TESTING.md.
// The secret key comes only from TURNSTILE_SECRET_KEY (never committed).
// In non-production, when no secret is configured, only Cloudflare's dummy
// token (XXXX.DUMMY.TOKEN.XXXX) is accepted — that is the published test
// behaviour, and no secret value is stored in code. In production a missing
// secret fails closed.
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

export function turnstileSiteKey(): string {
  return process.env.TURNSTILE_SITE_KEY ?? TURNSTILE_TEST_SITE_KEY;
}

export async function verifyTurnstile(token: string | null | undefined, ip?: string): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev/test behaviour only: accept the dummy token, nothing else.
    if (process.env.NODE_ENV === "production") return false;
    return token === TURNSTILE_DUMMY_TOKEN;
  }
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Honeypot: a hidden field bots fill in and people leave empty. */
export function honeypotFilled(form: FormData): boolean {
  const v = form.get("website");
  return typeof v === "string" && v.trim().length > 0;
}
