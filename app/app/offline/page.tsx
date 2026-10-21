import Link from "next/link";

export const metadata = { title: "Offline — IDEACON" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-3 px-6 py-16 text-center">
      <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-display text-xl font-extrabold text-primary-800">
        ◈
      </span>
      <h1 className="font-display text-2xl font-extrabold">You&apos;re offline</h1>
      <p className="text-sm text-ink-muted">
        IDEACON needs a connection for fresh ideas. Reconnect and your drafts and queue will be right here.
      </p>
      <Link href="/discover" className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-bold text-white">
        Retry
      </Link>
    </main>
  );
}
