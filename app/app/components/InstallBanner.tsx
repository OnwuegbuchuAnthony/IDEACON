"use client";

import { useSyncExternalStore, useState } from "react";
import { useInstallPrompt, useIsInstalled } from "@/lib/install-prompt";

const DISMISSED_KEY = "ideacon-install-dismissed";

const dismissedListeners = new Set<() => void>();
function notifyDismissed() {
  dismissedListeners.forEach((l) => l());
}
function subscribeDismissed(cb: () => void) {
  dismissedListeners.add(cb);
  return () => {
    dismissedListeners.delete(cb);
  };
}
function getDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Contextual install banner (homepage hero). Shows only when Chrome has
 * offered a deferred prompt and the app isn't installed or dismissed.
 * Manual-steps fallback covers iPhone / in-app browsers / Incognito.
 */
export function InstallBanner() {
  const promptEvent = useInstallPrompt();
  const installed = useIsInstalled();
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissed, () => false);
  const [showHelp, setShowHelp] = useState(false);

  if (installed || dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* private mode */
    }
    notifyDismissed();
  }

  return (
    <div className="flex w-full max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-primary-100 bg-white p-4 shadow">
      <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 font-display text-lg font-extrabold text-primary-800">
        ◈
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Get the IDEACON app</p>
        <p className="text-xs text-ink/60">Full-screen, offline-ready, one tap to open.</p>
      </div>
      {promptEvent ? (
        <button
          type="button"
          onClick={() => promptEvent.prompt()}
          className="rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white"
        >
          Install
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          aria-expanded={showHelp}
          className="rounded-full border-2 border-primary-600 px-5 py-2 text-sm font-bold text-primary-600"
        >
          How to install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install banner"
        className="tap rounded-full px-2 text-sm font-bold text-ink/50"
      >
        ✕
      </button>
      {showHelp && !promptEvent && (
        <p className="w-full text-xs text-ink-muted">
          Android/Chrome: menu ⋮ → Install app. iPhone: Share → Add to Home Screen.
        </p>
      )}
    </div>
  );
}
