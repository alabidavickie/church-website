// Cron routes. Protected by the shared CRON_SECRET (Bearer token).
// Supabase pg_cron calls these every 15 minutes through pg_net — see
// supabase/migrations/0002_cron.sql. Vercel cron (vercel.json) is the
// alternative on Vercel Pro.
import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const result = await sendDueReminders(new Date(), base);
  return NextResponse.json({ ok: true, ...result });
}
