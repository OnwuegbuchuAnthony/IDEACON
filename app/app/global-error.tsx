"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: 48, textAlign: "center" }}>
        <h1>◈ IDEACON — something went wrong</h1>
        <p>The team has been notified. Your ideas and deals are safe.</p>
        <button
          onClick={reset}
          style={{ background: "var(--color-azure)", color: "var(--color-surface)", border: 0, borderRadius: 999, padding: "10px 24px", fontWeight: 700 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
