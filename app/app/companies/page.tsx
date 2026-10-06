import Link from "next/link";
import { TrustBlock } from "@/app/components/TrustBlock";
import { NicheShowcase } from "@/app/components/NicheShowcase";
import { pageMeta } from "@/lib/seo";

const ROLES: [string, string][] = [
  [
    "Startup Founder",
    "You browse directly and need a genuine edge — without a costly in-house sourcing pipeline.",
  ],
  [
    "Innovation / R&D Lead",
    "You scout against formal KPIs and need defensible, documented, auditable sourcing.",
  ],
  [
    "Product / Strategy Manager",
    "You hunt a fix for a specific gap and need materials credible enough to survive leadership scrutiny.",
  ],
];

export const metadata = pageMeta({
  title: "For Companies — IDEACON",
  description: "License vetted ideas through a brokered, NDA-protected process.",
  path: "/companies",
});

export default function CompaniesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-8 px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-primary-600">For companies</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Find the idea that gives you an edge
        </h1>
        <p className="mt-3 max-w-xl text-lg text-ink/70">
          Vetted teasers, not AI noise — with the paper trail (NDA, proof of
          origin, review status) that makes the deal defensible internally.
        </p>
        <Link
          href="/browse"
          className="mt-5 inline-block rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white shadow-lg"
        >
          Request access
        </Link>
      </div>

      <section aria-label="Company roles" className="w-full">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Who&apos;s browsing?</h2>
        <div className="mt-4 grid w-full gap-4 sm:grid-cols-3">
          {ROLES.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-surface p-5 shadow">
              <h3 className="font-display text-base font-bold">{t}</h3>
              <p className="mt-1 text-sm text-ink-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Verification" className="w-full rounded-2xl border-2 border-teal-500 bg-white p-5 shadow">
        <h2 className="font-display text-base font-bold">Verified before you browse</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Companies verify identity before requesting access. Every grant, review, and deal step is timestamped —
          so your sourcing story holds up in procurement and legal.
        </p>
      </section>

      <NicheShowcase />
      <TrustBlock />
    </main>
  );
}
