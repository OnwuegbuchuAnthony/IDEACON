"use client";

import { useEffect, useState } from "react";

const KEY = "ideacon-consent";

export type Consent = "accepted" | "declined" | null;

/** Read stored NDPR consent choice (client only). */
export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

/**
 * NDPR consent banner. Analytics + tracker load only after explicit accept.
 * No tracking scripts run before choice; decline keeps everything local.
 */
export function ConsentBanner() {
  const [choice, setChoice] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(getConsent());
    setReady(true);
    const onChange = () => setChoice(getConsent());
    window.addEventListener("ideacon-consent", onChange);
    return () => window.removeEventListener("ideacon-consent", onChange);
  }, []);

  if (!ready || choice) return null;

  function pick(v: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event("ideacon-consent"));
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Privacy choice"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-surface p-4 shadow"
    >
      <p className="text-sm font-bold">Your privacy, your call</p>
      <p className="mt-1 text-xs text-ink-muted">
        We use cookieless analytics to improve IDEACON. Accept to help, or decline and browse fully private.{" "}
        <a href="/privacy" className="font-bold text-primary-600 underline">Privacy notice</a>
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => pick("declined")} className="rounded-full border border-primary-100 px-4 py-2 text-xs font-bold">
          Decline
        </button>
        <button onClick={() => pick("accepted")} className="rounded-full bg-primary-600 px-4 py-2 text-xs font-bold text-white">
          Accept analytics
        </button>
      </div>
    </div>
  );
}
