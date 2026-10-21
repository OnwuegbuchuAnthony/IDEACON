import { PricingCards } from "./PayButtons";
import { Container, Section } from "@/app/components/Container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pricing — IDEACON",
  description: "Simple naira pricing: start free, scale as you source more ideas.",
  path: "/pricing",
});

// Public pricing. Checkout requires company login (enforced server-side).
export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <main className="flex flex-1 flex-col">
      <Section ariaLabel="Pricing">
        <Container>
          <h1 className="font-display text-3xl font-extrabold">Simple pricing, in naira</h1>
          {sp.new === "company" && (
            <p className="mt-4 rounded-2xl border-2 border-sun-500 bg-sun-100 p-4 text-sm font-bold">
              Welcome, founder — subscribe below and your firm is instantly verified with a gold badge.
            </p>
          )}
          {sp.paid === "failed" && <p className="mt-4 rounded-xl bg-coral-100 p-3 text-sm font-bold text-coral-700">Payment did not complete. No charge was applied — try again.</p>}
          {sp.paid === "error" && <p className="mt-4 rounded-xl bg-coral-100 p-3 text-sm font-bold text-coral-700">Could not confirm payment. Contact a broker with your Paystack receipt.</p>}
          <div className="mt-4">
            <PricingCards />
          </div>
          <p className="mt-4 text-sm text-ink/60">
            Enterprise is broker-assisted (custom scope, invoicing, SLA). Cards, bank, USSD, transfers and mobile money via Paystack. Test mode until launch.
          </p>
        </Container>
      </Section>
    </main>
  );
}
