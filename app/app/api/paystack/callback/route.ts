import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { activateSubscription } from "@/lib/actions-paystack";

/**
 * Paystack redirects here after checkout (?reference=...).
 * Server-side verify FIRST — the query param alone proves nothing.
 */
export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/pricing?paid=missing", req.url));
  }
  try {
    const tx = await verifyTransaction(reference);
    if (tx.status !== "success") {
      return NextResponse.redirect(new URL("/pricing?paid=failed", req.url));
    }
    const companyId = tx.metadata?.companyId;
    const tier = tx.metadata?.tier;
    if (!companyId || !tier) {
      return NextResponse.redirect(new URL("/pricing?paid=unlinked", req.url));
    }
    await activateSubscription({ companyId, tier, reference });
    return NextResponse.redirect(new URL("/dashboard?paid=success", req.url));
  } catch {
    return NextResponse.redirect(new URL("/pricing?paid=error", req.url));
  }
}
