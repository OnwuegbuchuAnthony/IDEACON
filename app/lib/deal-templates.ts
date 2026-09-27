// Client-safe: no server imports. Single source for deal template names.
export const DEAL_TEMPLATES = ["licensing", "revenue_share", "advisory", "custom"] as const;
export type DealTemplate = (typeof DEAL_TEMPLATES)[number];
