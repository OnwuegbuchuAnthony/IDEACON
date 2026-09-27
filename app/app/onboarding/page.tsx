import Link from "next/link";

// Phase 0 shell — Phase 1 builds the real creator/company wizards (§4.5).
export default function OnboardingPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Choose your path</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard" className="rounded-2xl border border-primary-100 bg-white p-6 shadow">
          <h2 className="font-display font-bold">I have ideas</h2>
          <p className="mt-1 text-sm text-ink/70">Creator onboarding: persona, verification, first submission.</p>
        </Link>
        <Link href="/dashboard" className="rounded-2xl border border-primary-100 bg-white p-6 shadow">
          <h2 className="font-display font-bold">I need ideas</h2>
          <p className="mt-1 text-sm text-ink/70">Company onboarding: profile, verification, discovery access.</p>
        </Link>
      </div>
    </main>
  );
}
