import Link from "next/link";
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-8 px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-primary-600">For creators</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Ideas die with the semester. Or on the shelf. Not here.
        </h1>
        <p className="mt-3 max-w-xl text-lg text-ink/70">
          Visibility to the right industry, protection before anything is shared,
          and a pay path that doesn&apos;t require you to become a business person.
        </p>
        <Link
          href="/submit"
          className="mt-5 inline-block rounded-full bg-gradient-to-r from-coral-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-lg"
        >
          Submit an idea
        </Link>
      </div>

      <section aria-label="Creator personas" className="w-full">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Which one are you?</h2>
        <div className="mt-4 grid w-full gap-4 sm:grid-cols-2">
          {PERSONAS.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-surface p-5 shadow">
              <h3 className="font-display text-base font-bold">{t}</h3>
              <p className="mt-1 text-sm text-ink-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <TrustBlock />
      <HowItWorks />
    </main>
  );
}
