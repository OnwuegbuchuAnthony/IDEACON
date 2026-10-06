/** Homepage niche showcase. Shared with audience pages. */
export function NicheShowcase() {
  return (
    <section id="niches" aria-label="Niches" className="w-full scroll-mt-20">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">
        Built for your niche
      </h2>
      <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: "HealthTech",
            slug: "healthtech",
            color: "bg-coral",
            desc: "Clinics and medtech teams source diagnostics, patient tools and device ideas.",
            icon: (
              <>
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                <path d="M3 12h4l2-3 3 6 2-3h5" />
              </>
            ),
          },
          {
            name: "AgroTech",
            slug: "agrotech",
            color: "bg-teal",
            desc: "Agribusinesses find sensors, irrigation and post-harvest loss ideas.",
            icon: (
              <>
                <path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 9-9 4-.7 7-.5 7-.5s-.2 3-.9 7c-1 6-5 9-9 9z" />
                <path d="M4 21c4-6 8-9 12-11" />
              </>
            ),
          },
          {
            name: "FinTech",
            slug: "fintech",
            color: "bg-violet",
            desc: "Banks and payment startups source inclusion, fraud and credit ideas.",
            icon: (
              <>
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <path d="M1 10h22" />
              </>
            ),
          },
          {
            name: "Business",
            slug: "business",
            color: "bg-azure",
            desc: "SMEs and corporates find operational and product-line innovations.",
            icon: (
              <>
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </>
            ),
          },
        ].map((n) => (
          <div
            key={n.slug}
            className="rounded-2xl border border-border bg-surface p-5 shadow"
          >
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 items-center justify-center rounded-full ${n.color}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-surface"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {n.icon}
              </svg>
            </span>
            <h3 className="mt-3 font-display text-base font-bold">{n.name}</h3>
            <p className="mt-1 text-sm text-ink-muted">{n.desc}</p>
            <a
              href={`/discover?niche=${n.slug}`}
              className="mt-2 inline-block text-sm font-bold text-primary-600 underline underline-offset-4"
            >
              Browse {n.name} ideas
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
