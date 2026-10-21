"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";

const KEY = "ideacon-consent";

export type Consent = "accepted" | "declined" | null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("ideacon-consent", notify);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

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
 * Live consent choice via useSyncExternalStore — safe during SSR (server
 * snapshot is null) and re-renders whenever the choice changes.
 */
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, getConsent, () => null);
}

/**
 * NDPR consent banner. Analytics + tracker load only after explicit accept.
 * No tracking scripts run before choice; decline keeps everything local.
 */
/**
 * Publish our height so fixed bottom-right UI (the assistant launcher) can
 * sit above us instead of underneath the banner.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ConsentBanner() {
  const choice = useConsent();
  const ref = useRef<HTMLDivElement>(null);

  // Publish our height so fixed bottom-right UI (the assistant launcher) can
  // sit above us instead of underneath the banner.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--consent-banner-h",
        `${el.offsetHeight + 16}px`,
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty("--consent-banner-h", "0px");
    };
  }, []);

  function pick(v: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event("ideacon-consent"));
  }

  if (choice) return null;

  return (
    <div
      ref={ref}
      id="consent-banner"
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
