import { db } from "./db";

/**
 * Phase 3 community voting. Anti-gaming stack:
 * 1. Verified email only (unverified users can't vote).
 * 2. One vote per user per idea (DB unique constraint; repeat = change vote).
 * 3. Daily cap (20 votes/day/user) — slows brigading.
 * 4. Reviewer/broker/admin votes weigh 3x in the public score.
 */
export const VOTES_PER_DAY = 20;
export const REVIEWER_WEIGHT = 3;

const STAFF_ROLES = ["REVIEWER", "BROKER", "ADMIN"];

export async function castVote(input: { ideaId: string; userId: string; value: 1 | -1 }) {
  const user = await db.user.findUniqueOrThrow({ where: { id: input.userId } });
  if (!user.emailVerified) throw new Error("Verify your email before voting");

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const today = await db.vote.count({ where: { userId: input.userId, createdAt: { gte: since } } });
  const already = await db.vote.findUnique({
    where: { ideaId_userId: { ideaId: input.ideaId, userId: input.userId } },
  });
  if (!already && today >= VOTES_PER_DAY) {
    throw new Error(`Daily vote limit reached (${VOTES_PER_DAY})`);
  }

  return db.vote.upsert({
    where: { ideaId_userId: { ideaId: input.ideaId, userId: input.userId } },
    update: { value: input.value },
    create: { ideaId: input.ideaId, userId: input.userId, value: input.value },
  });
}

/** Weighted community score: staff votes count 3x. */
export async function communityScore(ideaId: string): Promise<{ score: number; count: number }> {
  const votes = await db.vote.findMany({
    where: { ideaId },
    include: { user: { select: { role: true } } },
  });
  let score = 0;
  for (const v of votes) {
    score += v.value * (STAFF_ROLES.includes(v.user.role) ? REVIEWER_WEIGHT : 1);
  }
  return { score, count: votes.length };
}
