import Link from "next/link";

/** Designed empty state. Keep copy plain; action optional. */
export function EmptyState({
  title = "No ideas match yet",
  body = "Try widening your filters — new vetted teasers land every week.",
  actionHref,
  actionLabel,
}: {
  title?: string;
  body?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-primary-400 bg-surface px-6 py-10 text-center shadow">
      <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <p className="font-display text-base font-bold">{title}</p>
      <p className="max-w-sm text-sm text-ink-muted">{body}</p>
      {actionHref && (
        <Link href={actionHref} className="mt-1 rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white">
          {actionLabel ?? "Browse all teasers"}
        </Link>
      )}
    </div>
  );
}
