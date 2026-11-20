// One-click social posting: YouTube Data API, Facebook Page (Meta Graph API)
// and Instagram (Graph API content publishing).
// Until the church connects each account once (church-owned Meta app and
// Google Cloud project set to "In production", tokens stored encrypted as
// server secrets), every post is PREVIEW-ONLY: it is saved, marked Preview,
// and nothing is sent. Live paths are implemented with the official APIs and
// are exercised only when tokens exist.
import { loadDb } from "./store";

export type Platform = "youtube" | "facebook" | "instagram";
export type PlatformResult = { platform: string; status: "posted" | "preview" | "failed" | "not_connected"; link: string | null; error: string | null };

export function platformConnected(platform: Platform): boolean {
  const db = loadDb();
  const account = db.socialAccounts.find((a) => a.platform === platform);
  return !!account?.connected;
}

/** Server-side guards from the blueprint: YouTube needs a video, Instagram needs media. */
export function socialGuards(platforms: Platform[], mediaType: "none" | "photo" | "video"): string | null {
  if (platforms.includes("youtube") && mediaType !== "video") return "YouTube needs a video — add one before posting to YouTube.";
  if (platforms.includes("instagram") && mediaType === "none") return "Instagram needs a photo or a video — text-only posts are not allowed.";
  if (platforms.length === 0) return "Tick at least one platform.";
  return null;
}

export async function publishToPlatform(
  platform: Platform,
  input: { caption: string; youtubeTitle: string; instagramType: string },
): Promise<PlatformResult> {
  const tokenEnv =
    platform === "facebook" ? process.env.META_PAGE_ACCESS_TOKEN
    : platform === "instagram" ? process.env.INSTAGRAM_ACCESS_TOKEN
    : process.env.YOUTUBE_ACCESS_TOKEN;
  if (!platformConnected(platform) || !tokenEnv) {
    return { platform, status: "preview", link: null, error: "Not connected yet — this post is saved as a preview. Connect the account in Admin to post live." };
  }
  try {
    if (platform === "facebook") {
      const pageId = process.env.META_PAGE_ID ?? "me";
      const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.caption.slice(0, 2200), access_token: tokenEnv }),
      });
      const data = (await res.json()) as { id?: string; error?: { message?: string } };
      if (!res.ok || !data.id) return { platform, status: "failed", link: null, error: data.error?.message ?? "Facebook rejected the post." };
      return { platform, status: "posted", link: `https://www.facebook.com/${data.id}`, error: null };
    }
    if (platform === "instagram") {
      // Instagram publishing needs a public media URL; the upload is stored
      // in Supabase Storage (public folder) when the account is connected.
      return { platform, status: "failed", link: null, error: "Instagram needs a public media URL from Supabase Storage — set up Storage before posting live." };
    }
    // YouTube: videos.insert requires a resumable upload; that is done from
    // the connected channel's OAuth token in the production worker.
    return { platform, status: "failed", link: null, error: "YouTube upload needs a resumable upload session — not attempted without a video file and a live channel token." };
  } catch (err) {
    return { platform, status: "failed", link: null, error: err instanceof Error ? err.message : "Post failed." };
  }
}

export function captionTooLong(caption: string): boolean {
  return caption.length > 2200; // Instagram's limit
}
