import Link from "next/link";
import { FaqList } from "./FaqList";

const FAQS: [string, string][] = [
  [
    "What is IDEACON?",
    "IDEACON (Idea + Connection) links novel ideas to the industries built to use them. Creators submit ideas as public teasers; companies discover, license, and build them — every handoff brokered by the IDEACON team.",
  ],
  [
    "Who can submit an idea?",
    "Anyone: independent inventors, casual submitters with a flash of insight, vetted experts and researchers, and students via university innovation hubs.",
  ],
  [
    "Is my idea protected?",
    "Yes. Only a teaser (niche, uniqueness, scale) is ever public. Full detail unlocks solely under a signed, time-boxed NDA, and every submission carries a timestamped proof-of-origin record.",
  ],
  [
    "How do companies get ideas?",
    "Browse vetted teasers by niche, stage, or problem; request access; sign the NDA; then work a licensing, revenue-share, or advisory deal through a broker. There is no open messaging — quality stays curated.",
  ],
  [
    "What does it cost?",
    "Submitting is free. Companies start on a free tier (3 requests/month) and upgrade to Starter or Growth for volume, or talk to us for Enterprise.",
  ],
  [
    "Which industries first?",
    "HealthTech, AgroTech, FinTech, and cross-industry business — launching Nigeria-first (Lagos, Abuja, Rivers, Kano, Ogun) on a global-ready platform.",
  ],
];

import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "FAQ — IDEACON",
  description: "How IDEACON works for creators and companies.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Questions, answered</h1>
      <FaqList items={FAQS} />
      <p className="text-sm">
        Still stuck? <Link href="/ask" className="font-bold text-primary-600 underline">Ask the AI</Link> or mail{" "}
        <a href="mailto:ideaconnectglobal@gmail.com" className="font-bold text-primary-600 underline">
          ideaconnectglobal@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
