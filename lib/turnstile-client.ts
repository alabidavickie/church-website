// Client-side copy of the public Turnstile site key. Only the site key may
// ever appear in the browser — the secret key stays on the server.
export function turnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";
}
