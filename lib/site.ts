// Plain helpers shared by server actions (no "use server" here, so sync
// exports are allowed).
export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
