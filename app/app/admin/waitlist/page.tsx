import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

/** Admin: waitlist entries + CSV export. Broker/Admin only. */
export default async function AdminWaitlistPage() {
  await requireRole("ADMIN");
  const [entries, total, verified] = await Promise.all([
    db.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { email: true, name: true, role: true, state: true, verified: true, createdAt: true },
    }),
    db.waitlistEntry.count(),
    db.waitlistEntry.count({ where: { verified: true } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold">Waitlist</h1>
        <span className="text-sm text-ink/60">{total} total · {verified} confirmed</span>
        <a href="/api/admin/waitlist" download className="ml-auto rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white">
          Export CSV
        </a>
      </div>
      <section className="flex flex-col gap-2">
        {entries.map((e) => (
          <div key={e.email} className="flex flex-wrap items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
            <b>{e.name || e.email}</b>
            <span className="text-ink/50">{e.name ? e.email : ""}</span>
            <span className="text-ink/50">{e.role}{e.state ? ` · ${e.state}` : ""}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.verified ? "bg-mint-100 text-emerald-800" : "bg-sun-100 text-amber-800"}`}>
              {e.verified ? "confirmed" : "pending"}
            </span>
            <span className="ml-auto text-xs text-ink/40">{e.createdAt.toISOString().slice(0, 10)}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-ink/50">No entries yet.</p>}
      </section>
      <p className="text-xs text-ink/40">
        Export is full-list CSV. <Link href="/admin/users" className="underline">Back to admin</Link>
      </p>
    </main>
  );
}
