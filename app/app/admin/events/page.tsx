import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Admin transparency: full audit trail, filterable by event type.
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("ADMIN", "BROKER");
  const sp = await searchParams;
  const events = await db.auditEvent.findMany({
    where: sp.type ? { type: { contains: sp.type } } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { email: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Audit trail</h1>
      <form method="get" className="flex gap-2">
        <input name="type" placeholder="Filter by type (e.g. nda.signed)" defaultValue={sp.type ?? ""} style={{ maxWidth: 300 }} />
        <button className="rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Filter</button>
      </form>
      <div className="flex flex-col gap-1">
        {events.map((e) => (
          <div key={e.id} className="rounded-lg border border-primary-100 bg-white px-3 py-1.5 font-mono text-xs">
            <b>{e.type}</b> · {e.createdAt.toISOString()} · actor {e.actor?.email ?? "—"} · idea {(e.ideaId ?? "—").slice(0, 8)} · #{e.hash.slice(0, 10)}
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-ink/50">No events.</p>}
      </div>
    </main>
  );
}
