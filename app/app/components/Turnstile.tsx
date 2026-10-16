"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback?: (token: string) => void }) => string;
      reset?: (id?: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile widget. Renders nothing until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. Calls onVerify(token) for the
 * server to check. Invisible-friendly: compact checkbox UI.
 */
export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!sitekey || !ref.current || !window.turnstile) return;
    const id = window.turnstile.render(ref.current, {
      sitekey,
      callback: (token: string) => onVerify(token),
    });
    return () => window.turnstile?.reset?.(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitekey]);

  if (!sitekey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div ref={ref} />
    </>
  );
}
