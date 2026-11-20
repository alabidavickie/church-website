# Church website ([Church Name], 6400B Frederick Road, Catonsville, MD 21228)

Instructions for any coding agent working on this project (Claude Code, Codex, Cursor, GitHub Copilot and others).

Build the church website described in `docs/BLUEPRINT.md` (read the sections the current task needs), matching the design in `design/template-b/` (open `design/template-b/all-pages.html` for the full list; the blueprint sitemap names the file for each page). Church facts and decisions live in `docs/CLIENT-DETAILS.md`. Testing is described in `docs/TESTING.md`. The current plan is `docs/PLAN.md` once phase 0 has written it.

## Build in phases
The build has 12 phases, 0 to 11. Do one phase per session, in order.
- What each phase builds: `.claude/skills/church-site/phases.md`
- How to work through a phase: `.claude/skills/church-site/SKILL.md` (steps 1 to 8)
- Code rules with examples: `.claude/skills/church-site/rules.md`
- Checks that prove a phase is done: `.claude/skills/church-site/checks.md`
- Security review checklist, run before each phase is signed off: `.claude/agents/security-reviewer.md`
- The prompt for each phase: `PROMPTS.md`

These files sit in `.claude/` because Claude Code loads them automatically, but they are plain Markdown and apply to every agent.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS, hosted on Vercel
- Supabase: Postgres with row-level security on every table, Auth, Storage, pg_cron and pg_net
- Stripe Checkout + webhooks, Resend for email, Cloudflare Turnstile, Tawk.to, MaxMind, YouTube Data API, Meta Graph API
- Tests: Vitest (unit), pgTAP via `supabase test db` (row-level security), Playwright with axe (browser and accessibility), Lighthouse CI

## Commands
- `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npx playwright test`
- `supabase start` runs the local database (needs Docker) · `supabase test db` runs the database tests
- `stripe listen --forward-to localhost:3000/api/stripe/webhook` for test payments
- `supabase db push` applies migrations; never change the database by hand
- Tests use Cloudflare's Turnstile test keys and Stripe test mode only (see `docs/TESTING.md`)

## Rules that are never broken
- IMPORTANT: every form and every login verifies the Turnstile token ON THE SERVER before doing anything (`lib/turnstile.ts`).
- Testimonies, Bible study posts that the filter flags, and anything else people submit stay unpublished until approved; enforce it with row-level security, not only in the page.
- Private prayer requests are readable by the Pastor role only.
- Secret keys come only from environment variables. Never open `.env`, `.env.local` or any other `.env` file except `.env.example`. Never print, log, commit or ask for a key. Add new key NAMES to `.env.example` with no value.
- No optional cookie or tracker (Tawk.to, YouTube, Facebook, Instagram, Google Maps, Google Analytics) loads before the visitor allows it in the cookie banner. Google Consent Mode v2 defaults to denied.
- Times are stored in America/New_York and shown in the visitor's city (MaxMind, then the browser time zone).
- Giving is called "Offering". Any amount, any currency the admin enables; the Stripe webhook is the record of truth.
- Never invent church facts. Use a clearly marked [placeholder] and list it at the end of the phase.

## Design rules
- Match Template B: navy #0B1830, gold #E6A82A, ground #FAF8F3; League Spartan for headlines, Figtree for text, DM Sans in the admin area; arch-shaped buttons and frames.
- The main menu is spelled out under the logo on every screen size. No hamburger icon.
- Every page must work at 320 px wide with no sideways scrolling, and with a keyboard alone.
- Write in plain, warm words for church members. Sentence case. No jargon on public pages.
- The UI/UX Pro Max and taste-skill design skills are for checking quality (spacing, contrast, accessibility, polish). Template B stays the source of truth: never redesign a page away from it unless the user asks.

## How to work
- Plan first, then build. Finish a phase only when its checks pass, and show the evidence (test output, screenshots).
- Keep each change scoped to the current phase. Commit at the end of each phase with a clear message.
- If something in the docs is missing or contradicts itself, stop and ask the user rather than guessing.
- When the conversation is summarised or compacted, keep the current phase number, the files changed and the commands that verify them.
