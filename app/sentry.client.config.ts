import * as Sentry from "@sentry/nextjs";

// Client error reporting. No-op until SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  enabled: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});
