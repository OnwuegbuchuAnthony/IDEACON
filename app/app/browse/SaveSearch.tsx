"use client";

import { useState } from "react";
import { saveSearchAction } from "@/lib/actions-workspace";
import type { Niche } from "@prisma/client";

/** Save the current filter set (company members only, enforced server-side). */
export function SaveSearchButton({ niche, stage, q }: { niche?: string; stage?: string; q?: string }) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-primary-100 px-5 py-2 text-sm font-bold text-primary-800" type="button">
        Save search
      </button>
    );
  }
  return (
    <form
      className="flex items-center gap-2"
      action={async () => {
        await saveSearchAction({ name, niche: (niche || undefined) as Niche | undefined, stage, q });
      }}
    >
      <input placeholder="Search name" value={name} onChange={(e) => setName(e.target.value)} required style={{ maxWidth: 180 }} />
      <button className="rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white" type="submit">Save</button>
    </form>
  );
}
