"use server";

import type { Niche } from "@prisma/client";
import { db } from "./db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public waitlist join. Idempotent per email (re-join updates profile). */
export async function joinWaitlistAction(input: {
  email: string;
  name?: string;
  kind?: string;
  niche?: Niche;
}): Promise<{ ok: true; already: boolean }> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address");
  const kind = input.kind === "company" ? "company" : "creator";

  const existing = await db.waitlistEntry.findUnique({ where: { email } });
  if (existing) {
    await db.waitlistEntry.update({
      where: { email },
      data: { name: input.name?.trim() || existing.name, kind, niche: input.niche ?? existing.niche },
    });
    return { ok: true, already: true };
  }
  await db.waitlistEntry.create({
    data: { email, name: input.name?.trim() || null, kind, niche: input.niche ?? null },
  });
  return { ok: true, already: false };
}

/** Broker/admin: list + invite flag. */
export async function waitlistCount(): Promise<number> {
  return db.waitlistEntry.count();
}
