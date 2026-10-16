"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-surface p-12 text-center font-sans text-ink">
        <h1>◈ IDEACON — something went wrong</h1>
        <p>The team has been notified. Your ideas and deals are safe.</p>
        <button
          onClick={reset}
          className="rounded-full bg-azure px-6 py-2.5 text-sm font-bold text-surface"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
