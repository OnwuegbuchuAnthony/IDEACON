import Link from "next/link";

const NICHES: Record<string, { name: string; blurb: string }> = {
  healthtech: {
    name: "HealthTech",
    blurb: "Diagnostics, patient tools and medical-device ideas — live catalog wiring lands here next.",
  },
  agrotech: {
    name: "AgroTech",
    blurb: "Sensors, irrigation and post-harvest ideas — live catalog wiring lands here next.",
  },
  fintech: {
    name: "FinTech",
    blurb: "Inclusion, fraud-prevention and credit ideas — live catalog wiring lands here next.",
  },
  business: {
    name: "Business",
    blurb: "Operational and product-line innovations — live catalog wiring lands here next.",
  },
};

// Stub: reads ?niche= and shows placeholder cards until live data is wired.
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const slug = (sp.niche ?? "").toLowerCase();
  const niche = NICHES[slug];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <p className="text-sm font-bold text-primary-600">
        Discover{niche ? ` · ${niche.name}` : ""}
      </p>
      <h1 className="font-display text-3xl font-extrabold">
        {niche ? `${niche.name} ideas` : "Discover ideas by niche"}
      </h1>
      <p className="text-sm text-ink-muted">
        {niche ? niche.blurb : "Pick a niche to preview what companies here will find."}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-dashed border-primary-400 bg-primary-100/40 p-5">
            <p className="font-display text-sm font-bold">
              {niche ? `${niche.name} teaser ${i}` : `Teaser ${i}`}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Placeholder card — real vetted teasers plug in here.
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm">
        <Link href="/browse" className="font-bold text-primary-600 underline">
          Browse the live teaser catalog →
        </Link>
      </p>
    </main>
  );
}
