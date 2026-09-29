"use client";

import { useState } from "react";
import { approveMatchAction, createDealAction } from "@/lib/actions";
import { DEAL_TEMPLATES, type DealTemplate } from "@/lib/deal-templates";
import { JURISDICTIONS } from "@/lib/jurisdictions";

export function ApproveButton({ matchId }: { matchId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} onClick={async () => { setBusy(true); await approveMatchAction(matchId); }}
      className="rounded-full bg-mint-100 px-4 py-1 text-xs font-bold text-emerald-800">
      {busy ? "Approving…" : "Approve match"}
    </button>
  );
}

export function DealForm({ ideaId, companyId }: { ideaId: string; companyId: string }) {
  const [template, setTemplate] = useState<DealTemplate>("licensing");
  const [jurisdiction, setJurisdiction] = useState("NG");
  return (
    <form className="flex items-center gap-2" action={() => createDealAction({ ideaId, companyId, template, jurisdiction })}>
      <select value={template} onChange={(e) => setTemplate(e.target.value as DealTemplate)} style={{ maxWidth: 150 }}>
        {DEAL_TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} style={{ maxWidth: 130 }}>
        {Object.entries(JURISDICTIONS).map(([code, j]) => <option key={code} value={code}>{code} · {j.label}</option>)}
      </select>
      <button className="rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white" type="submit">
        Open deal
      </button>
    </form>
  );
}
