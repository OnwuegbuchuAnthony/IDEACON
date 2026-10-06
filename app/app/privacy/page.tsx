import { pageMeta } from "@/lib/seo";

const SECTIONS: [string, string[]][] = [
  [
    "1. Who we are",
    [
      "Controller: [operating company legal name — TBD], [registered address — TBD]. Contact for all data matters below.",
      "This notice explains what personal data IDEACON collects, why, how long we keep it, and your rights under Nigeria's NDPR (and UK GDPR / US state laws where applicable).",
    ],
  ],
  [
    "2. What personal data is collected",
    [
      "Account data: name, email, password hash (never plaintext), avatar URL, role, creator persona or company membership.",
      "Idea content you submit: public teasers plus NDA-locked full detail and attachments. Full detail is stored encrypted at rest in private storage and disclosed only under a valid NDA grant.",
      "Deal process data: NDA signatures and timestamps, deal records, messages sent through the brokered thread, payment references (processed by Paystack — we never see or store card numbers).",
      "Technical data: login sessions, device/IP metadata for security and rate limiting, and product analytics (only if analytics is enabled).",
    ],
  ],
  [
    "3. Lawful basis",
    [
      "Contract: running your account, submissions, reviews, NDAs, and deals.",
      "Consent: marketing emails and optional analytics — opt out anytime.",
      "Legitimate interests: fraud prevention, platform security, and defending the audit trail behind proof-of-origin records.",
      "Legal obligation: tax, accounting, and dispute records where the law requires.",
    ],
  ],
  [
    "4. Retention",
    [
      "Active accounts: data kept while your account is active.",
      "Deal and NDA records: kept [7 years — TBD by counsel] after closure for legal defensibility.",
      "Audit/proof-of-origin hashes: retained as tamper-evident evidence; raw content deletes with the account on verified request unless a live dispute requires retention.",
      "Backups: nightly, 14-day rotation; deletions propagate on the next cycle.",
    ],
  ],
  [
    "5. Data subject rights",
    [
      "Access and portability: download everything we hold about you at /api/me/export while logged in.",
      "Correction: edit your profile, bio, and company cards at any time.",
      "Deletion: request account deletion by email; we delete unless retention duties above apply.",
      "Objection and restriction: object to analytics or non-essential processing; restrict processing during a dispute.",
      "Withdraw consent: one email stops all consent-based processing going forward.",
    ],
  ],
  [
    "6. Data Protection Officer",
    [
      "DPO: [name — TBD] · [dpo contact email — TBD]. All rights requests go here; we respond within [30 days — TBD by counsel].",
    ],
  ],
  [
    "7. Cross-border transfers",
    [
      "Hosting location to be confirmed: application hosting and managed database regions are under review (candidates include EU and US regions). Until confirmed, assume personal data may be processed outside Nigeria.",
      "Once regions are locked, transfers will rely on NDPR-recognized safeguards (adequacy, binding contracts, and explicit consent where required) — exact mechanism TBD by counsel.",
    ],
  ],
];

export const metadata = pageMeta({
  title: "Privacy — IDEACON",
  description: "Draft IDEACON privacy notice, pending counsel review.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <div className="rounded-2xl border-2 border-sun-500 bg-sun-100 p-4 text-sm font-bold" role="note">
        Draft — pending review by Nigerian counsel. Not yet binding; current practice is minimum-necessary collection with export on demand.
      </div>
      <p className="text-sm font-bold text-primary-600">Legal · Privacy</p>
      <h1 className="font-display text-3xl font-extrabold">Privacy notice</h1>
      {SECTIONS.map(([h, points]) => (
        <section key={h} className="rounded-2xl border border-primary-100 bg-white p-5 shadow">
          <h2 className="font-display font-bold">{h}</h2>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-ink/70">
            {points.map((p) => (
              <li key={p.slice(0, 24)}>{p}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm text-ink/70">
        Data questions or export requests?{" "}
        <a href="mailto:ideaconnectglobal@gmail.com" className="font-bold text-primary-600 underline">
          ideaconnectglobal@gmail.com
        </a>
      </p>
    </main>
  );
}
