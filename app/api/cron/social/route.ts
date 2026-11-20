// Social scheduler: posts due scheduled social posts (15-minute sender).
// Each platform is sent once per post; results are recorded per platform.
import { NextResponse } from "next/server";
import { loadDb, withDb } from "@/lib/store";
import { publishToPlatform, type Platform } from "@/lib/social";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const now = new Date();
  const due = loadDb().socialPosts.filter((p) => p.status === "scheduled" && p.scheduledAt && new Date(p.scheduledAt) <= now);
  let processed = 0;
  for (const post of due) {
    const results = await Promise.all(
      post.platforms.map((p) => publishToPlatform(p as Platform, { caption: post.caption, youtubeTitle: post.youtubeTitle, instagramType: post.instagramType })),
    );
    withDb((db) => {
      const row = db.socialPosts.find((x) => x.id === post.id);
      if (!row) return;
      row.results = results;
      row.status = results.every((r) => r.status === "posted") ? "posted" : "preview";
    });
    processed++;
  }
  return NextResponse.json({ ok: true, processed });
}
