# Church Website Build Blueprint

Oct 20, 2026 · updated Nov 7, 2026 · @0xdave

## Overview

The site is a mobile-friendly church homepage that opens with Today's Message and this week's services, plus events, online Bible study with a moderated discussion and prayer, moderated Testimonies, Stripe Offerings, live chat and social feeds, plus a small admin area to run it all. Every public form and every login is protected by Cloudflare Turnstile, checked on the server.

What changed from the original sketch:

- **Testimonies added.** Members and visitors submit; nothing is published until an admin approves it.
- **"Donations and Offerings" is now just "Offerings"** everywhere: homepage band, page title, admin menu and Stripe receipts.
- **A real Prayer Request form** sits beside the Tawk.to chat, so requests are saved, can be marked private, and reach the pastoral team even when nobody is online to chat.
- **Plan Your Visit** section added with the address (6400B Frederick Road, Catonsville, MD 21228), a map and directions.
- **A contact form and newsletter signup** back up the live chat, both with Turnstile.
- **Admin area** to manage events, registrations, Bible study links, prayer requests, testimonies and Offerings reports, plus one-click posting to YouTube, Facebook and Instagram.
- **About Us, I'm New, a sermon archive, automatic reminders and an announcement bar** added, so newcomers know what to expect and regulars always have the right link.
- **Today's Message at the top of the homepage**, followed by this week's services with Past Services, Past Bible Studies and Prayer Request links.
- **Header button says "Offering"**, and the menu is spelled out under the logo on every screen, including phones (no menu icon).
- **Bible study pages** with a summary for every study, a list of past studies, and a Discussion & Questions chat protected by Turnstile.
- **Any amount, in any currency.** No preset amounts.
- **Times shown in the visitor's own city** (for example "9:00 am Lagos"), using MaxMind, with New York time underneath.
- **"Contact us" at the bottom right of every page** opens the Tawk.to live chat.
- **Cookie consent for first-time visitors**, so the site meets the GDPR and Google's EU user consent policy.

The design is **Template B**, chosen by the church. All 45 screens are in `design/template-b/` (open `all-pages.html` for the list). The build matches them.

## Design: Template B

**Design rules:**

- **One shape:** the arched top of the old Frederick Road milestone stones, which also reads as a church window. It shapes the buttons, picture frames, list markers, the Offering band and the footer.
- **Type:** League Spartan for headlines and Figtree for text on the public site; DM Sans in the admin area.
- **Colors:** deep navy `#0B1830` for text, gold `#E6A82A` as the one accent, warm white `#FAF8F3` ground with a sand tone `#EFEADF` for alternate sections.
- **Left out on purpose:** small uppercase labels above headings, rows of identical cards, thin divider lines, gradients and drop shadows.
- **One live element:** the homepage counts down to the next gathering in Eastern time, and says "happening now" during it.
- **Motion:** pictures open from the bottom, sections rise in as you scroll, and everything stays still for visitors who turn motion off.
- **Accessibility:** 4.5:1 text contrast, 44px tap targets, visible keyboard focus, a label on every field and a skip link. Nothing moves or rotates on its own, so no pause control is needed.
- **Pictures:** the drawn placeholders are replaced with the church's own photos (building, services, leaders) before launch.
- **Admin:** the "accent ladder" style. Gold appears only on small marks and pale gold tints mark the selected item, so volunteers see at once what needs attention.

Before launch, the site is checked with the taste skill's inspector at phone, tablet and desktop widths, and against the UI/UX Pro Max pre-delivery checklist.

## Sitemap

Twenty-eight public pages and one admin area cover everything in the sketch plus the additions above. The last column names the Template B file each page must match.

| Page | URL | What's on it | Turnstile | Template B file |
| --- | --- | --- | --- | --- |
| Home | `/` | Today's Message summary, this week's services (Sunday, Bible study, prayer, live stream), events, latest testimonies, sermons, prayer request, Offerings, YouTube/Facebook/Instagram, visit and contact | Contact form, newsletter | index.html |
| Today's Message | /todays-message | The latest message in full, list of previous messages, contact form at the bottom | Contact form | todays-message.html |
| Earlier message | /todays-message/\[slug\] | One past message, with the same list and contact form | Contact form | todays-message.html |
| About Us | `/about` | Church story, statement of faith, pastor and leaders | — | about.html |
| I'm New | `/im-new` | What to expect, parking, accessibility, children, Plan a Visit form | Plan a Visit form | im-new.html |
| Events | `/events` | All upcoming events, past events | — | events.html |
| Event detail + registration | `/events/[slug]` | Date, time, location, description, registration form | Registration form | event-detail.html |
| Bible Study | `/bible-study` | This week's study + Zoom link, reminder sign-up, past studies with a summary for each | — | bible-study.html |
| Bible study detail | /bible-study/\[slug\] | Recording, summary, questions to think about, Discussion & Questions chat | Discussion posts | bible-study.html (study view) |
| Prayer | `/prayer` | Next online prayer meeting + Zoom link, reminder sign-up, prayer request form, live chat | Prayer request form | prayer.html |
| Testimonies | `/testimonies` | Approved testimonies, filter by category | — | testimonies.html |
| Share a Testimony | `/testimonies/share` | Submission form | Submission form | testimony.html |
| Offerings | `/offerings` | Any amount in the giver's own currency, one time, weekly or monthly, fund picker, Stripe Checkout | Offerings form | offerings.html |
| Watch | `/watch` | YouTube live and recent services | — | watch.html |
| Sermons | `/sermons` | Past Sunday sermons, newest first, with search; link across to past Bible studies | — | sermons.html |
| Sermon detail | `/sermons/[slug]` | Video, summary, scripture, notes PDF | — | sermon-detail.html |
| Contact & Visit | `/contact` | Address, map, contact form, live chat | Contact form | contact.html |
| Search | `/search` | Results across sermons, Bible studies, events, testimonies and pages | — | search.html |
| Log in | `/login` | Member and admin sign-in | Yes | login.html |
| Sign up | `/signup` | Create a member account | Yes | signup.html |
| Forgot password | `/forgot-password` | Email a reset link | Yes | forgot-password.html |
| Set a new password | `/reset-password` | From the emailed link | Yes | reset-password.html |
| Privacy and cookies | `/privacy` | Privacy policy, each outside service, MaxMind credit, Cookie settings | — | privacy.html |
| Check your email | /check-email | After sign-up: confirm the email, send the link again; then "you're in" | Send again | check-email.html |
| My account | /account | Profile, my giving (change or stop monthly offering, gift history, year-end statement), reminders, my testimonies, delete account | Profile form | account.html |
| Thank you (offering) | /offerings/thank-you | Receipt summary after Stripe, next steps | — | thank-you.html |
| Reminders | /reminders | Reminder confirmed; manage or unsubscribe from the link in any email | — (signed link) | reminders.html |
| Testimony received | /testimonies/thank-you | What happens next after sharing a testimony | — | testimony-received.html |
| Page not found | (any missing address) | Search box and popular pages | — | not-found.html |
| Admin | `/admin/*` | Dashboard, announcement bar, events and banners, registrations, new visitors, prayer requests, sermons and Bible studies, reminders, testimonies, Offerings reports, post to social, users | Login only (behind sign-in) | admin-*.html and admin-two-factor.html |

Every page in this sitemap now has a design in Template B: 45 screens in all, including admin two-step sign-in and 17 admin screens (overview, visitors, prayer requests, testimonies, Bible study chat, registrations, gatherings and Zoom, live stream, announcement bar, reminders, events and banners, sermons and studies, Today's Message, post to social, offerings, users and roles, settings). A Search link sits next to the Offering button on every page.

## Tech stack

Build it as a Next.js app hosted on Vercel, with Supabase for the database, logins and file storage. All three have free tiers that fit a church site.

```text
Visitor's browser ──► Vercel (Next.js pages and server actions, secret keys live here)
                         ├─► Cloudflare Turnstile (verify every form and login)
                         ├─► Supabase (database, logins, files, scheduler)
                         ├─► Stripe (Checkout and webhooks)
                         └─► Resend (emails)
Card details go from the browser straight to Stripe's checkout page.
```

Forms always go to the website's own server, where the secret keys for Turnstile, Supabase, Stripe and email are kept; card details go straight to Stripe's checkout page.

| Layer | Choice | Why |
| --- | --- | --- |
| Website framework | Next.js (App Router) + TypeScript + Tailwind CSS | Fast pages, server-side form handling where Turnstile and Stripe secrets stay private |
| Hosting | Vercel | Automatic deploys from GitHub, free SSL, preview links for every change |
| Database, logins, files | Supabase (Postgres, Auth, Storage) | Row-level security keeps pending testimonies and prayer requests private; built-in Turnstile support on sign-in |
| Bot protection | Cloudflare Turnstile | Required on every form and login |
| Payments | Stripe Checkout + Customer Portal | Card data never touches your server; recurring Offerings handled by Stripe |
| Live chat | Tawk.to widget | Free, matches the sketch; staff answer from the Tawk.to app |
| Online meetings | Zoom meeting links | Stored per Bible study and prayer meeting, edited in admin |
| Email | Resend (or the church's existing email provider) | Registration confirmations, "testimony published" notices, admin alerts |
| Social | YouTube embed, Facebook Page Plugin, Instagram embed | Live stream and latest posts on the homepage |
| Domain and DNS | Cloudflare | Turnstile lives in the same dashboard; free DNS and extra DDoS protection |

## Cloudflare Turnstile on every form and login

No form or login is accepted unless the server has verified a fresh Turnstile token with Cloudflare. The widget on the page alone does not stop bots; the server check does.

Protected: contact, email updates (newsletter), "Email me a reminder", Plan a Visit, prayer request, event registration, testimony submission, Today's Message contact form, Bible study discussion posts, Offerings (before creating the Stripe session), My account profile, "send the link again" on Check your email, sign up, log in, forgot password and set a new password.

How each submission is handled:

1. The page shows the Turnstile widget using the public **site key**.
2. On submit, the browser sends the form fields plus the Turnstile token to a Next.js server action.
3. The server posts the token, the **secret key** and the visitor's IP to Cloudflare's `siteverify` endpoint.
4. If Cloudflare says it failed, the server rejects the form with a friendly "please try again" message and saves nothing.
5. Only after a pass does it validate the fields, save to Supabase and send emails.

For logins, turn on CAPTCHA protection in Supabase Auth with the Turnstile secret, and pass the token as `captchaToken` on sign-up, sign-in and password reset. Supabase then refuses any login attempt without a valid token.

One shared helper keeps this consistent:

```ts
// lib/turnstile.ts (server only)
export async function verifyTurnstile(token: string, ip?: string) {
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
  });
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = await res.json();
  return data.success === true;
}
```

Extra rules: tokens are single-use and expire after five minutes, so the widget resets after every submission; keep the secret key only in Vercel environment variables; add a hidden honeypot field and per-IP rate limits on the busiest forms as a second layer.

## Testimonies

Every testimony is saved as **Pending** and stays invisible to the public until an admin approves it; the database itself enforces this, not just the website.

```text
Share a Testimony ─► Turnstile fails ─► nothing saved, "please try again"
                  └► Turnstile passes ─► saved as Pending ─► editor or admin reviews
                                                             ├─► Approve: published, submitter emailed
                                                             ├─► Ask for changes: submitter emailed, can resubmit
                                                             └─► Decline: submitter emailed, never published
```

A failed Turnstile check saves nothing; a passed one waits as Pending until an admin approves, declines or asks for changes.

**Who can submit:** members (logged in, name and email filled in for them) and visitors (no account needed). Both pass Turnstile.

**Form fields:** name, email (never published), member or visitor, category (Healing, Salvation, Provision, Deliverance, Answered prayer, Other), title, testimony text up to 3,000 characters, display choice (full name, first name only, or Anonymous), consent to publish.

**Statuses:** Pending (shown as "Waiting" in the admin screen) → Approved (published), Declined, or Changes requested (the person gets an email and can resubmit).

**Admin review screen** (`admin-review.html`): a queue with Pending, Approved and Declined tabs and a count badge in the menu. Each item shows the full text with Approve & publish, Edit and Decline. Admins can trim the text or fix spelling before approving; the original is kept.

**Safeguards:**

- Supabase row-level security lets the public read only rows where `status = 'approved'`.
- Each review records who approved or declined it and when.
- Admins get an email when a new testimony arrives; the submitter gets one when it is published.
- Approved testimonies can be unpublished later, and a "feature on homepage" switch picks the three shown on the home page.

## Offerings

Givers choose an amount and fund on the Offerings page, pass Turnstile, then pay on Stripe's hosted checkout; the church never sees or stores card numbers.

1. The Offerings form collects frequency (one time, weekly, monthly), amount (any amount the giver types in, no presets; the server checks it again before creating the payment), currency (defaults to the visitor's country, and the giver can change it), fund (Offering, Tithe, Thanksgiving, Building Fund, Missions), name, email, and a "cover processing fees" box if the church wants one (see `docs/CLIENT-DETAILS.md`).
2. The server verifies Turnstile, then creates a Stripe Checkout Session: `payment` mode for one-time gifts, `subscription` mode for weekly or monthly.
3. The giver pays on Stripe and returns to a thank-you page.
4. A Stripe webhook (`checkout.session.completed`, `invoice.paid` for each recurring gift, `invoice.payment_failed`, `customer.subscription.updated` and `customer.subscription.deleted`) records gifts and monthly-gift changes in Supabase. The webhook, not the thank-you page, is the source of truth. Each Stripe event is recorded once, even if Stripe sends it twice.
5. Stripe emails the receipt; brand it with the church name and logo in the Stripe dashboard and label it "Offering".

**Any currency.** Stripe can charge cards in more than 135 currencies and converts each gift into the church's US dollar payout. The smallest gift Stripe accepts is the equivalent of $0.50 after conversion. Before a currency is listed on the page, confirm in the church's Stripe dashboard that it can be charged; Nigerian naira, Ghanaian cedi and Kenyan shilling in particular need checking. The list of currencies is kept in site\_settings so an admin can change it without code.

Recurring givers change or cancel through Stripe's Customer Portal, linked from the Offerings page and from My account. Signed-in givers see their gift history in My account and can download a year-end giving statement (PDF) with the church's legal name, address and EIN. Admins see totals by fund and month in the admin area and can export CSV for the treasurer; Stripe remains the official ledger.

When the church sets up Stripe, ask Stripe about its nonprofit pricing, which can lower card fees for registered 501(c)(3) churches.

## Integrations

Each outside service is connected in one place and controlled from admin, so nobody edits code to change a link.

| Service | Where it shows | How it's wired | Admin controls |
| --- | --- | --- | --- |
| Zoom | Bible Study and Prayer cards, service-times strip | Zoom meeting link (and passcode, if used) saved on each session record; the "Join" button goes live 15 minutes before start | Add a session, paste its Zoom link |
| Tawk.to | "Contact us" button at the bottom right of every public page, plus the "Chat with us" and "Ask us anything" links | The site draws its own Contact us button. The Tawk.to script loads only after the visitor allows live chat; its own bubble is hidden (Tawk\_API.hideWidget) and the button opens the chat (Tawk\_API.maximize), hiding it again when minimised. Logged-in members' names are passed through (Tawk\_API.visitor) | Staff reply from the Tawk.to app |
| YouTube | Homepage Watch card, `/watch`, Bible study archive | Live player appears on its own while the channel is live (see Live Sunday service), otherwise the latest upload | Set channel ID; paste video links for archived studies |
| Facebook | Homepage Watch & connect | Facebook Page Plugin embed (timeline tab) | Set page URL |
| Instagram | Homepage Watch & connect | Post embeds or a feed widget | Pick posts or set account |
| Google Maps | Plan your visit, Contact | Map embed for 6400B Frederick Road, Catonsville, MD 21228 | — |
| Stripe | Offerings | Checkout, Customer Portal, webhook | Fund list, currencies offered |
| Email (Resend) | Confirmations and alerts | Sent from server actions after Turnstile passes | Edit who receives admin alerts |

Social embeds load third-party trackers. Load them only after the visitor allows "Videos, posts and maps" in the cookie banner (until then, show a short placeholder with an Allow button), and only when they scroll into view, and mention them in the privacy policy.

## Cookie consent (GDPR)

First-time visitors see a privacy banner before any optional cookies or trackers load. This covers the GDPR and UK GDPR, and Google's EU user consent policy, which applies to sites that use Google products such as Analytics, Maps or YouTube and have visitors from the EEA, the UK or Switzerland.

- The banner offers **Accept all** and **Reject all**, equally prominent, plus **Choose which cookies**. The site works whatever the visitor picks; there is no cookie wall.
- Four groups: Needed for the site (Turnstile, Stripe, remembering the choice; always on), Live chat (Tawk.to), Videos, posts and maps (YouTube, Facebook, Instagram, Google Maps) and Visit counts (Google Analytics).
- Nothing optional loads until its group is allowed: the Tawk.to script, YouTube and social embeds, Google Maps and Google Analytics all wait. A blocked embed shows a short placeholder with an Allow button.
- Google Consent Mode v2: every page sets ad\_storage, analytics\_storage, ad\_user\_data and ad\_personalization to denied before any Google tag loads, then sends an update when the visitor chooses. The site shows no ads, so the three advertising signals stay denied.
- The choice is saved in a first-party cookie for 6 months, then asked again; it is also asked again if the list of services changes. "Cookie settings" in every footer reopens the banner to change or withdraw consent.
- Each choice is recorded in consent\_log (anonymous ID, choices, banner version, date and time) as proof of consent.
- The privacy policy names each service, what it collects and why, and links to Google's page on how it uses information from sites that use its services.
- The banner is shown to every first-time visitor, not only European ones. It is simpler, and the church has visitors from many countries.
- If the church ever shows Google AdSense or other Google ads on the site, replace this banner with a Google-certified consent platform (CMP) that supports the IAB TCF, which Google requires for personalised ads in the EEA, the UK and Switzerland.

## Live Sunday service on the website

When the church goes live on YouTube, a "Live now" player appears at the top of the homepage and on the Watch page and plays the stream right on the site. When the stream ends, it disappears and the latest service shows in its place.

1. Every 5 minutes during the service window (a separate `pg_cron` job that runs only in those windows) (Sunday 10:00 AM to 1:00 PM ET by default, plus any event that is marked as streamed), the scheduler asks YouTube whether the church channel has a live broadcast.
2. If it does, the site saves that video and switches on the live player; the page refreshes its live status every minute, so viewers see it without reloading.
3. When YouTube reports the stream has ended, the player is switched off and the recording is added to the sermon archive as a draft.
4. Admins also have a manual **We're live** switch with a box for the video link, as a backup if the automatic check misses.

YouTube's live search is limited to 100 checks a day, so checking only during service windows (about 36 checks on a Sunday) keeps it free. The player starts muted, because browsers block sound on videos that start by themselves; viewers tap to unmute. A new `live_status` record holds whether the church is live, the video ID and when it started.

## Newcomers, sermons, reminders and announcements

Five additions help first-time visitors and cut down on "what's the link?" messages. All of them are edited from admin, and every new form passes Turnstile.

### About Us page

`/about` holds the church's story, statement of faith, and pastor and leaders (photo, name, role, short bio, display order). Admins edit the text and add or reorder leaders without touching code.

### I'm New page and Plan a Visit form

`/im-new` covers what a Sunday is like, parking, accessibility and the children's program, with a homepage band linking to it.

1. A visitor fills in Plan a Visit: name, email, optional phone, which Sunday, number of adults and children, notes, and "meet me at the door". Turnstile is checked first.
2. They get an email with directions and a calendar invite, plus a reminder the day before.
3. The welcome team gets an alert and sees the visit under **Admin › New visitors**, where they mark it Expected, Welcomed or Followed up.

### Automatic reminders

Reminder emails carry the Zoom link and "add to calendar" links, so people never have to hunt for them.

| Who gets them | Sent | Contains |
| --- | --- | --- |
| Bible study subscribers (tap "Email me a reminder", pass Turnstile, then confirm by email; or switch it on in My account) | Day before, and 1 hour before | Date, time, topic, Zoom link, calendar links |
| Prayer meeting subscribers | 1 hour before | Date, time, Zoom link, calendar links |
| Events subscribers | When a new event is published | Event details and a link to register |
| Event registrants | Day before | Event details, address or link, calendar links |
| Today's Message subscribers | When a new message is published (Sunday afternoon) | Title, scripture, summary, link |
| Church news subscribers (the email updates form) | About once a month, sent by an admin | The church's news |
| Planned visitors | Day before their Sunday | Service time, address, parking, who will greet them |

These match the Reminders page (`reminders.html`), the reminders tab in My account and Admin › Reminders.

Every confirmation also attaches an `.ics` calendar file. Every reminder has a one-click unsubscribe and "manage reminders" link. A log of sent reminders stops anyone getting the same email twice.

Scheduling: Vercel's free Hobby plan only runs scheduled jobs once a day, at an imprecise time. So reminders and scheduled social posts run on Supabase's built-in scheduler (`pg_cron`), which calls a protected route on the site every 15 minutes through Supabase's `pg_net` extension, with a shared secret (`CRON_SECRET`). Upgrading to Vercel Pro is the alternative.

### Sermon archive

`/sermons` lists every Sunday sermon and Bible study recording, newest first. Visitors can search by title, topic or scripture and filter by type, speaker, series or book of the Bible.

- A daily job checks the church YouTube channel for new uploads and adds them as drafts.
- An admin adds the speaker, series, scripture and optional notes PDF, then publishes.
- Each sermon gets its own page (`/sermons/[slug]`) with the video, notes and a short summary.
- Bible study recordings live in the same archive with the type "Bible study". The past studies list on the Bible Study page reads from the same records, so each study is entered once.

### Announcement bar

A strip across the top of every page for urgent news, such as a snow closure or a service moved online.

- Admins set the message, an optional link, a style (information or urgent) and start and end times.
- Only one is live at a time, and it disappears on its own at the end time.
- Visitors can dismiss it. It stays hidden for them until the message changes.

## Today's Message and the homepage

The homepage opens with Today's Message, a short summary of the pastor's latest sermon, so people see what was preached before anything else.

- Homepage order: announcement bar; logo with the menu spelled out underneath (no menu icon, even on phones) and the Offering button; the live player when streaming; Today's Message; this week's services; events; testimonies; sermons; prayer request; the Offerings band; how to find the church.
- Once the visitor scrolls past the header, a slim bar slides down and stays at the top on every public page: logo, the full menu spelled out and the Offering button. On desktop it is one row (64 px). On phones and tablets it is two rows (about 94 px), with the menu swiped sideways. Links to sections on a page stop below the bar.
- The Today's Message block shows the title, date, scripture, a two- or three-sentence summary, a "Read the full message" link and a "Previous messages" link.
- /todays-message shows the full message: the summary, the body in short sections, a highlighted Bible verse and "this week" steps. Earlier messages are listed underneath, newest first, each at its own address.
- A contact form sits at the bottom of every message page (name, email, message, Turnstile). It saves to contact\_messages with the message it came from, so the pastor can see responses by sermon.
- Admins write the message in admin (or start from the sermon's summary) and schedule it; once published it becomes the homepage block.
- This week's services sit right under it: Sunday Service (Plan your visit, Past Services, Add to calendar), Bible Study (this week's passage, a short summary and the earlier studies in the series; Join on Zoom, Past Bible Studies, Email me a reminder), Prayer Meeting (Join on Zoom, Prayer Request) and the live stream.
- Events change only when a visitor taps one. Nothing rotates on its own, so no Pause button is needed.

## Bible study pages and discussion

/bible-study shows this week's study and the list of past studies, each with its summary. Opening a study shows the recording, the summary, questions to think about and a Discussion & Questions chat.

- Anyone can read the discussion. Posting needs a name, the message and a passed Turnstile check ("Verify you are human"); the check resets after every post.
- The server verifies Turnstile, allows each person only a few posts an hour, checks for links and blocked words, then saves the post to study\_posts.
- Posts appear straight away unless the filter flags them; flagged posts wait for an admin. Admins can hide any post, and the teacher's replies carry a Teacher badge.
- A "Bible study chat" queue in admin, next to the testimonies queue, shows flagged posts with a count badge.
- Email addresses, if collected, are never shown on the page.

## Times in the visitor's own city

Service times are shown in the visitor's own time, labelled with the main city of their time zone, for example "Sunday 3:30 pm Lagos" or "Sunday 10:30 am New York". Visitors outside New York time also see the New York time underneath.

- The church's times are stored once, in New York time, in site\_settings and sessions.
- On each page request the server looks up the visitor's IP address in MaxMind's City database with MaxMind's official Node.js reader and takes the time zone from the result (for example Africa/Lagos).
- The label is the time zone's main city (Africa/Lagos gives Lagos, America/New\_York gives New York), not the visitor's own town, so it stays short and doesn't reveal where they are.
- The time is converted with the built-in date tools, so summer and winter clock changes are handled on both sides.
- If the lookup fails, or the visitor uses a VPN, the page uses the time zone the browser reports instead.
- GeoIP2 City (paid) is the most accurate; the free GeoLite City database is enough for time zones. Vercel's servers cannot keep a file updated on their own, so a build step downloads the database with the MaxMind licence key and bundles it with the site, and a scheduled GitHub Action calls a Vercel deploy hook once a week so the database is refreshed. Credit MaxMind on the privacy page as the licence requires.
- The visitor's IP address is not stored.

## One-click social posting

An admin uploads a photo or video once, ticks YouTube, Facebook and/or Instagram, and the site posts to the church's own accounts through each platform's official API, either now or at a scheduled time.

1. On **Admin › Post to social** (`admin-social.html`), the admin uploads the file, writes one caption (it becomes the Facebook post text, the Instagram caption and the YouTube description; the counter keeps it within Instagram's 2,200 characters), ticks the platforms, adds a YouTube title and visibility or an Instagram post type, and picks "Post now" or a date and time.
2. The server saves the post with one job per platform; the file goes into Supabase Storage.
3. A background job sends each platform its copy. Scheduled posts are picked up by the same 15-minute scheduler as reminders (see Automatic reminders above).
4. Each platform's result shows on the screen: a link to the live post, or the error with a Retry button that resends to that platform only.

| Platform | What can be posted | Requirements | Limits |
| --- | --- | --- | --- |
| Facebook | Text, photos, videos and links on the church Page | A Facebook Page; the person who connects it must be able to create content on that Page | — |
| Instagram | Photos (JPEG only), videos as Reels, carousels of up to 10, Stories | An Instagram Professional account; Stories need a Business account; no text-only posts | 50 API posts per rolling 24 hours; a carousel counts as one |
| YouTube | Videos only, with title, description, visibility and an optional publish time | The channel owner signs in with Google once to connect it | Google lists 100 uploads per day through the API |

**One-time setup:**

- Create a Meta developer app and a Google Cloud project, both owned by a church account, not a volunteer's personal one.
- Add the church admins as roles on the Meta app. Meta only requires App Review when people without a role on the app grant the permissions, so a church using its own app can usually skip it.
- In the Google Cloud project, set the OAuth consent screen's publishing status to **In production** before connecting YouTube. While it is set to Testing, Google's refresh tokens expire after 7 days and posting stops. A church using its own app for one channel can accept Google's "unverified app" warning when connecting, or complete Google's verification.
- In admin, click **Connect** once for each account. The access tokens are stored encrypted on the server and never sent to the browser. If a connection expires or is revoked, the admin screen shows "Reconnect" for that platform.
- Instagram fetches media from a public web address, so social uploads go in a public Supabase Storage folder (or a short-lived signed link).

**Two new tables:** `social_accounts` (platform, account name, encrypted token, expiry, connected\_by) and `social_posts` (caption, media file, platforms, YouTube title and visibility, Instagram type, scheduled\_at, per-platform status, post links, errors, created\_by). Editors, admins and pastors can use them (matching Admin › Users & roles).

Live Sunday streams still start from YouTube Studio or your streaming software; this feature is for uploads such as sermon clips, event flyers and announcements. If the church prefers less setup, a paid posting service with its own API can replace the three direct connections for a monthly fee.

## Database tables

Twenty core Supabase tables hold everything, plus the two social posting tables above; row-level security is switched on for all of them.

| Table | Key columns | Who can read |
| --- | --- | --- |
| `profiles` | id (= auth user), full\_name, phone, role (member, prayer\_team, welcome\_team, editor, treasurer, admin, pastor) | The user themself; admins and pastors |
| `events` | title, slug, starts\_at, ends\_at, location, description, banner\_image, registration\_open, capacity, show\_in\_banner, banner\_order | Public (published only) |
| `event_registrations` | event\_id, user\_id (nullable), name, email, phone, party\_size, notes, status (registered, waiting\_list, cancelled), created\_at | Admins, editors and welcome team |
| `sessions` | type (bible\_study, prayer), starts\_at, topic, zoom\_url, zoom\_passcode, video\_url, notes\_file | Public; Zoom link shown near start time |
| `prayer_requests` | name, email, request, is\_private, wants\_contact, status (new, prayed, followed\_up), created\_at | Private: pastors only. Not private: pastors, admins and prayer team |
| `testimonies` | user\_id (nullable), name, email, member\_or\_visitor, category, title, body, display\_name\_mode, status, featured, reviewed\_by, reviewed\_at, original\_body | Public: approved only; admins: all |
| `offerings` | user\_id (nullable), stripe\_customer\_id, stripe\_session\_id, stripe\_subscription\_id, stripe\_event\_id (unique), amount (smallest currency unit), currency, settled\_usd\_cents, fund, frequency, donor\_name, donor\_email, status, created\_at | Treasurer, admins and pastors; each signed-in giver sees their own |
| `contact_messages` | name, email, message, source (contact page or a Today's Message), todays\_message\_id (nullable), handled, created\_at | Admins |
| `site_settings` | church name and legal details, service times (in New York time), phone, email, social URLs, YouTube channel ID, currencies offered, funds, About page text and statement of faith | Public read (except legal and tax details), admin write |
| `leaders` | name, role, photo, bio, display\_order | Public |
| `visit_plans` | name, email, phone, visit\_date, adults, children, notes, meet\_at\_door, status (expected, welcomed, followed\_up) | Admins and welcome team |
| `reminder_subscriptions` | email, user\_id (nullable), topic (bible\_study, prayer, events, todays\_message, news), confirmed, unsubscribe\_token | Admins; the subscriber through their link |
| `reminder_log` | subscription or registration id, session or event id, kind (day\_before, hour\_before), sent\_at | Admins |
| `sermons` | title, slug, type (sermon, bible\_study), speaker, preached\_on, series, scripture, book, youtube\_video\_id, summary, questions (Bible studies), notes\_file, published | Public (published only) |
| `announcements` | message, link, style (info, urgent), starts\_at, ends\_at | Public (current one only) |
| todays\_messages | title, slug, preached\_on, scripture, summary, body, highlight\_verse, sermon\_id, published\_at | Public (published only) |
| study\_posts | study\_id (a `sermons` row of type bible\_study), user\_id (nullable), display\_name, body, is\_teacher, status (published, flagged, hidden), hidden\_by, created\_at | Public: published only; admins: all |
| consent\_log | anon\_id, chat, media, analytics, banner\_version, created\_at | Admins |
| live\_status | is\_live, youtube\_video\_id, started\_at, set\_by (automatic or an admin) | Public read, server write |

Writes to these tables come only from server actions that have already passed Turnstile, using a server-side Supabase key that is never sent to the browser.

## Roles and permissions

Seven roles keep sensitive things (private prayer requests, giving records) with the fewest people. They match Admin › Users & roles (`admin-users.html`). Each person has one role.

| Role | Can do |
| --- | --- |
| Visitor (no account) | Browse, register for events, send prayer requests, submit testimonies, give Offerings, chat |
| Member | Everything a visitor can, with details pre-filled; see own registrations, testimonies, reminders and giving history |
| Prayer team | Read and update prayer requests that are not private |
| Welcome team | See planned visits and event registrations; mark visits welcomed or followed up |
| Editor | Sermons and Bible studies, Today's Message, events and banners, announcement bar, About page content, testimonies review, Bible study chat, post to social |
| Treasurer | Offerings reports, giver names and year-end statements |
| Admin | Everything above, plus users and roles, settings, gatherings and Zoom links, live stream, reminders. Not private prayer requests |
| Pastor | Everything an admin can do, plus private prayer requests |

Pastors, admins, editors and the treasurer must use two-step sign-in (an authenticator app, through Supabase Auth MFA) on top of password and Turnstile. Keep at least two people with the Admin or Pastor role so the church is never locked out.

## Build phases

Build in the 12 phases in `.claude/skills/church-site/phases.md` (0 plan check, 1 foundation, 2 design system and layout, 3 public pages, 4 public forms, 5 accounts, 6 admin area, 7 moderation, 8 reminders, 9 Offerings, 10 live stream and social posting, 11 launch), using the prompts in `PROMPTS.md`. Test as described in `docs/TESTING.md`.

The site launches after phase 11. If the church needs it sooner, a soft launch is possible after phase 7, with Offerings and social posting switched off until phases 9 and 10 pass.

### Launch checklist

- [ ] Every form rejects a submission with a missing or fake Turnstile token (tested on the server, not just in the browser)
- [ ] Sign-in, sign-up and password reset fail without Turnstile
- [ ] A pending testimony cannot be seen by a logged-out visitor, even by direct URL
- [ ] Private prayer requests are visible to pastors only
- [ ] Stripe test gifts (one-time and monthly) appear in admin; webhook signature checked
- [ ] Stripe switched to live keys; receipt branding says "Offering"
- [ ] Pages pass a phone check and keyboard-only navigation
- [ ] Privacy policy published (forms, chat, Stripe, social embeds)
- [ ] At least two people with the Admin or Pastor role, and two-step sign-in on for every pastor, admin, editor and treasurer
- [ ] Database backups in place (Supabase's paid Pro plan includes daily backups; on the free plan, schedule an export)
- [ ] Reminders arrive once (not twice) at the right time, and the unsubscribe link works
- [ ] Announcement bar appears and disappears on its start and end times
- [ ] A first visit shows the cookie banner, and Reject all leaves no Google Analytics, Tawk.to, YouTube or Facebook cookies (checked in the browser's storage panel)
- [ ] Google Tag Assistant shows consent as denied before a choice and updated after it
- [ ] Contact us opens the Tawk.to chat after live chat is allowed, and offers email and phone when it is not
- [ ] One upload posts to YouTube, Facebook and Instagram as private or test posts with the caption on each; Retry and Reconnect work; test posts deleted
- [ ] The Google OAuth consent screen is "In production"
- [ ] The live player appears on its own during a real or private test stream
- [ ] Times show correctly from a phone set to Lagos time
- [ ] The weekly MaxMind refresh has run once
- [ ] Error and uptime alerts reach two people
- [ ] Every item in `docs/TESTING.md` passes, and the church has signed off its acceptance testing

## Details still needed from the church

Everything the church still has to provide or decide is in `docs/CLIENT-DETAILS.md`. Anything missing stays a clearly marked [placeholder] and is listed at the end of each phase.

## Sources

- [Instagram Platform: Content Publishing](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing) (Meta for Developers)
- [Pages API: Get Started](https://developers.facebook.com/docs/pages-api/getting-started) (Meta for Developers)
- [YouTube Data API: Videos: insert](https://developers.google.com/youtube/v3/docs/videos/insert) (Google for Developers)
- [Usage & Pricing for Cron Jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing) (Vercel)
- [YouTube Data API: Search: list](https://developers.google.com/youtube/v3/docs/search/list) (Google for Developers)
- [Supported currencies](https://docs.stripe.com/currencies) (Stripe Docs)
- [GeoLite Databases and Web Services](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/) (MaxMind)
- [Set up consent mode on websites](https://developers.google.com/tag-platform/security/guides/consent) (Google for Developers)
- [Help with the EU user consent policy](https://www.google.com/intl/en_uk/about/company/user-consent-policy-help/) (Google)
- [Consent management requirements for serving ads in the EEA, the UK and Switzerland](https://support.google.com/adsense/answer/13554116?hl=en) (Google AdSense Help)
- [JavaScript API](https://developer.tawk.to/jsapi/) (tawk.to)
