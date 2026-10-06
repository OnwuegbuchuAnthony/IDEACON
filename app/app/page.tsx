import Link from "next/link";
import { HeroCta } from "./HeroCta";
import { TrustBlock } from "@/app/components/TrustBlock";
import { HowItWorks } from "@/app/components/HowItWorks";
import { NicheShowcase } from "@/app/components/NicheShowcase";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-extrabold tracking-tight">
            ◈ IDEACON
          </span>
          <nav className="flex gap-3 text-sm font-semibold">
            <Link
              href="/login"
              className="rounded-full bg-white/15 px-4 py-2 hover:bg-white/25"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-4 py-2 text-primary-800 hover:bg-primary-100"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-8 px-6 py-16">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-800">
            HealthTech
          </span>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-800">
            AgroTech
          </span>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-800">
            FinTech
          </span>
          <span className="rounded-full bg-coral-100 px-3 py-1 text-coral-700">
            Business
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-500">
            NDA-protected
          </span>
        </div>

        <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Ideas meet the industries built to use them.
        </h1>
        <p className="max-w-xl text-lg text-ink/70">
          IDEACON captures novel ideas, vets them with experts + AI, and
          brokers them to the right company — Nigeria-first, launching in
          Lagos and Abuja, global by design.
        </p>

        <HeroCta />

        <TrustBlock />

        <HowItWorks />

        <NicheShowcase />

        <section aria-label="Students teaser" className="w-full rounded-2xl bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 p-6 text-white shadow">
          <h2 className="font-display text-xl font-extrabold">Built on campuses, too</h2>
          <p className="mt-1 max-w-xl text-sm opacity-90">
            Final-year projects and hackathon builds, rescued from the semester —
            through hubs, capstone nominations, and campus ambassadors.
          </p>
          <a
            href="/students"
            className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-primary-800"
          >
            For students &amp; universities
          </a>
        </section>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {[
            ["Teased, never exposed", "Ideas show niche, uniqueness & scale — full detail only behind NDA."],
            ["Expert + AI vetted", "Review board verdict with explainable score bands."],
            ["Brokered handoff", "No open chat. Timestamped proof-of-origin on every step."],
          ].map(([t, d]) => (
            <div
              key={t}
              className="rounded-2xl border border-primary-100 bg-white p-5 shadow"
            >
              <h2 className="font-display text-base font-bold">{t}</h2>
              <p className="mt-1 text-sm text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-ink/50">
        IDEACON · Phase 0 foundation build
      </footer>
    </div>
  );
}
