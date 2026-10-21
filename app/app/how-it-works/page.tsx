import Link from "next/link";
import { Container, Section } from "@/app/components/Container";
import { HowItWorks } from "@/app/components/HowItWorks";
import { TrustBlock } from "@/app/components/TrustBlock";
import { BoardStrip } from "@/app/components/TrustSections";
import { NdaFlow } from "@/app/components/ConversionSections";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How it works — IDEACON",
  description:
    "Submit, vet, match and meet under NDA — how IDEACON brokers ideas to industry.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Section ariaLabel="How it works — intro" className="pb-0">
        <Container className="max-w-3xl">
          <p className="text-sm font-bold text-primary-600">How it works</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            From a raw idea to a brokered deal
          </h1>
          <p className="mt-3 text-lg text-ink/70">
            IDEACON captures novel ideas, vets them with experts and AI, and
            brokers them to the right company — every step timestamped and
            NDA-protected.
          </p>
        </Container>
      </Section>

      <Section ariaLabel="The four steps">
        <Container>
          <HowItWorks />
        </Container>
      </Section>

      <Section ariaLabel="NDA and proof of origin">
        <Container>
          <NdaFlow />
        </Container>
      </Section>

      <Section ariaLabel="Trust">
        <Container>
          <TrustBlock />
        </Container>
      </Section>

      <Section ariaLabel="Review board">
        <Container>
          <BoardStrip />
        </Container>
      </Section>

      <Section ariaLabel="Call to action">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 p-6 text-white shadow">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Ready when you are
            </h2>
            <p className="mt-1 max-w-xl text-sm opacity-90">
              Submit a teaser in minutes, or browse what companies are already
              discovering.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link
                href="/submit"
                className="rounded-full bg-white px-5 py-2 text-primary-800"
              >
                Submit an idea
              </Link>
              <Link
                href="/discover"
                className="rounded-full bg-white/20 px-5 py-2 text-white"
              >
                Discover ideas
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
