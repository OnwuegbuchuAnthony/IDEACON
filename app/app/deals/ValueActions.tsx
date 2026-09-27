"use client";

import { bookDealAction } from "@/lib/actions-phase2";

/** Broker books deal value (NGN) → commission ledger entry. */
export function ValueForm({ dealId }: { dealId: string }) {
  return (
    <form
      className="flex items-center gap-2 text-sm"
      action={async (fd: FormData) => {
        await bookDealAction(dealId, Number(fd.get("amount")));
      }}
    >
      <input name="amount" type="number" min={1} placeholder="Deal value (₦)" required style={{ maxWidth: 200 }} />
      <button className="rounded-full bg-mint-500 px-4 py-2 text-xs font-bold text-white" type="submit">
        Book value + invoice
      </button>
    </form>
  );
}
