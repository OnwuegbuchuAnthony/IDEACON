"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type PromptEvent = Event & { prompt: () => void };

/**
 * The deferred install prompt, captured ONCE at page load and shared by
 * every InstallButton. Chrome fires `beforeinstallprompt` a single time
 * shortly after load — a per-instance listener (e.g. inside the mobile
 * menu, which mounts only when opened) would miss it forever.
 */
let deferredPrompt: PromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as PromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getPromptSnapshot(): PromptEvent | null {
  return deferredPrompt;
}

function getServerSnapshot(): PromptEvent | null {
  return null;
}

/**
 * Visible install affordance. Tapping opens Chrome's native install dialog
 * whenever a deferred prompt was captured; otherwise falls back to manual
 * steps (iPhone, in-app browsers, Incognito, already-installed). Hides
 * once running as an installed app. Same export — SiteHeader unchanged.
 */
export function InstallButton({ compact = false }: { compact?: boolean }) {
  const promptEvent = useSyncExternalStore(subscribe, getPromptSnapshot, getServerSnapshot);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
  }, []);

  if (installed) return null;

  if (!promptEvent) {
    return (
      <span className="relative">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          aria-expanded={showHelp}
          className={
            compact
              ? "rounded-full border border-primary-100 px-3 py-1.5 text-xs font-bold text-primary-700"
              : "rounded-full border-2 border-primary-600 px-5 py-2 text-sm font-bold text-primary-600"
          }
        >
          Install app
        </button>
        {showHelp && (
          <span className="absolute right-0 top-full z-10 mt-2 w-64 rounded-2xl border border-border bg-surface p-4 text-xs text-ink-muted shadow">
            Android/Chrome: menu ⋮ → Install app. iPhone: Share → Add to Home
            Screen. Then IDEACON opens full-screen like a native app.
          </span>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => promptEvent.prompt()}
      className={
        compact
          ? "rounded-full border border-primary-100 px-3 py-1.5 text-xs font-bold text-primary-700"
          : "rounded-full border-2 border-primary-600 px-5 py-2 text-sm font-bold text-primary-600"
      }
    >
      ⬇ Install app
    </button>
  );
}
