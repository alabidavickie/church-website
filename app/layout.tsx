import type { Metadata } from "next";
import { League_Spartan, Figtree, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { loadDb } from "@/lib/store";

const spartan = League_Spartan({ subsets: ["latin"], weight: "700", variable: "--font-spartan" });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-figtree" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm" });

export const metadata: Metadata = {
  title: "[Church Name] — a church on Frederick Road, Catonsville",
  description: "Sunday service, Bible study, prayer, sermons and events at 6400B Frederick Road, Catonsville, MD 21228.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const db = loadDb();
  const s = db.settings;
  const now = new Date();
  const announcement = db.announcements.find(
    (a) => a.active && new Date(a.startsAt) <= now && new Date(a.endsAt) >= now,
  ) ?? null;
  return (
    <html lang="en" className={`${spartan.variable} ${figtree.variable} ${dmSans.variable}`}>
      <body>
        <SiteChrome
          churchName={s.churchName}
          address={s.address}
          email={s.email}
          phone={s.phone}
          announcement={announcement ? { message: announcement.message, link: announcement.link } : null}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
