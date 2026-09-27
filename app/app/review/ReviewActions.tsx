"use client";

import { useState } from "react";
import { reviewAction, runScoringAction, setIdeaStatusAction } from "@/lib/actions";
import type { IdeaStatus } from "@prisma/client";

export function ScoreButton({ ideaId }: { ideaId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} onClick={async () => { setBusy(true); await runScoringAction(ideaId); }}
      className="rounded-full bg-grape-100 px-4 py-1 text-xs font-bold text-grape-500">
      {busy ? "Scoring…" : "Run AI score"}
    </button>
  );
}

export function StatusButtons({ ideaId, current }: { ideaId: string; current: IdeaStatus }) {
  const nexts: IdeaStatus[] =
    current === "SUBMITTED" ? ["IN_REVIEW"] : current === "FLAGGED" ? ["DRAFT"] : [];
  if (nexts.length === 0) return null;
  return (
    <span className="flex gap-1">
      {nexts.map((s) => (
        <button key={s} onClick={() => setIdeaStatusAction(ideaId, s)}
          className="rounded-full border border-primary-600 px-3 py-1 text-xs font-bold text-primary-600">
          → {s}
        </button>
      ))}
    </span>
  );
}

export function ReviewForm({ ideaId }: { ideaId: string }) {
  const [verdict, setVerdict] = useState<"approve" | "flag" | "request-changes">("approve");
  return (
    <form
      className="mt-2 flex flex-wrap items-end gap-2 rounded-xl bg-white p-3"
      action={async (fd: FormData) => {
        await reviewAction({
          ideaId,
          originality: Number(fd.get("o")),
          feasibility: Number(fd.get("f")),
          marketFit: Number(fd.get("m")),
          verdict,
          note: String(fd.get("note") ?? ""),
        });
      }}
    >
      {[["o", "Orig"], ["f", "Feas"], ["m", "Fit"]].map(([n, l]) => (
        <label key={n} className="text-xs font-bold">{l}
          <input name={n} type="number" min={1} max={10} defaultValue={7} style={{ maxWidth: 70 }} />
        </label>
      ))}
      <select value={verdict} onChange={(e) => setVerdict(e.target.value as typeof verdict)} style={{ maxWidth: 170 }}>
        <option value="approve">Approve</option>
        <option value="flag">Flag</option>
        <option value="request-changes">Request changes</option>
      </select>
      <input name="note" placeholder="Note (optional)" style={{ maxWidth: 220 }} />
      <button className="rounded-full bg-primary-600 px-4 py-2 text-xs font-bold text-white" type="submit">
        Submit review
      </button>
    </form>
  );
}
