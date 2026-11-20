# Plan — Next.js port (branch `port/nextjs`)

Port of the Muse Hatch artifact (`church-website`, phases 0–11) to a real
Next.js app in this repo, so it can be pushed to GitHub and deployed on
Vercel with Supabase. Written 2026-11-20.

## What was ported

All 12 phases, as far as possible without client secrets or details:

| Phase | Status |
| --- | --- |
| 0 Plan check | This file, plus `docs/BLUEPRINT.md` (unchanged spec) |
| 1 Foundation | Next.js 16 App Router + TypeScript + Tailwind v4, Vitest, `lib/turnstile.ts` (server verification), `.env.example`, `supabase/migrations/` |
| 2 Design system | Template B tokens in `app/globals.css` (navy #0B1830, gold #E6A82A, ground #FAF8F3, League Spartan / Figtree / DM Sans), arch buttons, header with the menu spelled out under the logo (no hamburger), sticky compact bar, footer, announcement bar, cookie banner (Consent Mode v2 denied by default), Contact us button (Tawk.to loads only after live-chat consent) |
| 3 Public pages | Home, About, I'm New, Events + detail, Sermons + detail, Watch, Offering, Today's Message + detail, Bible Study + detail, Prayer, Testimonies, Contact, Privacy, Search, Reminders, 404, sitemap, robots |
| 4 Public forms | Contact, prayer request, Plan a Visit, event registration (capacity + waiting list), email updates / reminder sign-up, Share a Testimony, Today's Message contact form, Bible study discussion — all via server actions that verify Turnstile on the server and check the honeypot first |
| 5 Accounts | Sign up, log in, forgot / reset password, check email, My account (profile, reminders, testimonies, registrations, giving, year-end statement, delete account). First account becomes Pastor. Two-step TOTP + 8 single-use backup codes, required for pastor / admin / editor / treasurer |
| 6 Admin area | All 17 screens under `/admin/*`, each role-checked on the server: overview, visitors, prayer, testimonies review, Bible study chat, registrations, gatherings & Zoom, live stream, announcement bar, reminders, events & banners, sermons & studies, Today's Message, post to social, offerings, users & roles, settings |
| 7 Moderation | Testimony approve / decline / ask-for-changes, flagged discussion queue, private prayer requests visible to pastors only (enforced in the admin screen and in the Supabase RLS policies) |
| 8 Reminders | Double opt-in sign-up, Reminders page (confirm / manage / unsubscribe, .ics download), 15-minute due sender (`/api/cron/reminders`, pg_cron in `supabase/migrations/0002_cron.sql`), `reminder_log` dedupe, Admin › Reminders with counts, test run, church-news composer |
| 9 Offerings | Any amount / currency / fund, one time / weekly / monthly, Turnstile before Checkout, Stripe Checkout Session (test mode), thank-you page, signature-verified webhook as the record of truth (each event recorded once), Admin › Offerings totals by fund and currency + CSV export, My account gifts + year-end statement |
| 10 Live + social | Live detection every 5 minutes in service windows (`/api/cron/live`) + manual "We're live" switch; one-click Post to social (one caption ≤ 2,200 chars, photo/video, tick YouTube / Facebook / Instagram, Post now or schedule, per-platform result, Retry for one platform only, Cancel, Connected accounts rail); 15-minute sender for scheduled posts |
| 11 Launch | Admin › Launch: automatic checks that turn green as settings land, manual launch checklist, "Waiting on the client" list; sitemap + robots; security checks in `docs/TESTING.md` |

## Architecture decisions (and where they differ from the artifact)

- **Data store seam.** The artifact used a Hatch-only database. Here every
  read/write goes through `lib/store.ts`. Locally, without a Supabase
  project, it keeps records in `.data/db.json` (gitignored, seeded with the
  Template B sample content). The production schema and RLS policies are in
  `supabase/migrations/0001_init.sql` — apply with `supabase db push` — and
  `lib/supabase.ts` is the client for the cutover. Swapping the store is one
  seam; it is not done yet because there is no Supabase project.
- **Auth.** Locally, accounts use scrypt password hashes + TOTP in
  `lib/auth.ts` (same rules as the blueprint: first account is Pastor,
  two-step required for staff roles). Production target is Supabase Auth
  with the same roles/TOTP model; the cutover is documented, not faked.
- **Scheduler.** Hatch cron jobs become Supabase `pg_cron` → `pg_net`
  calls to `/api/cron/*` every 15 minutes (`0002_cron.sql`), with
  `CRON_SECRET` Bearer auth. `vercel.json` cron is the Vercel Pro
  alternative (Hobby only runs daily).
- **Email / Stripe / social.** Each is a real integration behind an
  environment check: Resend (`lib/email.ts`), Stripe (`lib/stripe.ts`),
  Meta Graph API + YouTube Data API (`lib/social.ts`). With no keys they
  run in honestly-labelled **preview mode** — nothing is sent, taken or
  posted, and the UI says so.

## Preview / test-only (until the client replies)

- Stripe: preview mode, no Checkout URL, webhook refuses unsigned events.
- Resend: reminders and emails are composed and logged as Preview.
- Social: posts saved as Preview; Meta/Google tokens are not set.
- Turnstile: Cloudflare's published test keys in non-production.
- Live stream: auto-detection needs `YOUTUBE_API_KEY` + channel ID; the
  manual switch works now.
- Church details: all `[placeholders]` (name, logo, pastor, phone, email,
  office hours, Zoom, YouTube, Stripe link, Tawk.to ID).

## Still needs the client

See Admin › Launch / "Waiting on the client": details above, Stripe account
and live keys (entered by the church in Vercel), Resend sender + domain
records, Meta/Google one-time account connections, domain + DNS, two
Admin/Pastor people with authenticator apps, acceptance testing sign-off.

## How to run

```bash
cp .env.example .env.local   # test keys only
npm install
npm run dev                  # http://localhost:3000
npm run typecheck && npm run lint && npm test && npm run build
```

## Checks that prove a phase is done

`docs/TESTING.md` — Turnstile missing/fake/passing tokens, visitor times in
four zones, reminder scheduler run twice sends each reminder once, webhook
signature and duplicate-event handling, private prayer visibility, pending
testimony invisibility. Unit tests in `lib/*.test.ts` cover Turnstile,
times, amounts, social guards, TOTP and the reminder scheduler.
