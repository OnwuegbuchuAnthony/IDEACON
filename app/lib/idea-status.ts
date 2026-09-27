import type { IdeaStatus } from "@prisma/client";

/** Canonical idea lifecycle. All transitions go through `canTransition`. */
export const IDEA_TRANSITIONS: Record<IdeaStatus, IdeaStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["IN_REVIEW", "DRAFT"],
  IN_REVIEW: ["SCORED", "FLAGGED"],
  SCORED: ["APPROVED", "FLAGGED"],
  APPROVED: ["MATCHED"],
  FLAGGED: ["DRAFT", "CLOSED"],
  MATCHED: ["UNDER_NDA", "APPROVED"],
  UNDER_NDA: ["DEAL", "MATCHED"],
  DEAL: ["CLOSED"],
  CLOSED: [],
};

export function canTransition(from: IdeaStatus, to: IdeaStatus): boolean {
  return IDEA_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: IdeaStatus, to: IdeaStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal idea transition: ${from} → ${to}`);
  }
}
