import type { Niche } from "@prisma/client";

/** Canonical niche values, matching the Prisma `Niche` enum. */
export const NICHES = [
  "HEALTHTECH",
  "AGROTECH",
  "FINTECH",
  "BUSINESS",
  "OTHER",
] as const;

export type NicheValue = (typeof NICHES)[number];

/**
 * Parse an untrusted niche value into a valid enum member.
 * Returns undefined for anything that is not a known niche, so unvalidated
 * user input never reaches Prisma (an invalid enum value throws at query
 * time and breaks the page).
 */
export function parseNiche(value: unknown): Niche | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim().toUpperCase();
  return (NICHES as readonly string[]).includes(v) ? (v as Niche) : undefined;
}
