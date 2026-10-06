import { PricingCards } from "./PayButtons";

// Public pricing. Checkout requires company login (enforced server-side).
export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Simple pricing, in naira</h1>
      {sp.paid === "failed" && <p className="rounded-xl bg-coral-100 p-3 text-sm font-bold text-coral-700">Payment did not complete. No charge was applied — try again.</p>}
      {sp.paid === "error" && <p className="rounded-xl bg-coral-100 p-3 text-sm font-bold text-coral-700">Could not confirm payment. Contact a broker with your Paystack receipt.</p>}
      <PricingCards />
      <p className="text-sm text-ink/60">
        Enterprise is broker-assisted (custom scope, invoicing, SLA). Cards, bank, USSD, transfers and mobile money via Paystack. Test mode until launch.
      </p>
    </main>
  );
}
