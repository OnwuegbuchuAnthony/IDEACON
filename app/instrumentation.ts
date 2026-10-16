import * as Sentry from "@sentry/nextjs";

// Server + edge error reporting. No-op until SENTRY_DSN is set.
export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || undefined,
    enabled: Boolean(process.env.SENTRY_DSN),
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
