"use client";

import { useSyncExternalStore } from "react";

export type PromptEvent = Event & { prompt: () => void };

/**
 * Install-prompt singleton. Chrome fires `beforeinstallprompt` once shortly
 * after page load, so the listener lives at module scope — any component
 * mounting later (mobile menu, hero banner) still sees the deferred event.
 */
let deferred: PromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as PromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => deferred;
const getServerSnapshot = () => null;

/** The shared deferred prompt (null until Chrome offers it). */
export function useInstallPrompt(): PromptEvent | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True once running as an installed app. Client-only. */
export function useIsInstalled(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches,
    () => false,
  );
}
