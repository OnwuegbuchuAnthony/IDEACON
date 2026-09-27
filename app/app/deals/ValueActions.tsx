"use client";

import { bookDealCurrencyAction } from "@/lib/actions-phase2";

/** Broker books deal value (NGN/USD) → commission ledger entry. */
export function ValueForm({ dealId }: { dealId: string }) {
  return (
    <form
      className="flex items-center gap-2 text-sm"
      action={async (fd: FormData) => {
        await bookDealCurrencyAction(dealId, Number(fd.get("amount")), String(fd.get("currency")));
      }}
    >
      <input name="amount" type="number" min={1} placeholder="Deal value" required style={{ maxWidth: 160 }} />
      <select name="currency" defaultValue="NGN" style={{ maxWidth: 110 }}>
        <option value="NGN">NGN ₦</option>
        <option value="USD">USD $</option>
      </select>
      <button className="rounded-full bg-mint-500 px-4 py-2 text-xs font-bold text-white" type="submit">
        Book value + invoice
      </button>
    </form>
  );
}
