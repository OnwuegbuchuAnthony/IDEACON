// Client-safe: no server imports.
export const TIERS = {
  free: { label: "Free", priceNgn: 0, seats: 1, requestsPerMonth: 3 },
  starter: { label: "Starter", priceNgn: 25000, seats: 3, requestsPerMonth: 20 },
  growth: { label: "Growth", priceNgn: 90000, seats: 10, requestsPerMonth: 100 },
  enterprise: { label: "Enterprise", priceNgn: 0, seats: 999, requestsPerMonth: 999999 },
} as const;
export type TierName = keyof typeof TIERS;
