import Link from "next/link";
import { Container, PageIntro, Section } from "@/app/components/Container";
import { StatsRow } from "@/app/components/TrustSections";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About — IDEACON",
  description: "Idea + Connection: novel ideas matched to the industries built to use them.",
  path: "/about",
});

// Public About: what IDEACON is, how it works, socials + contact.
export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageIntro
        eyebrow="About"
        title="Idea + Connection"
        lede="IDEACON is the platform that links novel ideas to the industries built to use them. Independent inventors, everyday people, experts and students submit ideas; startups and enterprises across HealthTech, AgroTech, FinTech and general business discover them, license them, and build with their creators."
      />

      <Section ariaLabel="Platform stats">
        <Container>
          <StatsRow />
        </Container>
      </Section>

      <Section ariaLabel="What sets IDEACON apart">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Submit (teased)", "Ideas show niche, uniqueness and scale — full detail stays locked behind NDA."],
              ["Vetted, not noise", "Expert review board verdicts plus explainable AI score bands."],
              ["Brokered handoff", "No open chat. The IDEACON team manages every company↔creator introduction."],
              ["Protected & paid", "Timestamped proof-of-origin, NDA-gated disclosure, licensing or partnership terms."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-border bg-surface p-5 shadow">
                <h2 className="font-display font-bold">{t}</h2>
                <p className="mt-1 text-sm text-ink/70">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section ariaLabel="Nigeria-first">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 p-6 text-white">
            <h2 className="font-display text-xl font-bold">Nigeria-first, global by design</h2>
            <p className="mt-1 text-sm opacity-90">
              Launching with companies across Lagos, Abuja, Rivers, Kano, Ogun and
              beyond — plus a university pipeline turning student projects into
              real-world innovations.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link href="/how-it-works" className="rounded-full bg-white px-5 py-2 text-primary-800">How it works</Link>
              <Link href="/discover" className="rounded-full bg-white/20 px-5 py-2">Discover ideas</Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section ariaLabel="Contact">
        <Container>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow">
            <h2 className="font-display text-xl font-bold">Contact us</h2>
            <p className="mt-1 text-sm text-ink/70">
              Partnerships, universities, press, support — we reply within 2 business days.
            </p>
            <a href="mailto:ideaconnectglobal@gmail.com" className="mt-3 inline-block rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white">
              ✉ ideaconnectglobal@gmail.com
            </a>
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-bold text-ink/60">Follow:</span>
              <span className="text-sm text-ink/50">Official handles dropping soon.</span>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
