"use server";

import { headers } from "next/headers";
import { z } from "zod";
import type { Niche } from "@prisma/client";
import { db } from "./db";
import { NIGERIAN_STATES } from "./nigerian-states";

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

/** Public waitlist join. Validated (zod), deduped by lowercase email, IP-capped. */
export async function joinWaitlistAction(input: {
  email: string;
  name?: string;
  role?: string;
  state?: string;
  university?: string;
  department?: string;
  niche?: Niche;
  consent?: boolean;
}): Promise<{ ok: true; already: boolean }> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!ipAllowed(ip)) throw new Error("Too many signups from this address — try again later");

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
      },
    });
    return { ok: true, already: true };
  }
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
    },
  });
  return { ok: true, already: false };
}

/** Broker/admin: list + invite flag. */
export async function waitlistCount(): Promise<number> {
  return db.waitlistEntry.count();
}
