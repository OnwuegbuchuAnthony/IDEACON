import { db } from "./db";
import { transitionIdea } from "./ideas";
import { recordEvent } from "./audit";

export type ScoreBands = {
  originality: number;
  feasibility: number;
  marketFit: number;
  factors: Record<string, string>;
  model: string;
};

/**
 * Scoring worker v1 — transparent heuristic baseline, versioned as
 * "heuristic-v0". Every band ships with human-readable factors, and the
 * review board always overrides. Swap the body for an LLM call later
 * without changing callers; bump `model` when you do.
 */
export function scoreIdeaHeuristic(input: {
  title: string;
  teaser: string;
  fullDetail: string;
  stage: string;
}): ScoreBands {
  const text = `${input.title}\n${input.teaser}\n${input.fullDetail}`;
  const words = text.split(/\s+/).filter(Boolean).length;
  const factors: Record<string, string> = {};

  // Originality: specificity signals (numbers, mechanisms, named parts).
  const specificTokens = (text.match(/[0-9]+[%x×]|phase|valve|sensor|alloy|protocol|dosage/gi) ?? []).length;
  const originality = Math.min(9.5, Math.max(4, 5 + specificTokens * 0.4 + (words > 150 ? 1 : 0)));
  factors.originality =
    words > 150 ? "Detailed write-up with concrete mechanisms" : "Short write-up — ask for mechanisms, measurements, parts";

  // Feasibility: prototype/stage + constraint mentions.
  const stageBoost = input.stage === "ready-to-scale" ? 1.5 : input.stage === "prototype" ? 1 : 0;
  const constraintMentions = (text.match(/cost|power|material|regulation|pilot|test/gi) ?? []).length;
  const feasibility = Math.min(9.5, Math.max(3.5, 5 + stageBoost + Math.min(2, constraintMentions * 0.3)));
  factors.feasibility =
    constraintMentions > 2 ? "Constraints (cost/power/materials) addressed" : "Constraints not yet addressed";

  // Market fit: problem + beneficiary + scale language.
  const marketTokens = (text.match(/market|user|customer|farmer|clinic|bank|SME|scale|deployment/gi) ?? []).length;
  const marketFit = Math.min(9.5, Math.max(3.5, 4.5 + Math.min(3.5, marketTokens * 0.35)));
  factors.marketFit =
    marketTokens > 4 ? "Clear beneficiary and scale path" : "Beneficiary/scale path needs sharpening";

  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    originality: round(originality),
    feasibility: round(feasibility),
    marketFit: round(marketFit),
    factors,
    model: "heuristic-v0",
  };
}

/** Run scoring for an idea, persist bands, move IN_REVIEW → SCORED. */
export async function runScoring(ideaId: string, actorId: string) {
  const idea = await db.idea.findUniqueOrThrow({ where: { id: ideaId } });
  const bands = scoreIdeaHeuristic({
    title: idea.title,
    teaser: idea.teaser,
    fullDetail: idea.fullDetail,
    stage: idea.stage,
  });
  await db.aiScore.create({
    data: {
      ideaId,
      originality: bands.originality,
      feasibility: bands.feasibility,
      marketFit: bands.marketFit,
      factors: bands.factors,
      model: bands.model,
    },
  });
  await recordEvent({
    type: "idea.scored",
    actorId,
    ideaId,
    payload: { ...bands },
  });
  if (idea.status === "IN_REVIEW") {
    await transitionIdea(ideaId, "SCORED", actorId);
  }
  return bands;
}
