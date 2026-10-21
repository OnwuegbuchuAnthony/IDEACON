import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiScope } from "@/lib/api-keys";
import { parseNiche } from "@/lib/niche";

/** GET /api/v1/ideas?niche=&stage=&q= — teaser-safe public catalog. */
export async function GET(req: Request) {
  const gate = await requireApiScope(req, "teasers:read");
  if ("error" in gate) return gate.error;

  const url = new URL(req.url);
  const niche = parseNiche(url.searchParams.get("niche"));
  const stage = url.searchParams.get("stage") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;

  const ideas = await db.idea.findMany({
    where: {
      status: { in: ["APPROVED", "MATCHED", "UNDER_NDA"] },
      ...(niche ? { niche } : {}),
      ...(stage ? { stage } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { teaser: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, title: true, teaser: true, niche: true, stage: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: ideas });
}
