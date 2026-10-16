import Link from "next/link";
import { TIERS } from "@/lib/tiers";

/** Pricing teaser with real NGN tiers. */
export function PricingTeaser() {
  return (
    <section aria-label="Pricing" className="w-full">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Start free, scale paid</h2>
        <Link href="/pricing" className="text-sm font-bold text-primary-600 underline underline-offset-4">
          Full pricing →
        </Link>
      </div>
      <div className="mt-4 grid w-full gap-4 sm:grid-cols-3">
        {([
          ["Free", 0, "3 requests/mo · browse teasers"],
          ["Starter", TIERS.starter.priceNgn, "20 requests/mo · NDA fast-lane"],
          ["Growth", TIERS.growth.priceNgn, "100 requests/mo · broker support"],
        ] as [string, number, string][]).map(([t, p, d]) => (
          <div key={t} className="rounded-2xl border border-border bg-surface p-5 shadow">
            <p className="font-display font-bold">{t}</p>
            <p className="font-display text-2xl font-extrabold">₦{p.toLocaleString()}<span className="text-sm font-normal text-ink/60">/mo</span></p>
            <p className="mt-1 text-sm text-ink-muted">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** NDA & proof-of-origin visual flow. */
export function NdaFlow() {
  const steps: [string, string][] = [
    ["Teaser", "Public: niche, uniqueness, scale. Never the full detail."],
    ["Request", "Company asks; broker reviews the fit first."],
    ["NDA", "Signed, time-boxed grant unlocks files + identity."],
    ["Proof", "Every step timestamped into a hash-chained trail."],
  ];
  return (
    <section aria-label="NDA and proof of origin" className="w-full rounded-2xl bg-primary-800 p-6 text-white shadow">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">Locked down, by design</h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="relative rounded-xl bg-white/10 p-4">
            <p className="font-display text-sm font-extrabold text-sun">0{i + 1}</p>
            <p className="mt-1 font-display text-base font-bold">{t}</p>
            <p className="mt-1 text-xs opacity-80">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
