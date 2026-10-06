"use client";

import { trackEvent } from "@/lib/analytics";

/** FAQ accordion with open tracking (index only — no personal data). */
export function FaqList({ items }: { items: [string, string][] }) {
  return (
    <>
      {items.map(([q, a], i) => (
        <details
          key={q}
          className="rounded-2xl border border-primary-100 bg-white p-5 shadow"
          onToggle={(e) => {
            if ((e.target as HTMLDetailsElement).open) {
              trackEvent("faq_opened", { index: String(i) });
            }
          }}
        >
          <summary className="cursor-pointer font-display font-bold">{q}</summary>
          <p className="mt-2 text-sm text-ink/70">{a}</p>
        </details>
      ))}
    </>
  );
}
