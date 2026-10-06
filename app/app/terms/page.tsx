import { pageMeta } from "@/lib/seo";

const SECTIONS: [string, string][] = [
  [
    "1. The platform in one paragraph",
    "IDEACON (operated by [operating company legal name — TBD]) is a brokered marketplace where creators publish idea teasers and companies discover them. IDEACON does not buy ideas and does not guarantee any deal, partnership, or income.",
  ],
  [
    "2. Accounts and eligibility",
    "You must provide accurate identity information. Company accounts must designate a founder or authorized officer. IDEACON may verify, suspend, or remove accounts that misrepresent identity, ownership, or authority.",
  ],
  [
    "3. NDA-gated access",
    "Ideas are shown publicly as teasers only (niche, uniqueness signals, and stage — never the full detail, files, or creator identity). Full detail unlocks solely under a signed, time-boxed mutual NDA between the viewing company and IDEACON's brokerage process. Access expires automatically; expired grants do not renew access, and previously viewed material remains confidential indefinitely.",
  ],
  [
    "4. Brokered introductions only",
    "All contact between creators and companies happens exclusively through IDEACON brokers. There is no open messaging. Attempting to contact, solicit, or transact with the other side outside the brokered process is a breach of these terms and may lead to suspension and loss of NDA coverage for future dealings.",
  ],
  [
    "5. Anti-circumvention",
    "Where IDEACON introduces a company to an idea, the company agrees not to bypass the platform to license, copy, or develop that idea — directly or through affiliates — for [non-circumvention period — TBD by counsel] without IDEACON's written consent and the applicable commission. Breach is actionable in addition to any IP claims the creator may hold.",
  ],
  [
    "6. Ownership and proof of origin",
    "Creators keep full ownership of their ideas unless and until a signed deal says otherwise. IDEACON records a timestamped, hash-chained proof of origin for every submission. Plain statement: proof of origin is evidence of when you submitted what — it is NOT patent protection, trademark registration, or legal advice. Protectable inventions should be filed with the relevant registry (e.g. NOTAP / Trademarks, Patents and Designs Registry, or your jurisdiction's office) before or alongside disclosure.",
  ],
  [
    "7. Fees and commissions",
    "Browsing teasers and submitting ideas is free. Paid company tiers, deal commissions (currently 10% of booked deal value), and invoicing terms are set out on the pricing page and in individual deal records. Subscription fees are non-refundable except where consumer law requires otherwise.",
  ],
  [
    "8. Acceptable use",
    "No scraping, no bulk extraction of teasers, no uploading material you do not own or have rights to share, no unlawful or misleading content. Expert reviews and AI scores are advisory opinions, not guarantees of value or success.",
  ],
  [
    "9. Termination",
    "Either side may stop using the platform at any time. IDEACON may suspend accounts for breach, fraud, or legal risk. Confidentiality, anti-circumvention, and accrued payment obligations survive termination.",
  ],
  [
    "10. Governing law and contact",
    "Governing law and courts: [Nigeria — exact forum TBD by counsel]. Operator details: [legal name — TBD], [registered address — TBD], [registration number — TBD]. Questions: ideaconnectglobal@gmail.com.",
  ],
];

export const metadata = pageMeta({
  title: "Terms — IDEACON",
  description: "Draft IDEACON terms of use, pending counsel review.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <div className="rounded-2xl border-2 border-sun-500 bg-sun-100 p-4 text-sm font-bold" role="note">
        Draft — pending review by Nigerian counsel. Not yet binding; the brokered process described in-app governs until final terms publish.
      </div>
      <p className="text-sm font-bold text-primary-600">Legal · Terms</p>
      <h1 className="font-display text-3xl font-extrabold">Terms of use</h1>
      {SECTIONS.map(([h, b]) => (
        <section key={h} className="rounded-2xl border border-primary-100 bg-white p-5 shadow">
          <h2 className="font-display font-bold">{h}</h2>
          <p className="mt-1 text-sm text-ink/70">{b}</p>
        </section>
      ))}
      <p className="text-sm text-ink/70">
        Questions about these terms?{" "}
        <a href="mailto:ideaconnectglobal@gmail.com" className="font-bold text-primary-600 underline">
          ideaconnectglobal@gmail.com
        </a>
      </p>
    </main>
  );
}
