import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function csvCell(v: string | null): string {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** GET /api/admin/waitlist — full-list CSV export. ADMIN only. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const role = (session?.user as unknown as { role?: string } | undefined)?.role ?? "CREATOR";
  if (!session || role !== "ADMIN") {
    return new Response("forbidden", { status: 403 });
  }
  const rows = await db.waitlistEntry.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      email: true, name: true, role: true, state: true, university: true,
      department: true, niche: true, verified: true, verifiedAt: true,
      invited: true, createdAt: true,
    },
  });
  const header = "email,name,role,state,university,department,niche,verified,verifiedAt,invited,createdAt";
  const lines = rows.map((r) =>
    [
      csvCell(r.email), csvCell(r.name), csvCell(r.role), csvCell(r.state),
      csvCell(r.university), csvCell(r.department), csvCell(r.niche),
      r.verified ? "yes" : "no",
      csvCell(r.verifiedAt?.toISOString() ?? null),
      r.invited ? "yes" : "no",
      csvCell(r.createdAt.toISOString()),
    ].join(","),
  );
  return new Response([header, ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=ideacon-waitlist.csv",
    },
  });
}
