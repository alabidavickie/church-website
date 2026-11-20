-- Church website schema (Phase 1–11). Row-level security is ON for every
-- table. Apply with: supabase db push
-- Roles live in profiles.role. Private prayer requests are readable by the
-- Pastor role only; the public can read only approved testimonies.
create extension if not exists pgcrypto;

create or replace function public.current_role() returns text
language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'member'
    check (role in ('member','prayer_team','welcome_team','editor','treasurer','admin','pastor'))
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "admins read profiles" on public.profiles for select using (public.current_role() in ('admin','pastor'));
create policy "own profile update" on public.profiles for update using (id = auth.uid());

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  church_name text not null default '[Church Name]',
  phone text not null default '[phone]',
  email text not null default '[email]',
  office_hours text not null default '[office hours]',
  address text not null default '6400B Frederick Road, Catonsville, MD 21228',
  sunday_time text not null default '10:30 am',
  friday_prayer_time text not null default '7:00 pm',
  youtube_channel_id text not null default '[YouTube channel ID]',
  youtube_channel_url text not null default '[YouTube channel link]',
  facebook_page_url text not null default '[Facebook Page link]',
  instagram_url text not null default '[Instagram link]',
  zoom_bible_study text not null default '[Zoom link for Bible study]',
  zoom_prayer text not null default '[Zoom link for prayer]',
  stripe_payment_url text not null default '[Stripe payment page link]',
  tawkto_id text not null default '[Tawk.to ID]',
  funds text[] not null default array['Offering','Tithe','Thanksgiving','Building Fund','Missions'],
  currencies text[] not null default array['USD','GBP','EUR','NGN','GHS','KES','CAD'],
  about_story text not null default '[Our story]',
  statement_of_faith text not null default '[Statement of faith]',
  legal_name text not null default '[Legal name]',
  ein text not null default '[EIN]'
);
alter table public.site_settings enable row level security;
create policy "public settings" on public.site_settings for select using (true);
create policy "admin settings" on public.site_settings for all using (public.current_role() in ('admin','pastor'));

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text not null, photo text not null default '',
  bio text not null default '', display_order int not null default 0
);
alter table public.leaders enable row level security;
create policy "public leaders" on public.leaders for select using (true);
create policy "admin leaders" on public.leaders for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  starts_at timestamptz not null, ends_at timestamptz not null,
  location text not null default '', description text not null default '',
  capacity int not null default 0, registration_open boolean not null default true,
  show_in_banner boolean not null default false, banner_order int not null default 0,
  published boolean not null default true
);
alter table public.events enable row level security;
create policy "public events" on public.events for select using (published = true);
create policy "admin events" on public.events for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null, email text not null, phone text not null default '',
  adults int not null default 1, children int not null default 0, notes text not null default '',
  status text not null default 'registered' check (status in ('registered','waiting_list','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.event_registrations enable row level security;
create policy "team registrations" on public.event_registrations for select using (public.current_role() in ('admin','pastor','editor','welcome_team'));
create policy "own registration" on public.event_registrations for select using (user_id = auth.uid());
create policy "insert registration" on public.event_registrations for insert with check (true);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('bible_study','prayer')),
  starts_at timestamptz not null, topic text not null,
  zoom_url text not null default '', zoom_passcode text not null default '',
  video_url text not null default '', notes_file text not null default ''
);
alter table public.sessions enable row level security;
create policy "public sessions" on public.sessions for select using (true);
create policy "admin sessions" on public.sessions for all using (public.current_role() in ('admin','pastor'));

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null default '', request text not null,
  is_private boolean not null default false, wants_contact boolean not null default false,
  status text not null default 'new' check (status in ('new','prayed','followed_up')),
  note text not null default '', created_at timestamptz not null default now()
);
alter table public.prayer_requests enable row level security;
-- Private requests: pastors only. Others: pastors, admins and prayer team.
create policy "prayer team reads non-private" on public.prayer_requests for select using (
  (is_private = false and public.current_role() in ('pastor','admin','prayer_team'))
  or (is_private = true and public.current_role() = 'pastor')
);
create policy "insert prayer" on public.prayer_requests for insert with check (true);
create policy "prayer team updates" on public.prayer_requests for update using (public.current_role() in ('pastor','admin','prayer_team'));

create table if not exists public.testimonies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null, email text not null, category text not null default 'Other',
  title text not null, body text not null, original_body text not null,
  display_name_mode text not null default 'first' check (display_name_mode in ('full','first','anonymous')),
  status text not null default 'pending' check (status in ('pending','approved','declined','changes_requested')),
  featured boolean not null default false,
  reviewed_by uuid references auth.users (id), reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.testimonies enable row level security;
-- The public can read ONLY approved testimonies — even by direct id.
create policy "public approved testimonies" on public.testimonies for select using (status = 'approved');
create policy "review team testimonies" on public.testimonies for select using (public.current_role() in ('admin','pastor','editor'));
create policy "insert testimony" on public.testimonies for insert with check (true);
create policy "review testimony" on public.testimonies for update using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.offerings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  stripe_customer_id text, stripe_session_id text, stripe_subscription_id text,
  stripe_event_id text unique,
  amount int not null, currency text not null default 'USD',
  settled_usd_cents int, fund text not null default 'Offering',
  frequency text not null default 'one_time' check (frequency in ('one_time','weekly','monthly')),
  donor_name text not null default '', donor_email text not null default '',
  status text not null default 'recorded', created_at timestamptz not null default now()
);
alter table public.offerings enable row level security;
create policy "treasurer offerings" on public.offerings for select using (public.current_role() in ('admin','pastor','treasurer'));
create policy "own offerings" on public.offerings for select using (user_id = auth.uid());

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, message text not null,
  source text not null default 'contact', todays_message_id uuid,
  handled boolean not null default false, created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "admin messages" on public.contact_messages for all using (public.current_role() in ('admin','pastor'));
create policy "insert message" on public.contact_messages for insert with check (true);

create table if not exists public.visit_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text not null default '',
  visit_date date not null, adults int not null default 1, children int not null default 0,
  notes text not null default '', meet_at_door boolean not null default false,
  status text not null default 'expected' check (status in ('expected','welcomed','followed_up')),
  created_at timestamptz not null default now()
);
alter table public.visit_plans enable row level security;
create policy "welcome visits" on public.visit_plans for select using (public.current_role() in ('admin','pastor','welcome_team'));
create policy "insert visit" on public.visit_plans for insert with check (true);
create policy "welcome updates" on public.visit_plans for update using (public.current_role() in ('admin','pastor','welcome_team'));

create table if not exists public.reminder_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null, user_id uuid references auth.users (id) on delete set null,
  topic text not null check (topic in ('bible_study','prayer','events','todays_message','news')),
  confirmed boolean not null default false,
  unsubscribe_token text not null unique, created_at timestamptz not null default now(),
  unique (email, topic)
);
alter table public.reminder_subscriptions enable row level security;
create policy "admin reminder subs" on public.reminder_subscriptions for select using (public.current_role() in ('admin','pastor'));
create policy "insert reminder sub" on public.reminder_subscriptions for insert with check (true);

create table if not exists public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid, kind text not null, target_id uuid,
  sent_at timestamptz not null default now(),
  unique (kind, target_id, subscription_id)
);
alter table public.reminder_log enable row level security;
create policy "admin reminder log" on public.reminder_log for select using (public.current_role() in ('admin','pastor'));

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  type text not null default 'sermon' check (type in ('sermon','bible_study')),
  speaker text not null default '', series text not null default '',
  scripture text not null default '', book text not null default '',
  preached_on date not null, youtube_video_id text not null default '',
  summary text not null default '', questions text[] not null default '{}',
  notes_file text not null default '', published boolean not null default false
);
alter table public.sermons enable row level security;
create policy "public sermons" on public.sermons for select using (published = true);
create policy "admin sermons" on public.sermons for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null, link text not null default '',
  style text not null default 'info' check (style in ('info','urgent')),
  starts_at timestamptz not null, ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "public announcements" on public.announcements for select using (true);
create policy "admin announcements" on public.announcements for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.todays_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  preached_on date not null, scripture text not null default '',
  summary text not null default '', body text[] not null default '{}',
  highlight_verse text not null default '', sermon_id uuid references public.sermons (id),
  published_at timestamptz not null default now()
);
alter table public.todays_messages enable row level security;
create policy "public messages" on public.todays_messages for select using (true);
create policy "admin messages" on public.todays_messages for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.study_posts (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.sermons (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null, body text not null, is_teacher boolean not null default false,
  status text not null default 'published' check (status in ('published','flagged','hidden')),
  hidden_by uuid references auth.users (id), created_at timestamptz not null default now()
);
alter table public.study_posts enable row level security;
create policy "public study posts" on public.study_posts for select using (status = 'published');
create policy "admin study posts" on public.study_posts for select using (public.current_role() in ('admin','pastor','editor'));
create policy "insert study post" on public.study_posts for insert with check (true);
create policy "moderate study post" on public.study_posts for update using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.consent_log (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null, chat boolean not null default false,
  media boolean not null default false, analytics boolean not null default false,
  banner_version int not null default 1, created_at timestamptz not null default now()
);
alter table public.consent_log enable row level security;
create policy "insert consent" on public.consent_log for insert with check (true);
create policy "admin consent" on public.consent_log for select using (public.current_role() in ('admin','pastor'));

create table if not exists public.live_status (
  id int primary key default 1 check (id = 1),
  is_live boolean not null default false,
  youtube_video_id text not null default '',
  started_at timestamptz, set_by text not null default 'manual'
);
alter table public.live_status enable row level security;
create policy "public live" on public.live_status for select using (true);
create policy "admin live" on public.live_status for all using (public.current_role() in ('admin','pastor'));

create table if not exists public.social_accounts (
  platform text primary key check (platform in ('youtube','facebook','instagram')),
  account_name text not null default '',
  encrypted_token text, token_expires_at timestamptz,
  connected_by uuid references auth.users (id)
);
alter table public.social_accounts enable row level security;
create policy "admin social accounts" on public.social_accounts for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  caption text not null, media_file text not null default '',
  platforms text[] not null default '{}',
  youtube_title text not null default '', youtube_visibility text not null default 'public',
  instagram_type text not null default 'post', scheduled_at timestamptz,
  status text not null default 'preview',
  created_by uuid references auth.users (id), created_at timestamptz not null default now()
);
create table if not exists public.social_post_results (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts (id) on delete cascade,
  platform text not null, status text not null default 'preview',
  post_link text, error text, unique (post_id, platform)
);
alter table public.social_posts enable row level security;
alter table public.social_post_results enable row level security;
create policy "admin social posts" on public.social_posts for all using (public.current_role() in ('admin','pastor','editor'));
create policy "admin social results" on public.social_post_results for all using (public.current_role() in ('admin','pastor','editor'));

create table if not exists public.launch_checks (
  key text primary key, done boolean not null default false, done_at timestamptz
);
alter table public.launch_checks enable row level security;
create policy "admin launch" on public.launch_checks for all using (public.current_role() in ('admin','pastor'));
