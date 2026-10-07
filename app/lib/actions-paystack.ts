"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { requireRole } from "./session";
import { myCompanyId } from "./session";
import { TIERS, type TierName } from "./tiers";
import { initializeCheckout } from "./paystack";
import { recordEvent } from "./audit";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Start a Paystack checkout for a tier upgrade. Returns the
 * authorization URL — the client redirects there.
 */
export async function startCheckoutAction(tier: TierName): Promise<{ url: string }> {
  const user = await requireRole("COMPANY_MEMBER", "BROKER", "ADMIN");
  const companyId = await myCompanyId(user.id);
  if (!companyId) throw new Error("Join or create a company profile first");
  if (!TIERS[tier] || tier === "free" || tier === "enterprise") {
    throw new Error("Choose a paid tier (starter/growth); enterprise is broker-assisted");
  }
  const amountKobo = TIERS[tier].priceNgn * 100;
  const init = await initializeCheckout({
    email: user.email,
    amountKobo,
    companyId,
    tier,
    callbackUrl: `${appUrl()}/api/paystack/callback`,
  });
  await db.payment.upsert({
    where: { reference: init.reference },
    update: {},
    create: {
      companyId,
      tier,
      amountKobo,
      reference: init.reference,
      status: "pending",
    },
  });
  await recordEvent({
    type: "payment.initialized",
    actorId: user.id,
    payload: { companyId, tier, reference: init.reference, amountKobo },
  });
  return { url: init.authorization_url };
}

/** Activate a tier after server-side verification. Idempotent on reference. */
export async function activateSubscription(input: {
  companyId: string;
  tier: string;
  reference: string;
  actorId?: string;
}) {
  const tier = TIERS[(input.tier as TierName)] ?? TIERS.free;
  await db.subscription.upsert({
    where: { companyId: input.companyId },
    update: {
      tier: input.tier,
      seats: tier.seats,
      status: "active",
      renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
    create: {
      companyId: input.companyId,
      tier: input.tier,
      seats: tier.seats,
      renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });
  await db.payment.updateMany({
    where: { reference: input.reference, status: "pending" },
    data: { status: "success", paidAt: new Date() },
  });
  // Paid tier = verified firm (gold badge). Manual broker verification stays.
  await db.companyProfile.update({
    where: { id: input.companyId },
    data: { verified: true },
  });
  await recordEvent({
    type: "subscription.activated",
    actorId: input.actorId,
    payload: { companyId: input.companyId, tier: input.tier, reference: input.reference, verified: true },
  });
}
