"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type ChatComponent = React.ComponentType;

type LoadState = "idle" | "loading" | "ready" | "error";

/** Shown while the assistant bundle loads. Deliberately not a text label. */
function AssistantSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-4/5 rounded" />
      <div className="skeleton h-10 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Floating "Ask IDEACON" launcher.
 *
 * The assistant used to sit inline on the homepage, which pushed the rest of
 * the page down. It now opens from a fixed button in the bottom-right
 * corner, and the chat bundle is only fetched once the panel is opened.
 */
export function FloatingAsk() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LoadState>("idle");
  const [Chat, setChat] = useState<ChatComponent | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(() => {
    setStatus("loading");
    import("@/app/ask/AskChat")
      .then((mod) => {
        setChat(() => mod.AskChat);
        setStatus("ready");
      })
      .catch(() => {
        setChat(null);
        setStatus("error");
      });
  }, []);

  // Escape closes and returns focus to the launcher.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Clicking anywhere outside the panel or the launcher closes it.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    trackEvent("ask_open");
    setOpen(true);
    if (status === "idle") load();
  }

  return (
    <>
      {open ? (
        <div
          ref={panelRef}
          id="ask-ideacon-panel"
          role="dialog"
          aria-label="Ask IDEACON"
          tabIndex={-1}
          className="fixed right-4 z-40 flex max-h-[75vh] w-[min(92vw,420px)] flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-lg outline-none"
          style={{ bottom: "calc(4.5rem + var(--consent-banner-h, 0px))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-extrabold">Ask IDEACON</h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="Close assistant"
              className="rounded-lg p-1 text-ink/50 hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 3l12 12M15 3L3 15" />
              </svg>
            </button>
          </div>

          {status === "loading" && <AssistantSkeleton />}

          {status === "error" && (
            <div className="rounded-2xl border border-border bg-white p-4 text-sm">
              <p className="font-bold">The assistant didn&apos;t load just now.</p>
              <p className="mt-1 text-ink-muted">
                It may be a temporary network hiccup. Try again, or open the full
                assistant page.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={load}
                  className="rounded-full bg-primary-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Try again
                </button>
                <Link
                  href="/ask"
                  className="rounded-full border border-primary-100 px-4 py-2 text-xs font-bold text-primary-600"
                >
                  Open the assistant
                </Link>
              </div>
            </div>
          )}

          {status === "ready" && Chat ? <Chat /> : null}
        </div>
      ) : null}

      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="ask-ideacon-panel"
        className="fixed right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:brightness-105"
        style={{ bottom: "calc(1rem + var(--consent-banner-h, 0px))" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ask IDEACON
      </button>
    </>
  );
}
