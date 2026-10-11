"use client";

import { useEffect, useState } from "react";

/**
 * Visible install affordance. Registers the service worker, captures the
 * install prompt, and hides once installed. Falls back to manual steps
 * where the browser offers no prompt (notably iOS Safari).
 */
export function InstallButton({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<Event & { prompt: () => void } | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as Event & { prompt: () => void });
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
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
