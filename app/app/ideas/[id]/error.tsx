"use client";

/** Route error boundary with retry. Token classes only. */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-3 px-6 py-16 text-center">
      <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-coral-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
      </span>
      <h1 className="font-display text-2xl font-extrabold">This idea didn&apos;t load</h1>
      <p className="text-sm text-ink-muted">
        {error.message || "The teaser may have been withdrawn. Nothing of yours was affected."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </main>
  );
}
