import Link from "next/link";
import { Container, PageIntro, Section } from "@/app/components/Container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact — IDEACON",
  description: "Reach the IDEACON team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageIntro
        eyebrow="Company · Contact"
        title="Talk to us"
        lede="Partnerships, universities, press, support, and deal inquiries — we reply within 2 business days."
        actions={
          <a
            href="mailto:ideaconnectglobal@gmail.com"
            className="rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white"
          >
            ✉ ideaconnectglobal@gmail.com
          </a>
        }
      />

      <Section ariaLabel="Other ways to reach us">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <h2 className="font-display text-lg font-bold">Idea questions</h2>
              <p className="mt-1 text-sm text-ink/70">
                For idea-specific questions, use the Ask AI page or the broker
                thread on your deal.
              </p>
              <Link
                href="/ask"
                className="mt-3 inline-block text-sm font-bold text-primary-600 underline underline-offset-4"
              >
                Ask the AI
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow">
              <h2 className="font-display text-lg font-bold">Partners & press</h2>
              <p className="mt-1 text-sm text-ink/70">
                University hubs, accelerator programmes and press requests all
                reach the same inbox.
              </p>
              <a
                href="mailto:ideaconnectglobal@gmail.com"
                className="mt-3 inline-block text-sm font-bold text-primary-600 underline underline-offset-4"
              >
                ideaconnectglobal@gmail.com
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
