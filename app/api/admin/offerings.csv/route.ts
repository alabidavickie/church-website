import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { loadDb } from "@/lib/store";
import { formatMoney } from "@/lib/money";

// Treasurer CSV export (Admin › Offerings). Staff roles only.
export async function GET() {
  const user = await currentUser();
  if (!user || !["pastor", "admin", "treasurer"].includes(user.role)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const db = loadDb();
  const rows = [["date", "donor", "email", "fund", "frequency", "amount", "currency", "status"]];
  for (const o of db.offerings) {
    rows.push([o.createdAt, o.donorName, o.donorEmail, o.fund, o.frequency, String(o.amount), o.currency, o.status]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=offerings.csv" },
  });
}
