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

/**
 * LLM scoring via Groq (OpenAI-compatible chat API). Returns bands +
 * human-readable factors; every row is versioned with the exact model.
 * Throws when unconfigured so callers fall back to the heuristic.
 */
export async function scoreIdeaLlm(input: {
  title: string;
  teaser: string;
  fullDetail: string;
  stage: string;
}): Promise<ScoreBands> {
  const apiKey = process.env.GROQ_API_KEY ?? "";
  if (!apiKey) throw new Error("GROQ_API_KEY missing");
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You score startup ideas for an African innovation broker. Reply with ONLY a JSON object: " +
            '{"originality": 0-10, "feasibility": 0-10, "marketFit": 0-10, ' +
            '"factors": {"originality": "one sentence", "feasibility": "one sentence", "marketFit": "one sentence"}}. ' +
            "Be strict: vague ideas score under 5. Concrete mechanisms, evidence and clear beneficiaries score higher.",
        },
        {
          role: "user",
          content: `Title: ${input.title}\nStage: ${input.stage}\nTeaser: ${input.teaser}\nFull detail: ${input.fullDetail}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(text) as {
    originality: number;
    feasibility: number;
    marketFit: number;
    factors?: Record<string, string>;
  };
  const clamp = (n: unknown) =>
    Math.min(10, Math.max(0, Math.round(Number(n) * 10) / 10 || 0));
  return {
    originality: clamp(parsed.originality),
    feasibility: clamp(parsed.feasibility),
    marketFit: clamp(parsed.marketFit),
    factors: {
      originality: String(parsed.factors?.originality ?? "LLM assessment"),
      feasibility: String(parsed.factors?.feasibility ?? "LLM assessment"),
      marketFit: String(parsed.factors?.marketFit ?? "LLM assessment"),
    },
    model: `groq/${model}`,
  };
}

/** Run scoring for an idea, persist bands, move IN_REVIEW → SCORED. */
export async function runScoring(ideaId: string, actorId: string) {
  const idea = await db.idea.findUniqueOrThrow({ where: { id: ideaId } });
  const input = {
    title: idea.title,
    teaser: idea.teaser,
    fullDetail: idea.fullDetail,
    stage: idea.stage,
  };
  // LLM first (Groq), transparent heuristic fallback. Model recorded on every row.
  let bands: ScoreBands;
  try {
    bands = await scoreIdeaLlm(input);
  } catch (e) {
    console.warn("[scoring] LLM failed, heuristic fallback:", e instanceof Error ? e.message : e);
    bands = scoreIdeaHeuristic(input);
  }
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
