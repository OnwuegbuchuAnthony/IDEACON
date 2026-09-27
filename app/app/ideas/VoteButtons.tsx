"use client";

import { useState } from "react";
import { voteAction } from "@/lib/actions-voting";

/** Community vote buttons. Server enforces verified-email + caps. */
export function VoteButtons({ ideaId, score, count }: { ideaId: string; score: number; count: number }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2 text-sm">
      <button disabled={busy} aria-label="Upvote"
        className="rounded-full bg-mint-100 px-3 py-1 font-bold text-emerald-800"
        onClick={async () => { setBusy(true); await voteAction(ideaId, 1); }}>▲</button>
      <span className="font-bold">{score > 0 ? `+${score}` : score} <span className="font-normal text-ink/50">({count})</span></span>
      <button disabled={busy} aria-label="Downvote"
        className="rounded-full bg-coral-100 px-3 py-1 font-bold text-coral-500"
        onClick={async () => { setBusy(true); await voteAction(ideaId, -1); }}>▼</button>
    </div>
  );
}
