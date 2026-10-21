import { HeroCta } from "./HeroCta";
import { HomeAuthNav } from "./HomeAuthNav";
import { InstallBanner } from "@/app/components/InstallBanner";
import { Container, Section } from "@/app/components/Container";
import { TrustBlock } from "@/app/components/TrustBlock";
import { StatsRow } from "@/app/components/TrustSections";
import { FloatingAsk } from "@/app/components/FloatingAsk";
import { HowItWorks } from "@/app/components/HowItWorks";
import { NicheShowcase } from "@/app/components/NicheShowcase";
import { PricingTeaser } from "@/app/components/ConversionSections";
import { isWaitlistMode } from "@/lib/launch";
import Link from "next/link";

export const revalidate = 3600;

const FAQ_TEASER: [string, string][] = [
  [
    "Is my idea protected?",
    "Only a teaser is ever public. Full detail unlocks under a signed, time-boxed NDA with timestamped proof of origin.",
  ],
  [
    "Who can submit?",
    "Inventors, everyday submitters, researchers and students — anyone with an idea that solves a real problem.",
  ],
  [
    "How do companies get ideas?",
    "Browse vetted teasers, request access, sign the NDA, then complete a brokered licensing or partnership deal.",
  ],
];

export default function Home() {
  const waitlist = isWaitlistMode();
  return (
    <div className="flex flex-1 flex-col font-sans">
      {/* Hero */}
      <Section ariaLabel="Hero" className="bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 text-white">
        <Container>
          <div className="flex flex-col items-start gap-6 py-8">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/15 px-3 py-1">HealthTech</span>
              <span className="rounded-full bg-white/15 px-3 py-1">AgroTech</span>
              <span className="rounded-full bg-white/15 px-3 py-1">FinTech</span>
              <span className="rounded-full bg-white/15 px-3 py-1">NDA-protected</span>
            </div>
            <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Every idea deserves a homeland.
            </h1>
            <p className="max-w-2xl text-lg opacity-90">
              Great ideas die in notebooks and WhatsApp chats. IDEACON gives them
              proof of who had them first, protects them behind an NDA, and
              introduces them to the companies ready to build them. Launching in
              Lagos and Abuja.
            </p>
            <HeroCta />
            <HomeAuthNav waitlist={waitlist} prefix="Already a member?" />
          </div>
        </Container>
      </Section>

      {/* Contextual PWA install prompt. Wrapped in Container so it lines up
          with the 1200px content grid; the surrounding sections supply the
          vertical rhythm. */}
      <Container>
        <InstallBanner />
      </Container>

      {/* Safe by design — the single place we explain what protects an idea */}
      <Section ariaLabel="Safe by design">
        <Container>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Share the idea, keep the secret.
          </h2>
          <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">NDA before detail</p>
              <p className="mt-1 text-sm text-ink-muted">
                Only the teaser is public. The full idea opens after verification
                and a signed NDA.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">Proof of origin</p>
              <p className="mt-1 text-sm text-ink-muted">
                Every submission gets a timestamp, so there is a record of who
                had it first.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">Verified companies</p>
              <p className="mt-1 text-sm text-ink-muted">
                We check who is asking before they see anything.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">Brokered only</p>
              <p className="mt-1 text-sm text-ink-muted">
                We make every introduction. No cold messages, no leaks.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Proof of origin is a timestamped record of your submission. It is not
            a patent.
          </p>
        </Container>
      </Section>

      {/* How it works (4 steps) */}
      <Section ariaLabel="How it works">
        <Container>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            From idea to deal in four steps.
          </h2>
          <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600">
                1. Submit
              </p>
              <p className="mt-1 font-display text-base font-bold">
                Share a short teaser. It is free.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600">
                2. Review
              </p>
              <p className="mt-1 font-display text-base font-bold">
                AI and expert reviewers assess it, blind to who you are.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600">
                3. Match
              </p>
              <p className="mt-1 font-display text-base font-bold">
                We match it to companies in the right niche.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600">
                4. Meet
              </p>
              <p className="mt-1 font-display text-base font-bold">
                We introduce you under NDA, then you agree terms.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Niches */}
      <Section ariaLabel="Niches">
        <Container>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Built for the industries that move Nigeria.
          </h2>
          <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">HealthTech</p>
              <p className="mt-1 text-sm text-ink-muted">
                Diagnostics, care delivery and medical devices.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">AgroTech</p>
              <p className="mt-1 text-sm text-ink-muted">
                Farming, storage, processing and supply chains.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">FinTech</p>
              <p className="mt-1 text-sm text-ink-muted">
                Payments, inclusion, fraud and credit.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <p className="font-display text-base font-bold">Business</p>
              <p className="mt-1 text-sm text-ink-muted">
                Operations, products and efficiency for any company.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Students teaser */}
      <Section ariaLabel="Students teaser">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 p-6 text-white shadow">
            <h2 className="font-display text-xl font-extrabold">
              Your project should not die with the semester.
            </h2>
            <p className="mt-1 max-w-xl text-sm opacity-90">
              Turn a final-year project or hackathon idea into a timestamped
              record, expert feedback and a path to an internship, job or licence.
            </p>
            <Link
              href="/students"
              className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-primary-800"
            >
              For students and universities
            </Link>
          </div>
        </Container>
      </Section>

      {/* Live stats, or a launch badge while the counters are still empty */}
      <Section ariaLabel="Platform stats">
        <Container>
          <StatsRow />
        </Container>
      </Section>

      {/* Pricing summary */}
      <Section ariaLabel="Pricing summary">
        <Container>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Start free. Pay when you find your edge.
          </h2>
          <p className="mt-2 text-ink-muted">
            Creators submit free. Companies choose a plan. Full details on the
            pricing page.
          </p>
          <div className="mt-4">
            <Link
              href="/pricing"
              className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              See pricing
            </Link>
          </div>
        </Container>
      </Section>

      {/* FAQ teaser */}
      <Section ariaLabel="FAQ teaser">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Questions, answered
            </h2>
            <Link
              href="/faq"
              className="text-sm font-bold text-primary-600 underline underline-offset-4"
            >
              All FAQs →
            </Link>
          </div>
          <dl className="mt-4 grid w-full gap-4 sm:grid-cols-3">
            {FAQ_TEASER.map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-border bg-surface p-5 shadow">
                <dt className="font-display text-base font-bold">{q}</dt>
                <dd className="mt-1 text-sm text-ink-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* Final call to action */}
      <Section ariaLabel="Final call to action">
        <Container>
          <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              Turn your idea into an industry
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-ink-muted">
              Join the creators and companies building what&apos;s next —
              Nigeria-first, global by design.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-bold">
              <Link
                href="/submit"
                className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-white shadow-lg"
              >
                Submit an idea
              </Link>
              <Link
                href="/discover"
                className="rounded-full border border-primary-100 px-6 py-3 text-primary-600"
              >
                Discover ideas
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Floating assistant launcher */}
      <FloatingAsk />
    </div>
  );
}
