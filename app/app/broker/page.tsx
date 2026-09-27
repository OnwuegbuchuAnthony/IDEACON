import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { suggestMatches } from "@/lib/matching";
import { ApproveButton, DealForm } from "./BrokerActions";

export default async function BrokerPage() {
  await requireRole("BROKER", "ADMIN");
  const matches = await db.match.findMany({
    include: {
      idea: { select: { id: true, title: true, niche: true, stage: true, status: true } },
      company: { select: { id: true, name: true, state: true, niche: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Phase 2: AI-ranked suggestions per requesting company (teasers only).
  const seen = new Map<string, { name: string; state: string | null }>();
  for (const m of matches) {
    if (!seen.has(m.company.id)) seen.set(m.company.id, { name: m.company.name, state: m.company.state });
  }
  const requestedByCompany = new Map<string, Set<string>>();
  for (const m of matches) {
    if (!requestedByCompany.has(m.company.id)) requestedByCompany.set(m.company.id, new Set());
    requestedByCompany.get(m.company.id)!.add(m.idea.id);
  }
  const suggestions: { companyId: string; companyName: string; items: Awaited<ReturnType<typeof suggestMatches>> }[] = [];
  for (const [companyId, info] of [...seen.entries()].slice(0, 3)) {
    const ranked = await suggestMatches({ companyId, limit: 8 });
    const fresh = ranked.filter((r) => !requestedByCompany.get(companyId)?.has(r.ideaId)).slice(0, 3);
    if (fresh.length > 0) suggestions.push({ companyId, companyName: info.name, items: fresh });
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Broker console ({matches.length})</h1>
      <p className="text-sm text-ink/60">All company↔creator contact flows through here. No open messaging by design.</p>

      {suggestions.length > 0 && (
        <section className="rounded-2xl border-2 border-teal-500 bg-teal-100/40 p-5">
          <h2 className="font-display text-lg font-bold">✨ Suggested matches (role-aware ranking)</h2>
          {suggestions.map((s) => (
            <div key={s.companyId} className="mt-3">
              <p className="text-sm font-bold">For {s.companyName}:</p>
              <ul className="mt-1 flex flex-col gap-1">
                {s.items.map((it) => (
                  <li key={it.ideaId} className="text-sm">
                    <Link href={`/ideas/${it.ideaId}`} className="font-bold underline">{it.title}</Link>{" "}
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary-800">{it.fit} fit</span>{" "}
                    <span className="text-xs text-ink/60">{it.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {matches.map((m) => (
        <article key={m.id} className="rounded-2xl border border-primary-100 bg-white p-5 shadow">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href={`/ideas/${m.idea.id}`} className="font-display font-bold underline">{m.idea.title}</Link>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 font-bold text-primary-800">{m.idea.niche}</span>
            <span className="text-ink/60">← {m.company.name}{m.company.state ? ` (${m.company.state})` : ""}</span>
            <span className="rounded-full bg-sun-100 px-2 py-0.5 font-bold text-amber-800">{m.idea.status}</span>
            <span className="text-ink/50">{m.source}</span>
            <ApproveButton matchId={m.id} />
          </div>
          <div className="mt-2">
            <DealForm ideaId={m.idea.id} companyId={m.company.id} />
          </div>
        </article>
      ))}
      {matches.length === 0 && <p className="text-ink/60">No access requests yet.</p>}
    </main>
  );
}
