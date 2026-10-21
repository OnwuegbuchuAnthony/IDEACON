/**
 * Homepage trust block. Shared with audience pages.
 *
 * The four cards are the single place we describe what protects an idea, so
 * the same protection messaging is not repeated in a second section.
 */
export function TrustBlock({ title = "Why you can trust IDEACON" }: { title?: string }) {
  return (
    <section aria-label={title} className="w-full">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["NDA before detail", "Full designs unlock only under a signed, time-boxed NDA."],
          ["Proof of origin", "Every submission gets a timestamped, tamper-evident record."],
          ["Verified companies", "Firms verify identity before they can request access."],
          ["Brokered introductions only", "No open chat. Every handoff goes through our team."],
        ].map(([t, d]) => (
          <div
            key={t}
            className="rounded-2xl border border-border bg-surface p-5 shadow"
          >
            <h3 className="font-display text-base font-bold">{t}</h3>
            <p className="mt-1 text-sm text-ink-muted">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Proof of origin is a timestamped record of your submission. It is not a patent.
      </p>
    </section>
  );
}
