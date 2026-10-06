"use client";

import Script from "next/script";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

// Umami (self-hosted, cookie-free): pageviews automatic, custom events via
// track(). Renders nothing until NEXT_PUBLIC_UMAMI_* are set. Loads only
// after the page is interactive.
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return null;
  return (
    <Script
      id="umami"
      strategy="afterInteractive"
      src={src}
      data-website-id={websiteId}
    />
  );
}

/** Custom event. Props must NEVER contain personal data (see docs/analytics.md). */
export function trackEvent(event: string, data?: Record<string, string>) {
  try {
    window.umami?.track(event, data);
  } catch {
    /* analytics must never break the app */
  }
}
