// Site settings and sample content. Every church fact the client has not
// supplied yet stays a clearly marked [placeholder] — never invent one.
// Church address and time zone are from the repo (docs/BLUEPRINT.md).
export const CHURCH_ADDRESS = "6400B Frederick Road, Catonsville, MD 21228";
export const CHURCH_TIMEZONE = "America/New_York";

export type SiteSettings = {
  churchName: string;
  shortName: string;
  phone: string;
  email: string;
  officeHours: string;
  address: string;
  sundayTime: string; // New York time, e.g. "10:30 am"
  fridayPrayerTime: string; // New York time, e.g. "7:00 pm"
  bibleStudyDay: string;
  bibleStudyTime: string;
  youtubeChannelId: string;
  youtubeChannelUrl: string;
  facebookPageUrl: string;
  instagramUrl: string;
  zoomBibleStudy: string;
  zoomPrayer: string;
  stripePaymentUrl: string;
  tawktoId: string;
  funds: string[];
  currencies: string[];
  aboutStory: string;
  statementOfFaith: string;
  legalName: string;
  ein: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  churchName: "[Church Name]",
  shortName: "[Church Name]",
  phone: "[phone]",
  email: "[email]",
  officeHours: "[office hours]",
  address: CHURCH_ADDRESS,
  sundayTime: "10:30 am",
  fridayPrayerTime: "7:00 pm",
  bibleStudyDay: "Wednesday",
  bibleStudyTime: "7:00 pm",
  youtubeChannelId: "[YouTube channel ID]",
  youtubeChannelUrl: "[YouTube channel link]",
  facebookPageUrl: "[Facebook Page link]",
  instagramUrl: "[Instagram link]",
  zoomBibleStudy: "[Zoom link for Bible study]",
  zoomPrayer: "[Zoom link for prayer]",
  stripePaymentUrl: "[Stripe payment page link]",
  tawktoId: "[Tawk.to ID]",
  funds: ["Offering", "Tithe", "Thanksgiving", "Building Fund", "Missions"],
  currencies: ["USD", "GBP", "EUR", "NGN", "GHS", "KES", "CAD"],
  aboutStory: "[Our story — the church has not supplied this yet.]",
  statementOfFaith: "[Statement of faith — the church has not supplied this yet.]",
  legalName: "[Legal name]",
  ein: "[EIN]",
};

export const PLACEHOLDERS: string[] = [
  "Church name and logo",
  "Phone, main email and office hours",
  "Pastor name, photo and short welcome/bio",
  "Leaders and photos",
  "Our story and statement of faith",
  "Confirm Sunday 10:30 am and Friday 7:00 pm (New York time)",
  "Zoom links for Bible study and prayer",
  "YouTube channel link and channel ID",
  "Facebook Page link and Instagram account",
  "Stripe payment page link, funds and currencies",
  "Tawk.to ID",
  "Domain name and who can change its DNS",
  "People for each of the seven roles",
  "Acceptance testers",
];

export type Sermon = {
  id: string;
  slug: string;
  title: string;
  type: "sermon" | "bible_study";
  speaker: string;
  series: string;
  scripture: string;
  book: string;
  preachedOn: string; // ISO date
  youtubeVideoId: string;
  summary: string;
  questions: string[];
  published: boolean;
};

export type ChurchEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: string; // ISO, New York time
  endsAt: string;
  location: string;
  description: string;
  capacity: number;
  registrationOpen: boolean;
  showInBanner: boolean;
};

export type TestimonySeed = {
  id: string;
  name: string;
  display: "full" | "first" | "anonymous";
  category: string;
  title: string;
  body: string;
  featured: boolean;
};

export const SEED_SERMONS: Sermon[] = [
  {
    id: "s1", slug: "the-god-who-sees", title: "The God Who Sees", type: "sermon",
    speaker: "[Pastor]", series: "Genesis", scripture: "Genesis 16:13", book: "Genesis",
    preachedOn: "2026-11-15", youtubeVideoId: "[YouTube video ID]",
    summary: "Hagar names God El Roi, the God who sees — and the same God sees us in our hardest week.",
    questions: ["Where have you felt unseen this week?", "What would change if you believed God sees you there?"],
    published: true,
  },
  {
    id: "s2", slug: "bread-enough-for-today", title: "Bread Enough for Today", type: "sermon",
    speaker: "[Pastor]", series: "Exodus", scripture: "Exodus 16:18", book: "Exodus",
    preachedOn: "2026-11-08", youtubeVideoId: "[YouTube video ID]",
    summary: "Manna came one day at a time. God gives enough for today, and tomorrow's bread comes tomorrow.",
    questions: ["What are you trying to store up that God is asking you to trust him for daily?"],
    published: true,
  },
  {
    id: "s3", slug: "come-and-see", title: "Come and See", type: "sermon",
    speaker: "[Pastor]", series: "John", scripture: "John 1:39", book: "John",
    preachedOn: "2026-11-01", youtubeVideoId: "[YouTube video ID]",
    summary: "Jesus' first invitation was simple: come and see. It still is.",
    questions: ["Who could you invite to come and see?"],
    published: true,
  },
  {
    id: "s4", slug: "study-psalm-23", title: "Psalm 23: The Lord Is My Shepherd", type: "bible_study",
    speaker: "[Teacher]", series: "Psalms", scripture: "Psalm 23", book: "Psalms",
    preachedOn: "2026-11-11", youtubeVideoId: "[YouTube video ID]",
    summary: "This week's study walks slowly through Psalm 23, one picture at a time.",
    questions: ["Which picture in Psalm 23 do you need most this week?", "What does 'I shall not want' mean when something is missing?"],
    published: true,
  },
  {
    id: "s5", slug: "study-romans-8", title: "Romans 8: No Condemnation", type: "bible_study",
    speaker: "[Teacher]", series: "Romans", scripture: "Romans 8:1", book: "Romans",
    preachedOn: "2026-11-04", youtubeVideoId: "[YouTube video ID]",
    summary: "There is no condemnation for those in Christ Jesus — what that promise holds on a bad day.",
    questions: ["What accusation do you keep hearing, and what does Romans 8 say back?"],
    published: true,
  },
];

export const SEED_EVENTS: ChurchEvent[] = [
  {
    id: "e1", slug: "thanksgiving-lunch", title: "Thanksgiving Lunch", startsAt: "2026-11-26T12:00:00-05:00",
    endsAt: "2026-11-26T14:00:00-05:00", location: CHURCH_ADDRESS,
    description: "A shared lunch after the Thanksgiving service. Bring a dish if you can; come as you are either way.",
    capacity: 120, registrationOpen: true, showInBanner: true,
  },
  {
    id: "e2", slug: "christmas-carol-service", title: "Christmas Carol Service", startsAt: "2026-12-20T17:00:00-05:00",
    endsAt: "2026-12-20T18:30:00-05:00", location: CHURCH_ADDRESS,
    description: "Carols, readings and candles as we celebrate the birth of Jesus.",
    capacity: 200, registrationOpen: true, showInBanner: true,
  },
  {
    id: "e3", slug: "new-members-class", title: "New Members Class", startsAt: "2026-12-06T13:00:00-05:00",
    endsAt: "2026-12-06T14:30:00-05:00", location: CHURCH_ADDRESS,
    description: "What we believe, how the church works, and how to get involved.",
    capacity: 40, registrationOpen: true, showInBanner: false,
  },
  {
    id: "e4", slug: "food-drive", title: "Community Food Drive", startsAt: "2026-12-12T09:00:00-05:00",
    endsAt: "2026-12-12T12:00:00-05:00", location: CHURCH_ADDRESS,
    description: "Collecting non-perishable food for neighbours in Catonsville.",
    capacity: 0, registrationOpen: true, showInBanner: false,
  },
  {
    id: "e5", slug: "prayer-night", title: "Prayer Night", startsAt: "2026-12-04T19:00:00-05:00",
    endsAt: "2026-12-04T20:30:00-05:00", location: CHURCH_ADDRESS,
    description: "An evening of prayer for the church, the city and each other.",
    capacity: 0, registrationOpen: false, showInBanner: false,
  },
  {
    id: "e6", slug: "youth-game-night", title: "Youth Game Night", startsAt: "2026-12-18T18:00:00-05:00",
    endsAt: "2026-12-18T20:00:00-05:00", location: CHURCH_ADDRESS,
    description: "Games, snacks and time together for young people.",
    capacity: 60, registrationOpen: true, showInBanner: false,
  },
];

export const SEED_TESTIMONIES: TestimonySeed[] = [
  { id: "t1", name: "Grace", display: "first", category: "Healing", title: "Healed after prayer", body: "After months of pain, the church prayed with me on a Friday night. The next week my doctor could not explain the change.", featured: true },
  { id: "t2", name: "Daniel", display: "first", category: "Salvation", title: "I came to visit and stayed", body: "I planned one visit. I heard the gospel clearly for the first time and gave my life to Jesus that Sunday.", featured: true },
  { id: "t3", name: "Mary", display: "first", category: "Provision", title: "Rent was covered", body: "We did not know how the rent would be paid. A gift arrived the same week, exactly the amount we needed.", featured: true },
  { id: "t4", name: "Samuel", display: "first", category: "Deliverance", title: "Free at last", body: "Years of struggle ended when brothers in the church walked with me week after week.", featured: false },
  { id: "t5", name: "Esther", display: "first", category: "Answered prayer", title: "A job after a year", body: "After a year without work, an interview came the week the prayer team prayed for me.", featured: false },
  { id: "t6", name: "John", display: "first", category: "Healing", title: "My father's recovery", body: "My father was in hospital and we prayed. He came home sooner than anyone expected.", featured: false },
  { id: "t7", name: "Ruth", display: "first", category: "Provision", title: "Groceries on the doorstep", body: "Someone left groceries at our door the week money ran out. We still do not know who.", featured: false },
  { id: "t8", name: "Paul", display: "first", category: "Answered prayer", title: "Reconciled with my brother", body: "After ten years apart, my brother and I spoke again. Prayer softened both our hearts.", featured: false },
];

export const SEED_MESSAGE = {
  title: "The God Who Sees",
  scripture: "Genesis 16:13",
  summary:
    "Hagar, alone in the desert, names God El Roi — the God who sees. This week, the same God sees you in the place you think nobody notices.",
  body: [
    "Hagar had been sent away, and she had run out of water, hope and options. It was there, not in a temple, that God met her.",
    "She gave God a name from her own experience: El Roi, the God who sees me. God's seeing is not distant watching — it is care that moves towards us.",
    "This week, bring the place where you feel unseen to the God who sees. He has not missed it, and he has not missed you.",
  ],
  verse: "She gave this name to the LORD who spoke to her: 'You are the God who sees me.' — Genesis 16:13 (KJV)",
  steps: ["Read Genesis 16 slowly this week.", "Tell one person where you need to be seen.", "Join us for prayer on Friday."],
};
