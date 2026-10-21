import { HeroCta } from "./HeroCta";
import { HomeAuthNav } from "./HomeAuthNav";
import { InstallBanner } from "@/app/components/InstallBanner";
import { Container, Section } from "@/app/components/Container";
import { TrustBlock } from "@/app/components/TrustBlock";
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
              Ideas meet the industries built to use them.
            </h1>
            <p className="max-w-2xl text-lg opacity-90">
              IDEACON captures novel ideas, vets them with experts and AI, and
              brokers them to the right company — Nigeria-first, launching in
              Lagos and Abuja, global by design.
            </p>
            <HeroCta />
            <HomeAuthNav waitlist={waitlist} prefix="Already a member?" />
          </div>
        </Container>
      </Section>

      <InstallBanner />

      {/* Trust strip */}
      <Section ariaLabel="Trust strip">
        <Container>
          <TrustBlock />
        </Container>
      </Section>

      {/* How it works (4 steps) */}
      <Section ariaLabel="How it works">
        <Container>
          <HowItWorks />
        </Container>
      </Section>

      {/* Niches */}
      <Section ariaLabel="Niches">
        <Container>
          <NicheShowcase />
        </Container>
      </Section>

      {/* Students teaser */}
      <Section ariaLabel="Students teaser">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 p-6 text-white shadow">
            <h2 className="font-display text-xl font-extrabold">Built on campuses, too</h2>
            <p className="mt-1 max-w-xl text-sm opacity-90">
              Final-year projects and hackathon builds, rescued from the semester —
              through hubs, capstone nominations, and campus ambassadors.
            </p>
            <Link
              href="/students"
              className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-primary-800"
            >
              For students &amp; universities
            </Link>
          </div>
        </Container>
      </Section>

      {/* Pricing summary */}
      <Section ariaLabel="Pricing summary">
        <Container>
          <PricingTeaser />
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
    </div>
  );
}
