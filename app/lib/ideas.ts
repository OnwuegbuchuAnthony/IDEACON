import { createHash } from "node:crypto";
import { db } from "./db";
import { recordEvent } from "./audit";
import { assertTransition } from "./idea-status";
import type { IdeaStatus, Niche } from "@prisma/client";

/**
 * Idea write paths. INVARIANT: fullDetail is never selected for
 * catalog/listing queries — see listTeasers select clause below.
 */

export async function submitIdea(input: {
  creatorProfileId: string;
  actorId: string;
  title: string;
  teaser: string;
  fullDetail: string;
  niche: Niche;
  problemType?: string;
  stage?: string;
}) {
  const originHash = createHash("sha256")
    .update(`${input.title}\n${input.fullDetail}\n${Date.now()}`)
    .digest("hex");

  const idea = await db.idea.create({
    data: {
      title: input.title,
      teaser: input.teaser,
      fullDetail: input.fullDetail,
      niche: input.niche,
      problemType: input.problemType ?? null,
      stage: input.stage ?? "concept",
      status: "SUBMITTED",
      creatorId: input.creatorProfileId,
      originHash,
    },
  });
  await recordEvent({
    type: "idea.submitted",
    actorId: input.actorId,
    ideaId: idea.id,
    payload: { title: input.title, niche: input.niche, originHash },
  });
  return idea;
}

export type TeaserFilters = {
  niche?: Niche;
  problemType?: string;
  stage?: string;
  q?: string;
};

/** Public catalog — returns teasers ONLY. fullDetail is never selected. */
export async function listTeasers(filters: TeaserFilters) {
  return db.idea.findMany({
    where: {
      status: { in: ["APPROVED", "MATCHED", "UNDER_NDA"] },
      ...(filters.niche ? { niche: filters.niche } : {}),
      ...(filters.stage ? { stage: filters.stage } : {}),
      ...(filters.problemType
        ? { problemType: { contains: filters.problemType, mode: "insensitive" } }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { teaser: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      teaser: true,
      niche: true,
      problemType: true,
      stage: true,
      status: true,
      createdAt: true,
      aiScores: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { originality: true, feasibility: true, marketFit: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Detail view. Returns fullDetail + files ONLY when the caller's company
 * holds a valid (unexpired) NDA grant. Otherwise teaser + lock state.
 */
export async function getIdeaDetail(
  ideaId: string,
  companyId: string | null,
  viewerUserId?: string,
) {
  const idea = await db.idea.findUnique({
    where: { id: ideaId },
    include: {
      creator: { select: { userId: true } },
      aiScores: { orderBy: { createdAt: "desc" }, take: 1 },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          verdict: true,
          originality: true,
          feasibility: true,
          marketFit: true,
          version: true,
          createdAt: true,
        },
      },
    },
  });
  if (!idea) return null;

  let grant = null;
  if (companyId) {
    grant = await db.ndaGrant.findFirst({
      where: { ideaId, companyId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  }

  const { fullDetail, creator, ...rest } = idea;
  const isOwner = viewerUserId != null && creator.userId === viewerUserId;
  if (isOwner || grant) {
    const files = await db.ideaFile.findMany({
      where: { ideaId },
      select: { id: true, fileName: true, mimeType: true, sizeBytes: true },
    });
    return { ...rest, fullDetail, files, unlocked: true, grant };
  }
  return { ...rest, fullDetail: null, files: [], unlocked: false, grant: null };
}

/** Company requests access → creates a broker-queue match entry. */
export async function requestAccess(input: {
  ideaId: string;
  companyId: string;
  actorId: string;
}) {
  const existing = await db.match.findFirst({
    where: { ideaId: input.ideaId, companyId: input.companyId },
  });
  if (existing) return existing;

  const match = await db.match.create({
    data: {
      ideaId: input.ideaId,
      companyId: input.companyId,
      source: "manual",
    },
  });
  await recordEvent({
    type: "match.requested",
    actorId: input.actorId,
    ideaId: input.ideaId,
    payload: { companyId: input.companyId, matchId: match.id },
  });
  return match;
}

/** Guarded status transition + audit. */
export async function transitionIdea(
  ideaId: string,
  to: IdeaStatus,
  actorId: string,
) {
  const idea = await db.idea.findUniqueOrThrow({ where: { id: ideaId } });
  assertTransition(idea.status, to);
  const updated = await db.idea.update({
    where: { id: ideaId },
    data: { status: to },
  });
  await recordEvent({
    type: "idea.status",
    actorId,
    ideaId,
    payload: { from: idea.status, to },
  });
  return updated;
}
