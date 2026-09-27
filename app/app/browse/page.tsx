import Link from "next/link";
import { listTeasers, type TeaserFilters } from "@/lib/ideas";
import type { Niche } from "@prisma/client";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: TeaserFilters = {
    ...(sp.niche ? { niche: sp.niche as Niche } : {}),
    ...(sp.stage ? { stage: sp.stage } : {}),
    ...(sp.problemType ? { problemType: sp.problemType } : {}),
    ...(sp.q ? { q: sp.q } : {}),
  };
  const ideas = await listTeasers(filters);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Discover ideas</h1>
      <form className="flex flex-wrap gap-2" method="get">
        <input name="q" placeholder="Search teasers…" defaultValue={sp.q ?? ""} style={{ maxWidth: 220 }} />
        <select name="niche" defaultValue={sp.niche ?? ""} style={{ maxWidth: 170 }}>
          <option value="">All niches</option>
          {["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select name="stage" defaultValue={sp.stage ?? ""} style={{ maxWidth: 170 }}>
          <option value="">Any stage</option>
          {["concept", "prototype", "ready-to-scale"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">
          Filter
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {ideas.map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`}
            className="rounded-2xl border border-primary-100 bg-white p-5 shadow hover:shadow-lg">
            <div className="flex flex-wrap gap-1 text-[11px] font-bold">
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-800">{idea.niche}</span>
              <span className="rounded-full bg-coral-100 px-2 py-0.5 text-coral-500">{idea.stage}</span>
              {idea.aiScores[0] && (
                <span className="rounded-full bg-mint-100 px-2 py-0.5 text-emerald-800">
                  {Math.round(((idea.aiScores[0].originality + idea.aiScores[0].feasibility + idea.aiScores[0].marketFit) / 3) * 10) / 10} fit
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display font-bold">{idea.title}</h2>
            <p className="mt-1 text-sm text-ink/70">{idea.teaser}</p>
            <p className="mt-2 text-xs text-ink/50">🔒 Full detail under NDA</p>
          </Link>
        ))}
      </div>
      {ideas.length === 0 && <p className="text-ink/60">No approved teasers match. Try widening filters.</p>}
    </main>
  );
}
