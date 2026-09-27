"use server";

import { redirect } from "next/navigation";
import type { IdeaStatus, Niche } from "@prisma/client";
import { db } from "./db";
import { requireRole, requireUser, myCompanyId } from "./session";
import { submitIdea, requestAccess, transitionIdea } from "./ideas";
import { runScoring } from "./scoring";
import { approveMatch, signNda, createDeal, postDealMessage, type DealTemplate } from "./deals";
import { recordEvent } from "./audit";

/** Ensure the caller has a creator profile (creates a stub on first submit). */
async function myCreatorProfile(userId: string) {
  let profile = await db.creatorProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await db.creatorProfile.create({
      data: { userId, creatorType: "CASUAL" },
    });
  }
  return profile;
}

export async function submitIdeaAction(form: {
  title: string;
  teaser: string;
  fullDetail: string;
  niche: Niche;
  problemType: string;
  stage: string;
}) {
  const user = await requireUser();
  const profile = await myCreatorProfile(user.id);
  const idea = await submitIdea({
    creatorProfileId: profile.id,
    actorId: user.id,
    ...form,
  });
  // Creators submit straight into the review pipeline.
  await transitionIdea(idea.id, "IN_REVIEW", user.id);
  redirect(`/ideas/${idea.id}`);
}

export async function requestAccessAction(ideaId: string) {
  const user = await requireRole("COMPANY_MEMBER", "BROKER", "ADMIN");
  const companyId = await myCompanyId(user.id);
  if (!companyId) throw new Error("Join or create a company profile first");
  await requestAccess({ ideaId, companyId, actorId: user.id });
  redirect(`/ideas/${ideaId}`);
}

export async function runScoringAction(ideaId: string) {
  const user = await requireRole("REVIEWER", "BROKER", "ADMIN");
  await runScoring(ideaId, user.id);
  redirect("/review");
}

export async function reviewAction(input: {
  ideaId: string;
  originality: number;
  feasibility: number;
  marketFit: number;
  verdict: "approve" | "flag" | "request-changes";
  note: string;
}) {
  const user = await requireRole("REVIEWER", "BROKER", "ADMIN");
  await db.review.create({
    data: {
      ideaId: input.ideaId,
      reviewerId: user.id,
      originality: input.originality,
      feasibility: input.feasibility,
      marketFit: input.marketFit,
      verdict: input.verdict,
      note: input.note || null,
    },
  });
  await recordEvent({
    type: "review.verdict",
    actorId: user.id,
    ideaId: input.ideaId,
    payload: { verdict: input.verdict },
  });
  if (input.verdict === "approve") {
    await transitionIdea(input.ideaId, "APPROVED", user.id);
  } else if (input.verdict === "flag") {
    await transitionIdea(input.ideaId, "FLAGGED", user.id);
  }
  redirect("/review");
}

export async function setIdeaStatusAction(ideaId: string, to: IdeaStatus) {
  const user = await requireRole("REVIEWER", "BROKER", "ADMIN");
  await transitionIdea(ideaId, to, user.id);
  redirect("/review");
}

export async function approveMatchAction(matchId: string) {
  const user = await requireRole("BROKER", "ADMIN");
  await approveMatch(matchId, user.id);
  redirect("/broker");
}

export async function signNdaAction(input: {
  ideaId: string;
  signerName: string;
}) {
  const user = await requireRole("COMPANY_MEMBER", "BROKER", "ADMIN");
  const companyId = await myCompanyId(user.id);
  if (!companyId) throw new Error("Join or create a company profile first");
  await signNda({ ideaId: input.ideaId, companyId, actorId: user.id, signerName: input.signerName });
  redirect(`/ideas/${input.ideaId}`);
}

export async function createDealAction(input: {
  ideaId: string;
  companyId: string;
  template: DealTemplate;
}) {
  const user = await requireRole("BROKER", "ADMIN");
  const deal = await createDeal({ ...input, actorId: user.id });
  redirect(`/deals/${deal.id}`);
}

export async function postMessageAction(input: { dealId: string; body: string }) {
  const user = await requireUser();
  await postDealMessage({ dealId: input.dealId, authorId: user.id, body: input.body });
  redirect(`/deals/${input.dealId}`);
}
