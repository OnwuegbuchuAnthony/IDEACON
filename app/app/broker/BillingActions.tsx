"use client";

import { useState } from "react";
import { setTierAction, sendDigestsAction, publishCaseStudyAction } from "@/lib/actions-phase2";
import { TIERS, type TierName } from "@/lib/tiers";

export function TierForm({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [tier, setTier] = useState<TierName>("starter");
  return (
    <form className="flex items-center gap-2 text-sm" action={() => setTierAction(companyId, tier)}>
      <span className="font-bold">{companyName}</span>
      <select value={tier} onChange={(e) => setTier(e.target.value as TierName)} style={{ maxWidth: 150 }}>
        {(Object.keys(TIERS) as TierName[]).map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button className="rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white" type="submit">Set tier</button>
    </form>
  );
}

export function DigestButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} onClick={async () => { setBusy(true); await sendDigestsAction(); }}
      className="rounded-full bg-teal-500 px-4 py-2 text-xs font-bold text-white">
      {busy ? "Sending…" : "Send match digests"}
    </button>
  );
}

export function CaseStudyForm() {
  return (
    <form
      className="flex flex-col gap-2 rounded-2xl border border-mint-500 bg-white p-5 shadow"
      action={async (fd: FormData) => {
        await publishCaseStudyAction({
          title: String(fd.get("title")),
          body: String(fd.get("body")),
          company: String(fd.get("company") ?? ""),
        });
      }}
    >
      <h2 className="font-display text-lg font-bold">Publish case study</h2>
      <input name="title" placeholder="Title (e.g. Cold-box pilot cuts loss 38%)" required />
      <input name="company" placeholder="Company (optional)" />
      <textarea name="body" rows={3} placeholder="What happened, measured outcome…" required />
      <button className="w-fit rounded-full bg-mint-500 px-4 py-2 text-xs font-bold text-white" type="submit">
        Publish to /trust
      </button>
    </form>
  );
}
