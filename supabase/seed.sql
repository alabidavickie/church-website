-- Sample content only (Template B placeholders). Never load real member data
-- into local or staging. Run: supabase db reset (applies migrations + seed).
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.sermons (title, slug, type, speaker, series, scripture, book, preached_on, youtube_video_id, summary, questions, published) values
  ('The God Who Sees', 'the-god-who-sees', 'sermon', '[Pastor]', 'Genesis', 'Genesis 16:13', 'Genesis', '2026-11-15', '[YouTube video ID]', 'Hagar names God El Roi, the God who sees — and the same God sees us in our hardest week.', array['Where have you felt unseen this week?'], true),
  ('Bread Enough for Today', 'bread-enough-for-today', 'sermon', '[Pastor]', 'Exodus', 'Exodus 16:18', 'Exodus', '2026-11-08', '[YouTube video ID]', 'Manna came one day at a time. God gives enough for today.', array['What are you trying to store up?'], true),
  ('Psalm 23: The Lord Is My Shepherd', 'study-psalm-23', 'bible_study', '[Teacher]', 'Psalms', 'Psalm 23', 'Psalms', '2026-11-11', '[YouTube video ID]', 'This week''s study walks slowly through Psalm 23, one picture at a time.', array['Which picture in Psalm 23 do you need most this week?'], true);

insert into public.events (title, slug, starts_at, ends_at, location, description, capacity, registration_open, show_in_banner) values
  ('Thanksgiving Lunch', 'thanksgiving-lunch', '2026-11-26 12:00:00-05', '2026-11-26 14:00:00-05', '6400B Frederick Road, Catonsville, MD 21228', 'A shared lunch after the Thanksgiving service.', 120, true, true),
  ('Christmas Carol Service', 'christmas-carol-service', '2026-12-20 17:00:00-05', '2026-12-20 18:30:00-05', '6400B Frederick Road, Catonsville, MD 21228', 'Carols, readings and candles as we celebrate the birth of Jesus.', 200, true, true);

insert into public.testimonies (name, email, category, title, body, original_body, display_name_mode, status, featured) values
  ('Grace', '', 'Healing', 'Healed after prayer', 'After months of pain, the church prayed with me on a Friday night.', 'After months of pain, the church prayed with me on a Friday night.', 'first', 'approved', true),
  ('Daniel', '', 'Salvation', 'I came to visit and stayed', 'I planned one visit. I heard the gospel clearly for the first time and gave my life to Jesus that Sunday.', 'I planned one visit. I heard the gospel clearly for the first time and gave my life to Jesus that Sunday.', 'first', 'approved', true),
  ('Mary', '', 'Provision', 'Rent was covered', 'We did not know how the rent would be paid. A gift arrived the same week.', 'We did not know how the rent would be paid. A gift arrived the same week.', 'first', 'approved', true);

insert into public.todays_messages (title, slug, preached_on, scripture, summary, body, highlight_verse, published_at) values
  ('The God Who Sees', 'the-god-who-sees', '2026-11-15', 'Genesis 16:13', 'Hagar, alone in the desert, names God El Roi — the God who sees. This week, the same God sees you in the place you think nobody notices.',
   array['Hagar had been sent away, and she had run out of water, hope and options. It was there, not in a temple, that God met her.', 'She gave God a name from her own experience: El Roi, the God who sees me.'],
   'She gave this name to the LORD who spoke to her: ''You are the God who sees me.'' — Genesis 16:13 (KJV)', '2026-11-15 10:30:00-05');
