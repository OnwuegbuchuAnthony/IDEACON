import { NextResponse } from "next/server";
import { validWebhookSignature } from "@/lib/paystack";
import { activateSubscription } from "@/lib/actions-paystack";
import { db } from "@/lib/db";

/**
 * Paystack webhook → charge.success activates the tier.
 * Signature-verified; safe to retry (idempotent on reference).
 * Dashboard → Settings → API Keys & Webhooks → add this URL.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!validWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  let event: { event?: string; data?: { reference?: string; status?: string; metadata?: { companyId?: string; tier?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (event.event === "charge.success" && event.data?.reference) {
    const { reference, metadata } = event.data;
    if (metadata?.companyId && metadata?.tier) {
      await activateSubscription({ companyId: metadata.companyId, tier: metadata.tier, reference });
    } else {
      await db.payment.updateMany({ where: { reference, status: "pending" }, data: { status: "success", paidAt: new Date() } });
    }
  }
  return NextResponse.json({ received: true });
}
