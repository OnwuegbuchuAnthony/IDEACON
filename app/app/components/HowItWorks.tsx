/** Homepage how-it-works. Shared with audience pages. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-label="How it works" className="w-full scroll-mt-20">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">
        How it works
      </h2>
      <ol className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            n: "1",
            color: "bg-coral",
            headline: "Submit your idea",
            desc: "Share a public teaser of what it does and who it helps. Full detail stays locked.",
            icon: (
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            ),
            extra: <path d="M14 2v6h6M9 13h6M12 10v6" />,
          },
          {
            n: "2",
            color: "bg-azure",
            headline: "Get reviewed and scored",
            desc: "AI bands for originality and feasibility, then a verdict from the expert board.",
            icon: <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" />,
            extra: <path d="M22 4 12 14l-3-3" />,
          },
          {
            n: "3",
            color: "bg-violet",
            headline: "Match the right company",
            desc: "Role-aware ranking across niche, stage and problem type surfaces your fit.",
            icon: (
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            ),
            extra: null,
          },
          {
            n: "4",
            color: "bg-teal",
            headline: "Meet under NDA",
            desc: "Brokers manage every introduction. No open chat, timestamped proof throughout.",
            icon: (
              <rect x="3" y="11" width="18" height="11" rx="2" />
            ),
            extra: <path d="M7 11V7a5 5 0 0 1 10 0v4" />,
          },
        ].map((s) => (
          <li
            key={s.n}
            className="rounded-2xl border border-border bg-surface p-5 shadow"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-base font-extrabold text-surface ${s.color}`}
              >
                {s.n}
              </span>
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-ink"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {s.icon}
                {s.extra}
              </svg>
            </div>
            <h3 className="mt-3 font-display text-base font-bold">{s.headline}</h3>
            <p className="mt-1 text-sm text-ink-muted">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
