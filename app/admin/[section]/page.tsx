import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { SECTIONS } from "@/app/admin/layout";
import {
  VisitorsSection, PrayerSection, ReviewSection, ChatSection, RegistrationsSection,
  GatheringsSection, LiveSection, AnnouncementSection, RemindersSection,
  EventsSection, SermonsSection, MessageSection, SocialSection, OfferingsSection,
  UsersSection, SettingsSection, LaunchSection, TwoFactorSection,
} from "@/components/AdminSections";

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const user = await currentUser();
  if (!user) redirect("/login");
  const meta = SECTIONS.find((s) => s.slug === section);
  if (!meta) notFound();
  if (!meta.roles.includes(user.role)) {
    return (
      <div>
        <h1 className="display" style={{ fontSize: 36 }}>Not allowed</h1>
        <p>Your role ({user.role}) cannot open {meta.label}. Ask a pastor or admin if you need access.</p>
      </div>
    );
  }
  switch (section) {
    case "visitors": return <VisitorsSection />;
    case "prayer": return <PrayerSection user={user} />;
    case "review": return <ReviewSection />;
    case "chat": return <ChatSection />;
    case "registrations": return <RegistrationsSection />;
    case "gatherings": return <GatheringsSection />;
    case "live": return <LiveSection />;
    case "announcement": return <AnnouncementSection />;
    case "reminders": return <RemindersSection />;
    case "events": return <EventsSection />;
    case "sermons": return <SermonsSection />;
    case "message": return <MessageSection />;
    case "social": return <SocialSection />;
    case "offerings": return <OfferingsSection />;
    case "users": return <UsersSection user={user} />;
    case "settings": return <SettingsSection />;
    case "launch": return <LaunchSection />;
    case "two-factor": return <TwoFactorSection user={user} />;
    default: notFound();
  }
}
