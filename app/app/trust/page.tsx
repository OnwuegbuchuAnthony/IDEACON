import Link from "next/link";
import { db } from "@/lib/db";
import { logoUrl } from "@/lib/media";
import { GoldBadge } from "@/app/components/Badges";

// Always server-rendered: needs live DB (no build-time prerender on Netlify).
export const dynamic = "force-dynamic";

// Public trust page: case studies, platform stats, partner logos.
export default async function TrustPage() {
  const [ideas, ndas, deals, studies, companies] = await Promise.all([
    db.idea.count({ where: { status: { in: ["APPROVED", "MATCHED", "UNDER_NDA", "DEAL"] } } }),
    db.ndaGrant.count(),
    db.deal.count(),
    db.caseStudy.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.companyProfile.findMany({ where: { verified: true }, select: { name: true, niche: true, state: true, logoKey: true }, take: 20 }),
  ]);
  const logos = new Map<string, string | null>();
  for (const c of companies) logos.set(c.name, await logoUrl(c.logoKey));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Proof, not promises</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {[[String(ideas), "vetted ideas live"], [String(ndas), "NDAs signed"], [String(deals), "brokered deals"]].map(([n, l]) => (
          <div key={l} className="rounded-2xl border border-primary-100 bg-white p-6 text-center shadow">
            <p className="font-display text-4xl font-extrabold text-primary-600">{n}</p>
            <p className="text-sm text-ink/60">{l}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-display text-xl font-bold">Success stories</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {studies.map((s) => (
            <article key={s.id} className="rounded-2xl border border-mint-500 bg-white p-5 shadow">
              <h3 className="font-display font-bold">{s.title}</h3>
              {s.company && <p className="text-xs font-bold text-primary-600">{s.company}</p>}
              <p className="mt-1 text-sm text-ink/70">{s.body}</p>
            </article>
          ))}
          {studies.length === 0 && <p className="text-sm text-ink/50">First case studies publish after the pilot matches close.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Verified partners</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {companies.map((c) => (
            <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm font-bold text-primary-800">
              {logos.get(c.name) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logos.get(c.name)!} alt={`${c.name} logo`} className="h-5 w-5 rounded-full object-cover" />
              ) : null}
              {c.name}{c.state ? ` · ${c.state}` : ""} <GoldBadge />
            </span>
          ))}
          {companies.length === 0 && <p className="text-sm text-ink/50">Partner logos appear as companies verify.</p>}
        </div>
      </section>

      <p className="text-sm"><Link href="/browse" className="font-bold text-primary-600 underline">Browse vetted ideas →</Link></p>
    </main>
  );
}
