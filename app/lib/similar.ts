import { db } from "./db";

/**
 * Phase 3 real similarity: pg_trgm trigram matching over title+teaser.
 * Returns teaser-safe rows (never fullDetail). Threshold 0.15 keeps
 * recall high on short teasers; same-niche results rank first.
 */
export type SimilarIdea = {
  id: string;
  title: string;
  teaser: string;
  niche: string;
  stage: string;
  sim: number;
};

export async function similarIdeas(ideaId: string, limit = 4): Promise<SimilarIdea[]> {
  const rows = await db.$queryRaw<SimilarIdea[]>`
    SELECT t.id, t.title, t.teaser, t.niche::text AS niche, t.stage,
           GREATEST(similarity(t.title, s.title), similarity(t.teaser, s.teaser)) AS sim
    FROM "Idea" t, "Idea" s
    WHERE s.id = ${ideaId}
      AND t.id <> s.id
      AND t.status = 'APPROVED'
      AND (similarity(t.title, s.title) > 0.15 OR similarity(t.teaser, s.teaser) > 0.15)
    ORDER BY (t.niche = s.niche) DESC, sim DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ ...r, sim: Number(r.sim) }));
}

/** Ranked text search for the catalog (trigram fallback when q is present). */
export async function searchTeasersRanked(q: string, limit = 20) {
  return db.$queryRaw<{ id: string }>`
    SELECT id FROM "Idea"
    WHERE status IN ('APPROVED', 'MATCHED', 'UNDER_NDA')
      AND (similarity(title, ${q}) > 0.1 OR similarity(teaser, ${q}) > 0.1
           OR title ILIKE ${`%${q}%`} OR teaser ILIKE ${`%${q}%`})
    ORDER BY GREATEST(similarity(title, ${q}), similarity(teaser, ${q})) DESC
    LIMIT ${limit};
  `;
}
