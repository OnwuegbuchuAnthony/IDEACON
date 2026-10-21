"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuthModal } from "@/app/components/AuthModalProvider";
import { Logo } from "@/app/components/Logo";
import "@/lib/install-prompt";

const LINKS: { href: string; label: string }[] = [
  { href: "/about", label: "How it works" },
  { href: "/submit", label: "For Creators" },
  { href: "/companies", label: "For Companies" },
  { href: "/discover", label: "Discover" },
  { href: "/faq", label: "FAQ" },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const MD_QUERY = "(min-width: 768px)";

function subscribeMd(cb: () => void) {
  const mq = window.matchMedia(MD_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True on md+ viewports. Server snapshot is false (mobile-first). */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeMd,
    () => window.matchMedia(MD_QUERY).matches,
    () => false,
  );
}

/**
 * Sticky site header. Exactly one <Logo /> at the far left, and exactly one
 * set of nav links in the DOM. On md+ the links sit in a horizontal row; below
 * md the same single <nav> becomes a slide-down panel toggled by a hamburger.
 * The toggle drives a data-open flag; visibility is entirely CSS, so there is
 * never a second copy of the links. Focus trap, Escape-to-close, aria-expanded
 * and focus restore behave as before.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const authModal = useAuthModal();
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the panel on navigation (adjust during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // The desktop row is always visible; if the viewport grows past md while the
  // mobile panel is open, drop the panel state so the row never inherits it.
  if (isDesktop && open) setOpen(false);

  // Escape to close + focus trap while the mobile panel is open.
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
      // Only trap focus when the panel is actually visible (below md).
      if (window.matchMedia("(min-width: 768px)").matches) return;
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
  }, [open]);

  const linksReachable = isDesktop || open;
  const isActive = (href: string) => pathname === href;
  const waitlist = process.env.NEXT_PUBLIC_LAUNCH_MODE === "waitlist";

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
          <Logo className="text-ink" />

          {/* One <nav>, one set of links. Desktop: inline row. Mobile: the
              panel is revealed by data-open via CSS (md: overrides). */}
          <div
            ref={panelRef as React.RefObject<HTMLDivElement>}
            id="site-menu"
            className={`${
              open ? "max-h-96 border-t border-primary-100" : "max-h-0"
            } order-last w-full overflow-hidden bg-white transition-[max-height] duration-200 md:order-none md:flex md:max-h-none md:w-auto md:flex-1 md:items-center md:overflow-visible md:border-0 md:transition-none`}
          >
            <nav
              aria-label="Primary"
              className="flex flex-col gap-1 px-6 py-3 text-sm font-bold md:flex-row md:items-center md:gap-4 md:px-0 md:py-0"
            >
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  tabIndex={linksReachable ? undefined : -1}
                  className={`rounded-lg px-3 py-2 md:rounded-none md:px-0 md:py-0 ${
                    isActive(l.href)
                      ? "bg-primary-100/60 text-primary-600 underline-offset-4 md:bg-transparent md:underline"
                      : "text-ink/70 hover:text-primary-600"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {waitlist ? (
                <Link
                  href="/waitlist"
                  tabIndex={linksReachable ? undefined : -1}
                  className="mt-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-5 py-2 text-center text-sm font-bold text-white md:ml-auto md:mt-0 md:text-left"
                >
                  Join waitlist
                </Link>
              ) : (
                <div className="flex flex-col gap-1 md:ml-auto md:flex-row md:items-center md:gap-4">
                  <button
                    type="button"
                    tabIndex={linksReachable ? undefined : -1}
                    onClick={(e) => {
                      setOpen(false);
                      authModal.open("login", e.currentTarget);
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm font-bold text-ink/70 hover:text-primary-600 md:px-0 md:py-0 md:text-center"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    tabIndex={linksReachable ? undefined : -1}
                    onClick={(e) => {
                      setOpen(false);
                      authModal.open("register", e.currentTarget);
                    }}
                    className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-5 py-2 text-center text-sm font-bold text-white"
                  >
                    Get started
                  </button>
                </div>
              )}
            </nav>
          </div>

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
      </header>
    </>
  );
}
