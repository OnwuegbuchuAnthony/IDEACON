"use client";

import Script from "next/script";
import { useConsent } from "@/app/components/ConsentBanner";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

// Umami (self-hosted, cookie-free): pageviews automatic, custom events via
// track(). Renders nothing until NEXT_PUBLIC_UMAMI_* are set AND the visitor
// accepted analytics in the NDPR consent banner. Loads after interactive.
export function Analytics() {
  const consented = useConsent() === "accepted";

  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId || !consented) return null;
  return (
    <Script
      id="umami"
      strategy="afterInteractive"
      src={src}
      data-website-id={websiteId}
    />
  );
}

/** Custom event. No-ops unless analytics was accepted. Props must NEVER contain personal data (see docs/analytics.md). */
export function trackEvent(event: string, data?: Record<string, string>) {
  try {
    if (localStorage.getItem("ideacon-consent") !== "accepted") return;
    window.umami?.track(event, data);
  } catch {
    /* analytics must never break the app */
  }
}
