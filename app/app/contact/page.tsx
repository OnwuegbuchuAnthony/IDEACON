import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact — IDEACON",
  description: "Reach the IDEACON team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <p className="text-sm font-bold text-primary-600">Company · Contact</p>
      <h1 className="font-display text-3xl font-extrabold">Talk to us</h1>
      <p className="text-ink/70">
        Partnerships, universities, press, support, and deal inquiries — we
        reply within 2 business days.
      </p>
      <a
        href="mailto:ideaconnectglobal@gmail.com"
        className="w-fit rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white"
      >
        ✉ ideaconnectglobal@gmail.com
      </a>
      <p className="text-xs text-ink/50">
        For idea-specific questions, use the Ask AI page or the broker thread on your deal.
      </p>
    </main>
  );
}
