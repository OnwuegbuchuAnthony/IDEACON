"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const ROLES = [
  { label: "Creator", desc: "Submit ideas, get discovered", href: "/signup?type=creator" },
  { label: "Company", desc: "Discover ideas, license & partner", href: "/signup?type=company" },
  { label: "Student", desc: "Turn class projects into real ventures", href: "/students" },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Hero actions: single primary CTA with role chooser, text link. */
export function HeroCta() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    menu?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !menu) return;
      const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
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
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <div ref={wrapRef} className="relative">
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls="hero-get-started-menu"
            onClick={() => {
              trackEvent("cta_click", { location: "hero-get-started" });
              setOpen((v) => !v);
            }}
            className="inline-flex h-12 items-center justify-center rounded-full bg-coral px-6 text-sm font-bold text-white shadow focus-visible:outline focus-visible:outline-3 focus-visible:outline-azure disabled:cursor-not-allowed disabled:opacity-60"
          >
            Get started
          </button>
          {open && (
            <div
              ref={menuRef}
              id="hero-get-started-menu"
              role="menu"
              aria-label="Choose your path"
              className="absolute left-0 top-full z-10 mt-2 w-64 rounded-[16px] border border-border bg-surface p-2 shadow"
            >
              {ROLES.map((r) => (
                <Link
                  key={r.label}
                  role="menuitem"
                  href={r.href}
                  onClick={() => {
                    trackEvent("role_selected", { role: r.label.toLowerCase() });
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className="block rounded-xl px-3 py-2 hover:bg-surface-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-azure"
                >
                  <span className="block text-sm font-bold">{r.label}</span>
                  <span className="block text-xs text-ink-muted">{r.desc}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <a
          href="#how-it-works"
          className="text-sm font-bold text-white/90 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-azure"
        >
          See how it works
        </a>
      </div>
    </div>
  );
}
