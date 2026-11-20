import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { loadDb } from "@/lib/store";
import { formatMoney } from "@/lib/money";

// Year-end giving statement (plain text) for the signed-in giver.
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const db = loadDb();
  const s = db.settings;
  const year = new Date().getFullYear();
  const gifts = db.offerings.filter((o) => (o.userId === user.id || o.donorEmail === user.email) && new Date(o.createdAt).getFullYear() === year);
  const lines = [
    `Year-end giving statement — ${year}`,
    s.legalName,
    s.address,
    `EIN: ${s.ein}`,
    ``,
    `Giver: ${user.name} (${user.email})`,
    ``,
    ...gifts.map((g) => `${new Date(g.createdAt).toLocaleDateString()} — ${formatMoney(g.amount, g.currency)} — ${g.fund} (${g.frequency.replace("_", " ")})`),
    ``,
    `Total gifts recorded this year: ${gifts.length}`,
    ``,
    `This statement lists gifts recorded by this website. Stripe remains the official ledger.`,
  ];
  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="giving-statement-${year}.txt"` },
  });
}
