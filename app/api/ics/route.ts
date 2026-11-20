import { NextResponse } from "next/server";
import { icsFor } from "@/lib/time";
import { loadDb } from "@/lib/store";

// GET /api/ics?title=...&start=ISO[&end=ISO] — add-to-calendar download.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "Church gathering";
  const start = url.searchParams.get("start") ?? new Date().toISOString();
  const end = url.searchParams.get("end") ?? new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
  const location = loadDb().settings.address;
  const ics = icsFor(title, start, end, location);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="gathering.ics"`,
    },
  });
}
