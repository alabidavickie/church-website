# Build prompts

Run one phase per session, in order.

**Using a coding agent other than Claude Code** (Codex, Cursor, Copilot and others): it reads `AGENTS.md` automatically or when asked. Replace the first line of each prompt, `/church-site N`, with: `Read AGENTS.md and .claude/skills/church-site/SKILL.md, then do phase N.` Use the agent's own planning mode if it has one, and ask it to run the checklist in `.claude/agents/security-reviewer.md` before each commit.

1. Start a fresh session (`/clear`).
2. Press Shift+Tab until the status bar shows plan mode, then paste the phase prompt.
3. Read the plan. Change anything wrong (Ctrl+G opens it in your editor), then approve it.
4. Let it build. It must show the checks passing (test output and screenshots).
5. Check the result yourself on a phone and a computer, then ask it to commit.

The site launches after phase 11. If the church needs it sooner, a soft launch is possible after phase 7, with Offerings and social posting switched off.

## Phase 0: Check the plan before any code

```text
/church-site 0
Read CLAUDE.md, docs/BLUEPRINT.md, docs/CLIENT-DETAILS.md and the pages in design/template-b/. Interview me with the AskUserQuestion tool about anything missing, unclear or contradictory, especially the details still marked as placeholders. Then write docs/PLAN.md: for each phase, the pages, database tables, environment variables and the exact checks that prove it is done. Do not write any code yet.
```

## Phase 1: Foundation

```text
/church-site 1
Follow docs/PLAN.md phase 1. Create the Next.js app (App Router, TypeScript, Tailwind) with Vitest for unit tests and Playwright for browser tests. Set up the GitHub repository, the Vercel project and the Supabase project with a migrations folder. Read keys only from environment variables and add any new key name to .env.example. Build lib/turnstile.ts (verifyTurnstile) with unit tests for a missing token, a fake token and a passing token. Run lint, type check and tests, show me the output, then deploy a preview to Vercel and give me the link.
```

## Phase 2: Design system and shared layout

```text
/church-site 2
Recreate the Template B look from design/template-b/: colours, fonts, the arch shapes, buttons, the header with the menu spelled out under the logo (no menu icon), the Search link, the compact menu that slides down on scroll, the footer, the announcement bar, the cookie banner with Google Consent Mode v2, and the Contact us button that loads Tawk.to only after live chat is allowed. Take Playwright screenshots at 390 and 1440 pixels wide and compare them with design/template-b/index.html. List the differences and fix them before you stop.
```

## Phase 3: Public pages

```text
/church-site 3
Build the public pages from docs/PLAN.md phase 3, matching their Template B files: home, Today's Message, Bible Study, Sermons, sermon detail, Watch, Events, event detail, About, I'm New, Prayer, Testimonies, Contact, Privacy, Search and the 404 page. Content comes from Supabase tables and site settings, seeded with the placeholder content from the templates. Show service times in the visitor's city using MaxMind, with the browser time zone as the fallback. Check every page at 320, 390, 768 and 1440 pixels: no sideways scrolling, keyboard navigation works, and no broken links.
```

## Phase 4: Forms with Verify you are human

```text
/church-site 4
Wire up every public form: contact, prayer request, Plan a Visit, event registration (with the waiting list), email updates, "Email me a reminder" (confirmed by an email link), Share a Testimony and the Today's Message contact form. Each one goes to a server action that verifies Turnstile on the server before saving anything. Turn on row-level security so the public can read only approved testimonies and nobody but the Pastor role can read private prayer requests. Send confirmation emails with Resend. Write a Playwright test for each form proving it rejects a missing or fake token, and a database test proving a pending testimony cannot be read by a logged-out visitor.
```

## Phase 5: Member accounts

```text
/church-site 5
Build sign up, log in, forgot password, set a new password and check your email with Supabase Auth, with Turnstile passed as the captcha token. Add the seven roles from the blueprint (member, prayer team, welcome team, editor, treasurer, admin, pastor), My account (profile, my giving placeholder, reminders, my testimonies, delete account) and two-step sign-in (an authenticator app) required for pastors, admins, editors and the treasurer. Test that each auth form fails without Turnstile and that a member cannot open any admin page.
```

## Phase 6: Admin area

```text
/church-site 6
Build the admin area from the Admin pages in design/template-b/: overview, new visitors, prayer requests, testimonies review, registrations, gatherings and Zoom, announcement bar, events and banners, sermons and studies, Today's Message editor, users and roles, and settings. Each screen checks the user's role on the server, not just in the menu. The phone Menu button must open the side menu. Use the security-reviewer agent to review this phase's changes, then fix what it finds.
```

## Phase 7: Testimonies, Bible study chat and Today's Message

```text
/church-site 7
Finish the moderation flows: testimony approve, decline and ask-for-changes with the emails; the Bible study Discussion & Questions chat with Turnstile on every post, a posting limit, a link and blocked-word filter and the admin flagged queue; and publishing Today's Message to the homepage on a schedule. Test each flow end to end in the browser.
```

## Phase 8: Reminders and the scheduler

```text
/church-site 8
Build the reminder emails to match reminders.html and admin-reminders.html: Bible study the day before and 1 hour before, prayer meeting 1 hour before, new events, event registrants and planned visitors the day before, Today's Message when published, and church news sent by an admin. Use Supabase pg_cron every 15 minutes to call a protected route through pg_net, record each send in reminder_log so nothing goes out twice, attach an .ics calendar file, and give every email a one-click unsubscribe that leads to the Reminders page. Prove it with a test that runs the scheduler twice and sends each reminder once.
```

## Phase 9: Offerings with Stripe

```text
/church-site 9
In Stripe test mode, build giving: any amount in the currencies set in admin settings, one time, weekly or monthly, a fund picker, Turnstile before the Checkout Session is created, the thank-you page, the webhook as the record of truth (with its signature checked), the Customer Portal link in My account, the admin Offerings report and the year-end giving statement. Test a one-time gift, a monthly gift, a failed card and a cancelled subscription with Stripe's test cards, and show me each one in the admin report.
```

## Phase 10: Live stream, sermon import and social posting

```text
/church-site 10
Add YouTube live detection during the service windows (the player appears on the homepage and Watch page by itself, with the admin override), the daily import of new uploads as sermon drafts, and Post to social from admin-social.html: upload a photo or video once, one caption that becomes the Facebook post text, the Instagram caption and the YouTube description (with a counter to Instagram's 2,200 characters), a YouTube title and visibility, an Instagram post type, ticks for YouTube, Facebook and Instagram, Post now or a scheduled time, a link to each finished post, Retry for a failed platform only, and Reconnect when a connection expires. Before connecting YouTube, ask me to confirm the Google OAuth consent screen is set to "In production". Keep within YouTube's daily limit and store every platform token encrypted. Test with the church's real accounts in a private test post, then delete it.
```

## Phase 11: Launch

```text
/church-site 11
Work through the launch checklist in docs/BLUEPRINT.md one item at a time and show evidence for each. Add the sitemap, robots file and church details for Google search results. Set up the error monitor and uptime monitor, check the Lighthouse targets in docs/TESTING.md, and run the security-reviewer agent over the whole project. Then help me run the church's acceptance testing on staging and fix what comes up. Then walk me through connecting the church's domain in Cloudflare and Vercel and switching Stripe to live keys. I will enter the live keys myself.
```

## Any time

- What's next: `/church-site` then "what phase is next and what do you need from the church?"
- Client fix: paste the screenshot, then say which page, what to change, and "show me a screenshot at 390 px and 1440 px after the fix".
- Fresh-eyes check: "Use the security-reviewer agent to review the last commit."
