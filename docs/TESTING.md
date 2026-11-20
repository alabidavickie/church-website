# Testing

How this project is tested. The full plan for people (acceptance tasks per role, launch day, monitoring) is the Church Website Testing Plan document; this file is the part Claude Code needs while building.

## Three copies of the site

| Copy | Where | Database | Keys |
| --- | --- | --- | --- |
| Local | Your computer | `supabase start` (needs Docker Desktop) | Test keys in `.env.local` |
| Staging | Vercel preview for each push | A second Supabase project with sample content only | Test keys; Stripe in test mode |
| Live | The church's domain | The real Supabase project | Live keys, entered by the church in Vercel |

Changes move one way: local, then staging, then live. Never copy real member data into local or staging.

## Commands

| Command | What it checks |
| --- | --- |
| `npm run lint` and `npm run typecheck` | Code style and types |
| `npm test` | Vitest unit tests: Turnstile check, time zones, amounts and currencies, reminder timing |
| `supabase test db` | pgTAP tests for row-level security on every table, per role |
| `npx playwright test` | Browser tests in Chromium, Firefox and WebKit at 320, 390, 768 and 1440 px |
| `npx playwright test --grep @a11y` | axe checks (`@axe-core/playwright`) on every page: WCAG 2.2 AA, no violations |
| `npx lhci autorun` | Lighthouse CI on staging: performance 90+ on phone for home, Today's Message, Events and Offering; SEO 100 |
| `stripe listen --forward-to localhost:3000/api/stripe/webhook` | Sends test Stripe events to your computer |
| `stripe trigger checkout.session.completed` | Fires one test event |

## Test keys and test data

- **Turnstile** (Cloudflare's published test keys, safe to commit in test config only):
  - Always passes: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`
  - Always fails: site key `2x00000000000000000000AB`, secret `2x0000000000000000000000000000000AA`
  - Token already used: secret `3x0000000000000000000000000000000AA`
  - The test secrets accept only the dummy token `XXXX.DUMMY.TOKEN.XXXX`, and production secrets reject it. Every form is tested with all three.
- **Stripe**: test mode and its test cards (success, declined, needs extra bank approval), in every enabled currency. Use test clocks to move a monthly gift through several months.
- **Email**: locally, Supabase's built-in test inbox. On staging, Resend's test addresses: `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`, `suppressed@resend.dev`.
- **People**: one seeded test user per role: visitor (logged out), member, prayer team, welcome team, editor, treasurer, admin, pastor. Admin test users use two-step sign-in like real ones.
- **Content**: `supabase/seed.sql` loads the Template B sample content so every test run starts the same way.
- **Visitor locations**: Playwright `timezoneId` and `locale` for America/New_York, Africa/Lagos, Europe/London and America/Los_Angeles, including the weeks when US and UK clocks change on different dates.
- **Social posting**: test posts are private or unlisted, and deleted after the check.

## What every feature must prove

| Feature | Automated test |
| --- | --- |
| "Verify you are human" | Each form and login refuses a missing, failing and reused token on the server |
| Header and compact bar | Menu fits at 320 px; bar appears after scrolling; typing in a form below it keeps focus |
| Cookie consent | Reject all leaves no Tawk.to, YouTube, Facebook, Maps or Analytics cookies or scripts; Consent Mode default is denied |
| Contact us | Tawk.to script absent until chat is allowed; the button opens it on every page |
| Visitor times | Sunday, Bible study and prayer times correct in the four test zones |
| Today's Message | Newest published message on the homepage; scheduled one appears at its time |
| Bible study chat | Post needs name, text and Turnstile; links and blocked words go to the flagged queue |
| Live stream | Player shows when the live check says live; admin override works |
| Zoom links | Join button appears 15 minutes before Bible study and prayer start; the link comes from Admin › Gatherings & Zoom |
| Sermon archive | New YouTube uploads arrive as drafts; only published sermons show; search and filters (type, speaker, series, book) work |
| About and I'm New | Content comes from admin settings and leaders; Plan a Visit saves, emails the visitor and alerts the welcome team |
| Announcement bar | Shows and hides on its start and end times; one at a time; dismissed bar stays hidden until the message changes |
| Search | Finds sermons, Bible studies, events, testimonies and pages; an empty search is handled |
| Events | Registration respects places, shows "full" and the waiting list |
| Prayer | Private requests readable by pastors only |
| Testimonies | Pending testimony unreadable by visitors, even by direct link; each decision sends the right email |
| Accounts | Sign up, log in and reset fail without Turnstile; reset link works once; delete account removes the data |
| Admin | Every admin action refused on the server for non-admins when called directly; two-step sign-in required |
| Reminders | Running the scheduler twice sends each reminder once; unsubscribe works without logging in |
| Offering | Success, decline and extra approval; bad webhook signature refused; duplicate webhook recorded once; monthly gift renews and cancels |
| Social posting | Success and failure per platform; Retry resends only the failed one; scheduled post goes within 15 minutes |
| Emails | Each renders with the church name and an unsubscribe link where needed |

## Security checks before each phase sign-off

- Run the `security-reviewer` agent on the phase's changes.
- Scan for secrets in code and Git history (for example `npx secretlint "**/*"` or gitleaks).
- Confirm no secret appears in client bundles: search `.next/static` for key prefixes such as `sk_`, `re_` and the service role key name.

## Bug levels

| Level | Example | Rule |
| --- | --- | --- |
| Critical | Private data visible to the wrong person; a form works without Turnstile; money recorded wrongly | Fix first; the phase is not done |
| Major | Broken on a common phone; an email never arrives; an admin task impossible | Fix before the phase is signed off |
| Minor | Spacing, wording | Fix if quick, otherwise list it in `docs/PLAN.md` |

## Sources

- Turnstile testing: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
- Supabase database testing: https://supabase.com/docs/guides/database/testing
- Supabase local development: https://supabase.com/docs/guides/local-development
- Resend test emails: https://resend.com/docs/dashboard/emails/send-test-emails
- Stripe webhooks: https://docs.stripe.com/webhooks
- Playwright MCP: https://github.com/microsoft/playwright-mcp
