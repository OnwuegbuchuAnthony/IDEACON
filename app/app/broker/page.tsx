import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ApproveButton, DealForm } from "./BrokerActions";

export default async function BrokerPage() {
  await requireRole("BROKER", "ADMIN");
  const matches = await db.match.findMany({
    include: {
      idea: { select: { id: true, title: true, niche: true, stage: true, status: true } },
      company: { select: { id: true, name: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Broker console ({matches.length})</h1>
      <p className="text-sm text-ink/60">All company↔creator contact flows through here. No open messaging by design.</p>
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
