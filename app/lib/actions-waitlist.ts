"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { z } from "zod";
import type { Niche } from "@prisma/client";
import { db } from "./db";
import { sendEmail } from "./email";
import { NIGERIAN_STATES } from "./nigerian-states";
import { verifyTurnstile } from "./turnstile";

const JoinSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  name: z.string().trim().max(120).optional().default(""),
  role: z.enum(["creator", "company", "student", "other"]).default("creator"),
  state: z.string().trim().max(40).optional().default(""),
  university: z.string().trim().max(120).optional().default(""),
  department: z.string().trim().max(120).optional().default(""),
  niche: z.string().trim().optional().default(""),
  consent: z.literal(true, { message: "Please accept the privacy notice" }),
});

// In-memory IP bucket: 10 joins/hour. Single-box friendly (see middleware note).
const buckets = new Map<string, { count: number; reset: number }>();
function ipAllowed(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + 3_600_000 });
    return true;
  }
  b.count++;
  return b.count <= 10;
}

/** Public waitlist join. Validated (zod), Turnstile-checked, deduped by lowercase email, IP-capped. */
export async function joinWaitlistAction(input: {
  email: string;
  name?: string;
  role?: string;
  state?: string;
  university?: string;
  department?: string;
  niche?: Niche;
  consent?: boolean;
  turnstileToken?: string;
}): Promise<{ ok: true; already: boolean }> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!ipAllowed(ip)) throw new Error("Too many signups from this address — try again later");

  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    throw new Error("Bot check failed — please try again");
  }

  const parsed = JoinSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid form");
  const { email, name, role } = parsed.data;
  const state =
    parsed.data.state && (NIGERIAN_STATES as readonly string[]).includes(parsed.data.state)
      ? parsed.data.state
      : null;

  const existing = await db.waitlistEntry.findUnique({ where: { email } });
  const extra = {
    university: parsed.data.university || null,
    department: parsed.data.department || null,
  };
  if (existing) {
    const token = existing.verified ? null : (existing.verifyToken ?? randomUUID());
    await db.waitlistEntry.update({
      where: { email },
      data: {
        name: name || existing.name,
        role,
        state: state ?? existing.state,
        ...extra,
        niche: input.niche ?? existing.niche,
        consent: true,
        consentedAt: new Date(),
        ...(token ? { verifyToken: token } : {}),
      },
    });
    if (token) await sendVerifyEmail(email, name || existing.name || "", token);
    return { ok: true, already: true };
  }
  const token = randomUUID();
  await db.waitlistEntry.create({
    data: {
      email,
      name: name || null,
      role,
      state,
      ...extra,
      niche: input.niche ?? null,
      consent: true,
      consentedAt: new Date(),
      verifyToken: token,
    },
  });
  await sendVerifyEmail(email, name, token);
  return { ok: true, already: false };
}

/** Double opt-in email. Never blocks signup — logs and continues on failure. */
async function sendVerifyEmail(email: string, name: string, token: string): Promise<void> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/waitlist/verify?token=${token}`;
  try {
    await sendEmail({
      to: email,
      name: name || undefined,
      subject: "Confirm your IDEACON waitlist spot",
      html: `<p>Hi${name ? ` ${name}` : ""},</p>
<p>You're one click away from the IDEACON waitlist — Nigeria-first launch list for creators, companies and students.</p>
<p><a href="${url}">Confirm my spot</a></p>
<p>If you didn't request this, ignore this email.</p>`,
    });
  } catch (e) {
    console.error(`[waitlist] verify email failed for ${email}:`, e instanceof Error ? e.message : e);
  }
}

/** Broker/admin: list + invite flag. */
export async function waitlistCount(): Promise<number> {
  return db.waitlistEntry.count();
}
