import { db } from "./db";
import { recordEvent } from "./audit";
import { transitionIdea } from "./ideas";
import type { DealTemplate } from "./deal-templates";

export type { DealTemplate };

const NDA_DAYS = 14;

/** Broker approves a match → idea becomes MATCHED (visible to that company as teasable). */
export async function approveMatch(matchId: string, actorId: string) {
  const match = await db.match.findUniqueOrThrow({ where: { id: matchId } });
  await transitionIdea(match.ideaId, "MATCHED", actorId);
  await recordEvent({
    type: "match.approved",
    actorId,
    ideaId: match.ideaId,
    payload: { matchId, companyId: match.companyId },
  });
  return match;
}

/** Company click-to-sign → time-boxed NDA grant + audit. */
export async function signNda(input: {
  ideaId: string;
  companyId: string;
  actorId: string;
  signerName: string;
  templateVersion?: string;
}) {
  const grant = await db.ndaGrant.create({
    data: {
      ideaId: input.ideaId,
      companyId: input.companyId,
      templateVersion: input.templateVersion ?? "mutual-v1",
      expiresAt: new Date(Date.now() + NDA_DAYS * 24 * 3600 * 1000),
    },
  });
  // Best-effort: move MATCHED/APPROVED → UNDER_NDA (skip if already there).
  try {
    const idea = await db.idea.findUniqueOrThrow({ where: { id: input.ideaId } });
    if (idea.status === "MATCHED" || idea.status === "APPROVED") {
      await transitionIdea(input.ideaId, "UNDER_NDA", input.actorId);
    }
  } catch {
    /* already UNDER_NDA — grant still valid */
  }
  await recordEvent({
    type: "nda.signed",
    actorId: input.actorId,
    ideaId: input.ideaId,
    payload: {
      companyId: input.companyId,
      signerName: input.signerName,
      grantId: grant.id,
    },
  });
  return grant;
}

/** Broker opens a deal from an NDA-covered match using a standard template. */
export async function createDeal(input: {
  ideaId: string;
  companyId: string;
  template: DealTemplate;
  actorId: string;
}) {
  const grant = await db.ndaGrant.findFirst({
    where: {
      ideaId: input.ideaId,
      companyId: input.companyId,
      expiresAt: { gt: new Date() },
    },
  });
  if (!grant) throw new Error("A valid NDA grant is required before opening a deal");

  const deal = await db.deal.create({
    data: { ideaId: input.ideaId, companyId: input.companyId, template: input.template },
  });
  await transitionIdea(input.ideaId, "DEAL", input.actorId);
  await recordEvent({
    type: "deal.opened",
    actorId: input.actorId,
    ideaId: input.ideaId,
    payload: { dealId: deal.id, template: input.template },
  });
  return deal;
}

/** Broker-mediated message. No direct creator↔company channel exists by design. */
export async function postDealMessage(input: {
  dealId: string;
  authorId: string;
  body: string;
}) {
  const message = await db.dealMessage.create({
    data: { dealId: input.dealId, authorId: input.authorId, body: input.body },
  });
  const deal = await db.deal.findUniqueOrThrow({ where: { id: input.dealId } });
  await recordEvent({
    type: "deal.message",
    actorId: input.authorId,
    ideaId: deal.ideaId,
    payload: { dealId: input.dealId, messageId: message.id },
  });
  return message;
}
