// Live-stream check: runs every 5 minutes during service windows and asks
// YouTube whether the channel is live. Without YOUTUBE_API_KEY it reports
// the manual live status and does nothing — it never invents a live stream.
import { NextResponse } from "next/server";
import { loadDb, withDb } from "@/lib/store";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const db = loadDb();
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = db.settings.youtubeChannelId;
  if (!apiKey || channelId.startsWith("[")) {
    return NextResponse.json({ ok: true, checked: false, reason: "YouTube API key or channel ID not set.", isLive: db.liveStatus.isLive });
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&eventType=live&type=video&key=${encodeURIComponent(apiKey)}`,
    );
    const data = (await res.json()) as { items?: { id?: { videoId?: string } }[] };
    const liveId = data.items?.[0]?.id?.videoId ?? null;
    withDb((d) => {
      if (liveId) {
        d.liveStatus = { isLive: true, youtubeVideoId: liveId, startedAt: d.liveStatus.startedAt ?? new Date().toISOString(), setBy: "auto" };
      } else if (d.liveStatus.setBy === "auto") {
        d.liveStatus = { isLive: false, youtubeVideoId: "", startedAt: null, setBy: "auto" };
      }
    });
    return NextResponse.json({ ok: true, checked: true, isLive: !!liveId, videoId: liveId });
  } catch {
    return NextResponse.json({ ok: true, checked: false, reason: "YouTube check failed.", isLive: db.liveStatus.isLive });
  }
}
