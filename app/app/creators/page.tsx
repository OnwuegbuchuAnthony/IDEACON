import Link from "next/link";
import { Container, PageIntro, Section } from "@/app/components/Container";
import { TrustBlock } from "@/app/components/TrustBlock";
import { HowItWorks } from "@/app/components/HowItWorks";
import { pageMeta } from "@/lib/seo";

const PERSONAS: [string, string][] = [
  [
    "Independent Inventor",
    "You solved a real problem and built something concrete — but have no channel to reach companies without fear of theft.",
  ],
  [
    "Casual Submitter",
    "A “why doesn't this exist yet” moment with no roadmap. Get a merit signal before you expose anything.",
  ],
  [
    "Vetted Expert / Researcher",
    "Commercial potential locked in papers and labs. We translate it to impact plus royalties — no tech-transfer maze.",
  ],
  [
    "Student Innovator",
    "Final-year builds and hackathon wins, rescued from dying with the semester — via hubs, ambassadors, and intake drives.",
  ],
];

export const metadata = pageMeta({
  title: "For Creators — IDEACON",
  description: "Submit ideas, stay protected, get discovered by the right industry.",
  path: "/creators",
});

export default function CreatorsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageIntro
        eyebrow="For creators"
        title="Ideas die with the semester. Or on the shelf. Not here."
        lede="Visibility to the right industry, protection before anything is shared, and a pay path that doesn’t require you to become a business person."
        actions={
          <Link
            href="/submit"
            className="rounded-full bg-gradient-to-r from-coral-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            Submit an idea
          </Link>
        }
      />

      <Section ariaLabel="Creator personas">
        <Container>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Which one are you?
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {PERSONAS.map(([t, d]) => (
              <div
                key={t}
                className="rounded-2xl border border-border bg-surface p-5 shadow"
              >
                <h3 className="font-display text-base font-bold">{t}</h3>
                <p className="mt-1 text-sm text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <TrustBlock />
        </Container>
      </Section>

      <Section>
        <Container>
          <HowItWorks />
        </Container>
      </Section>
    </main>
  );
}
