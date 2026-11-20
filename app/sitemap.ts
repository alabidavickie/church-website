import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = ["", "/about", "/im-new", "/events", "/sermons", "/bible-study", "/prayer", "/testimonies", "/todays-message", "/watch", "/contact", "/offerings", "/search", "/privacy", "/reminders", "/login", "/signup"];
  return paths.map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() }));
}
