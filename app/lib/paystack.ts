import { createHmac } from "node:crypto";

const BASE = "https://api.paystack.co";

function secret(): string {
  const s = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (!s) throw new Error("Paystack is not configured (PAYSTACK_SECRET_KEY missing)");
  return s;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json()) as { status: boolean; message: string; data: T };
  if (!res.ok || !body.status) {
    throw new Error(`Paystack ${path}: ${body.message ?? res.status}`);
  }
  return body.data;
}

export type InitData = { authorization_url: string; access_code: string; reference: string };

/** Start a checkout. Amount in kobo. Metadata carries companyId + tier. */
export async function initializeCheckout(input: {
  email: string;
  amountKobo: number;
  companyId: string;
  tier: string;
  callbackUrl: string;
}): Promise<InitData> {
  return call<InitData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amountKobo),
      currency: "NGN",
      callback_url: input.callbackUrl,
      channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
      metadata: { companyId: input.companyId, tier: input.tier, purpose: "subscription" },
    }),
  });
}

export type VerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  metadata?: { companyId?: string; tier?: string; purpose?: string };
};

/** Server-side truth: never trust the callback query alone. */
export async function verifyTransaction(reference: string): Promise<VerifyData> {
  return call<VerifyData>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Webhook authenticity: HMAC-SHA512 of raw body vs x-paystack-signature. */
export function validWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const digest = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  return digest === signature;
}

/** Cheap key check (no charge): list one transaction. */
export async function checkKeyValid(): Promise<{ ok: boolean; message: string }> {
  try {
    await call("/transaction?perPage=1");
    return { ok: true, message: "Paystack key is valid" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "invalid key" };
  }
}
