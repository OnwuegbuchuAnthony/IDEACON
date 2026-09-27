import { db } from "./db";
import { TIERS, type TierName } from "./tiers";

export { TIERS, type TierName };

/**
 * Billing v1 — tiered company subscriptions + commission ledger.
 * Prices in NGN/month. Manual invoicing (Paystack/Flutterwave links
 * sent by brokers) until payment webhooks land.
 */

export const COMMISSION_RATE = 0.1; // 10% of deal value

export async function companySubscription(companyId: string) {
  let sub = await db.subscription.findUnique({ where: { companyId } });
  if (!sub) {
    sub = await db.subscription.create({ data: { companyId, tier: "free" } });
  }
  return sub;
}

/** Enforce monthly access-request quota for the company's tier. */
export async function checkRequestQuota(companyId: string): Promise<{ ok: boolean; used: number; quota: number; tier: string }> {
  const sub = await companySubscription(companyId);
  const tier = TIERS[(sub.tier as TierName) ?? "free"] ?? TIERS.free;
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const used = await db.match.count({ where: { companyId, createdAt: { gte: since } } });
  return { ok: used < tier.requestsPerMonth, used, quota: tier.requestsPerMonth, tier: sub.tier };
}

/** Enforce seat limit when adding members. */
export async function checkSeatAvailable(companyId: string): Promise<{ ok: boolean; used: number; seats: number }> {
  const sub = await companySubscription(companyId);
  const tier = TIERS[(sub.tier as TierName) ?? "free"] ?? TIERS.free;
  const used = await db.companyMember.count({ where: { companyId } });
  return { ok: used < tier.seats, used, seats: tier.seats };
}

/** Record deal value + IDEACON commission (minor units). */
export async function bookDealValue(dealId: string, amountKobo: bigint, actorId: string) {
  const commissionKobo = (amountKobo * BigInt(Math.round(COMMISSION_RATE * 100))) / BigInt(100);
  const deal = await db.deal.update({
    where: { id: dealId },
    data: { amountKobo, commissionKobo, status: "invoiced" },
  });
  const { recordEvent } = await import("./audit");
  await recordEvent({
    type: "deal.invoiced",
    actorId,
    ideaId: deal.ideaId,
    payload: {
      dealId,
      amountKobo: amountKobo.toString(),
      commissionKobo: commissionKobo.toString(),
      currency: deal.currency,
    },
  });
  return deal;
}

export function formatNgn(kobo: bigint | number): string {
  const naira = Number(kobo) / 100;
  return `₦${naira.toLocaleString("en-NG")}`;
}
