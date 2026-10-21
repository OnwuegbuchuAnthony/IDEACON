import dynamic from "next/dynamic";
import { HeroCta } from "./HeroCta";
import { HomeAuthNav } from "./HomeAuthNav";
import { InstallBanner } from "@/app/components/InstallBanner";

const AskChat = dynamic(() => import("./ask/AskChat").then((m) => m.AskChat), {
  loading: () => <p className="text-sm text-ink/50">Loading assistant…</p>,
});
import { TrustBlock } from "@/app/components/TrustBlock";
import { HowItWorks } from "@/app/components/HowItWorks";
import { NicheShowcase } from "@/app/components/NicheShowcase";
import { FeaturedTeasers } from "@/app/components/FeaturedTeasers";
import { StatsRow, BoardStrip } from "@/app/components/TrustSections";
import { PricingTeaser, NdaFlow } from "@/app/components/ConversionSections";
import { isWaitlistMode } from "@/lib/launch";

export const revalidate = 3600;

export default function Home() {
  const waitlist = isWaitlistMode();
  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-extrabold tracking-tight">
            ◈ IDEACON
          </span>
          <nav className="flex gap-3 text-sm font-semibold">
            <HomeAuthNav waitlist={waitlist} />
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

        <InstallBanner />

        <TrustBlock />

        <FeaturedTeasers />

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

        <section aria-label="Ask IDEACON AI" className="w-full">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Ask me anything
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            Grounded in live teasers. <a href="/ask" className="font-bold text-primary-600 underline">Open the full assistant →</a>
          </p>
          <div className="mt-3 max-w-2xl">
            <AskChat />
          </div>
        </section>

        <BoardStrip />

        <StatsRow />

        <PricingTeaser />

        <NdaFlow />

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
        © {new Date().getFullYear()} IDEACON. Ideas stay teaser-only until an NDA is signed.
      </footer>
    </div>
  );
}
