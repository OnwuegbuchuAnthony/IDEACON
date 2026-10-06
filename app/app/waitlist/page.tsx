import { WaitlistForm } from "@/app/components/WaitlistForm";
import { waitlistCount } from "@/lib/actions-waitlist";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Join the Waitlist — IDEACON",
  description: "Be the first to know when IDEACON launches. Join the waitlist.",
  path: "/waitlist",
});

export default async function WaitlistPage() {
  const count = await waitlistCount().catch(() => 0);
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <header className="text-center">
        <p className="text-sm font-bold text-primary-600">◈ IDEACON · Idea + Connection</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Get first access
        </h1>
        <p className="mt-2 text-ink/70">
          Creators get discovered. Companies get first pick of vetted ideas.
          {count > 0 && <> Join <b>{count}</b> already waiting.</>}
        </p>
      </header>
      <WaitlistForm />
      <p className="text-center text-xs text-ink/50">
        One email at launch. No spam, no sharing — ever.
      </p>
    </main>
  );
}
