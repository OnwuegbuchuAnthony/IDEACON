"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuthModal } from "@/app/components/AuthModalProvider";
import { Logo } from "@/app/components/Logo";
import { Container } from "@/app/components/Container";
import "@/lib/install-prompt";

const LINKS: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/creators", label: "Creators" },
  { href: "/companies", label: "Companies" },
  { href: "/niches", label: "Niches" },
  { href: "/pricing", label: "Pricing" },
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
 * Sticky standard marketing header. Exactly one <Logo /> at the far left; the
 * centre holds the primary links; the right holds a text "Log in" and a
 * primary "Get started". There is exactly one set of links and one set of auth
 * actions in the DOM: on md+ the <nav> is a centred inline row and the actions
 * sit to the right; below md the same elements become a hamburger panel.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const authModal = useAuthModal();
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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
      if (window.matchMedia(MD_QUERY).matches) return;
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
  const tab = linksReachable ? undefined : -1;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary-600 focus:px-5 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
        <Container>
          <div className="flex items-center gap-1.5 py-3 sm:gap-4 md:grid md:min-h-16 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <div className="shrink-0 md:justify-self-start">
              <Logo className="text-ink" />
            </div>

            {/* One collapsible region holding the single set of nav links and
                the single set of auth actions. Desktop (md:contents) the links
                take the centre track and the actions anchor to the right
                column. Mobile: the same elements become a hamburger panel. */}
            <div
              ref={panelRef}
              id="site-menu"
              className={`${
                open ? "max-h-96 border-t border-border" : "max-h-0"
              } order-last w-full overflow-hidden bg-white transition-[max-height] duration-200 md:contents`}
            >
              <nav
                aria-label="Primary"
                className="flex flex-col gap-1 px-4 py-3 text-sm font-semibold md:justify-center md:flex-row md:items-center md:gap-2 md:px-0 md:py-0 lg:gap-6"
              >
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    tabIndex={tab}
                    className={`rounded-lg px-3 py-2 md:rounded-none md:px-0 md:py-0 ${
                      isActive(l.href)
                        ? "bg-primary-100/60 text-primary-600 underline-offset-4 md:bg-transparent md:underline"
                        : "text-ink/70 hover:text-primary-600"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              {waitlist ? (
                <Link
                  href="/waitlist"
                  tabIndex={tab}
                  className="mt-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-5 py-2 text-center text-sm font-bold text-white md:col-start-3 md:mt-0 md:justify-self-end"
                >
                  Join waitlist
                </Link>
              ) : (
                <div className="mt-1 flex flex-col gap-1 md:col-start-3 md:mt-0 md:flex-row md:items-center md:gap-4 md:justify-self-end">
                  <button
                    type="button"
                    tabIndex={tab}
                    onClick={(e) => {
                      setOpen(false);
                      authModal.open("login", e.currentTarget);
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm font-bold text-ink/70 hover:text-primary-600 md:px-0 md:py-0"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    tabIndex={tab}
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
            </div>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="tap ml-auto shrink-0 rounded-lg border border-border p-1.5 md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 block" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </Container>
      </header>
    </>
  );
}
