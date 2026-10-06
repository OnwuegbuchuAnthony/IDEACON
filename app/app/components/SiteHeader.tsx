"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS: { href: string; label: string; key?: string }[] = [
  { href: "/about", label: "How it works" },
  { href: "/submit", label: "For Creators" },
  { href: "/browse", label: "For Companies" },
  { href: "/browse", label: "Niches", key: "niches" },
  { href: "/faq", label: "FAQ" },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Sticky site header. Mobile (<768px, Tailwind md) collapses to a hamburger
 * toggle with a full-width slide-down panel: focus trap, Escape to close,
 * aria-expanded, focus returned to the toggle. No UI library.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the panel on navigation; return focus to the toggle.
  useEffect(() => {
    if (open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape to close + focus trap while the panel is open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  // "Niches" shares the /browse target with "For Companies", so only the
  // latter takes the active state — avoids two links highlighting at once.
  const isActive = (href: string, key?: string) =>
    key === "niches" ? false : pathname === href;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary-600 focus:px-5 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-2">
          <Link href="/" className="font-display text-base font-extrabold" aria-label="IDEACON home">
            ◈ IDEACON
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-4 text-sm font-bold md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label + l.href}
                href={l.href}
                aria-current={isActive(l.href, l.key) ? "page" : undefined}
                className={
                  isActive(l.href, l.key)
                    ? "text-primary-600 underline underline-offset-4"
                    : "text-ink/70 hover:text-primary-600"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/signup"
            className="ml-auto hidden rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-5 py-2 text-sm font-bold text-white md:inline-block"
          >
            Get started
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="tap ml-auto rounded-lg border border-primary-100 p-2 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
        <div
          id="site-menu"
          ref={panelRef}
          className={`overflow-hidden border-primary-100 bg-white transition-[max-height] duration-200 md:hidden ${
            open ? "max-h-96 border-t" : "max-h-0"
          }`}
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.label + l.href}
                href={l.href}
                aria-current={isActive(l.href, l.key) ? "page" : undefined}
                tabIndex={open ? undefined : -1}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  isActive(l.href, l.key) ? "bg-primary-100/60 text-primary-600" : "text-ink/70"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/signup"
              tabIndex={open ? undefined : -1}
              className="mt-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-5 py-2 text-center text-sm font-bold text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
