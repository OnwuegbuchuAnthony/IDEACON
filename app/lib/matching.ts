import { db } from "./db";

export type RoleLens = "FOUNDER" | "RD_LEAD" | "PRODUCT_MANAGER" | "GENERAL";

/**
 * Match engine v2 (Phase 2 slice): role-aware ranking of APPROVED ideas
 * for a company. Transparent weights — no black box.
 *
 * - FOUNDER: rewards edge/stage-readiness + high originality (fast differentiation)
 * - RD_LEAD: rewards feasibility + scored evidence (defensible sourcing)
 * - PRODUCT_MANAGER: rewards problem-fit + marketFit band (gap-fit brief)
 */
const WEIGHTS: Record<RoleLens, { originality: number; feasibility: number; marketFit: number; stage: number; niche: number }> = {
  FOUNDER: { originality: 0.35, feasibility: 0.2, marketFit: 0.25, stage: 0.1, niche: 0.1 },
  RD_LEAD: { originality: 0.2, feasibility: 0.4, marketFit: 0.2, stage: 0.1, niche: 0.1 },
  PRODUCT_MANAGER: { originality: 0.2, feasibility: 0.2, marketFit: 0.4, stage: 0.1, niche: 0.1 },
  GENERAL: { originality: 0.3, feasibility: 0.3, marketFit: 0.3, stage: 0.05, niche: 0.05 },
};

const STAGE_SCORE: Record<string, number> = {
  "ready-to-scale": 9,
  prototype: 7,
  concept: 5,
};

export async function suggestMatches(input: {
  companyId: string;
  lens?: RoleLens;
  limit?: number;
}) {
  const lens = input.lens ?? "GENERAL";
  const w = WEIGHTS[lens];
  const company = await db.companyProfile.findUniqueOrThrow({ where: { id: input.companyId } });

  const ideas = await db.idea.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true, title: true, teaser: true, niche: true, stage: true,
      aiScores: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // NOTE: teaser fields only — full detail never enters the matcher output.
  return ideas
    .map((idea) => {
      const s = idea.aiScores[0];
      const o = s?.originality ?? 5;
      const f = s?.feasibility ?? 5;
      const m = s?.marketFit ?? 5;
      const fit =
        o * w.originality +
        f * w.feasibility +
        m * w.marketFit +
        (STAGE_SCORE[idea.stage] ?? 5) * w.stage +
        (idea.niche === company.niche ? 9 : 5) * w.niche;
      return {
        ideaId: idea.id,
        title: idea.title,
        teaser: idea.teaser,
        niche: idea.niche,
        stage: idea.stage,
        fit: Math.round(fit * 10) / 10,
        why: [
          `niche ${idea.niche === company.niche ? "matches" : "differs from"} ${company.niche}`,
          `stage ${idea.stage}`,
          s ? `bands O${o}/F${f}/M${m}` : "unscored baseline",
        ].join(" · "),
      };
    })
    .sort((a, b) => b.fit - a.fit)
    .slice(0, input.limit ?? 10);
}
