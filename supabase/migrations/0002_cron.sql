-- 15-minute scheduler (Phase 8 + 10). Supabase pg_cron calls the site's
-- protected cron routes through pg_net with the shared CRON_SECRET.
-- Set these in the Supabase project first (Dashboard > Settings > Vault or
-- as database settings):
--   app.site_url  — e.g. https://www.example.org  (no trailing slash)
--   app.cron_secret — the same CRON_SECRET as in Vercel
-- Vercel's free Hobby plan only runs scheduled jobs once a day, so pg_cron
-- is the scheduler. On Vercel Pro, vercel.json cron is the alternative.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'church-website-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.site_url') || '/api/cron/reminders',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'church-website-social',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.site_url') || '/api/cron/social',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'church-website-live-check',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.site_url') || '/api/cron/live',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
