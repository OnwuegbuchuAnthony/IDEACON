"use client";

import { useState } from "react";
import { startCheckoutAction } from "@/lib/actions-paystack";
import { TIERS, type TierName } from "@/lib/tiers";

const PAID: TierName[] = ["starter", "growth"];

/** Per-tier Paystack checkout button. Redirects to Paystack on click. */
export function PayButton({ tier, label }: { tier: TierName; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        disabled={busy}
        className="w-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const { url } = await startCheckoutAction(tier);
            window.location.href = url;
          } catch (e) {
            setError(e instanceof Error ? e.message : "Checkout failed");
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening Paystack…" : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function PricingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow">
        <h2 className="font-display text-lg font-bold">Free</h2>
        <p className="font-display text-3xl font-extrabold">₦0</p>
        <ul className="mt-2 text-sm text-ink/70">
          <li>1 seat · 3 requests/mo</li>
          <li>Browse approved teasers</li>
        </ul>
      </div>
      {PAID.map((t) => (
        <div key={t} className="rounded-2xl border-2 border-primary-600 bg-white p-6 shadow">
          <h2 className="font-display text-lg font-bold">{TIERS[t].label}</h2>
          <p className="font-display text-3xl font-extrabold">₦{TIERS[t].priceNgn.toLocaleString()}<span className="text-sm font-normal">/mo</span></p>
          <ul className="mt-2 text-sm text-ink/70">
            <li>{TIERS[t].seats} seats · {TIERS[t].requestsPerMonth} requests/mo</li>
            <li>NDA fast-lane + broker support</li>
          </ul>
          <div className="mt-4">
            <PayButton tier={t} label={`Pay with Paystack`} />
          </div>
        </div>
      ))}
    </div>
  );
}
