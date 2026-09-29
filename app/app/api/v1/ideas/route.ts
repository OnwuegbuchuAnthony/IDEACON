import { NextResponse } from "next/server";
import type { Niche } from "@prisma/client";
import { db } from "@/lib/db";
import { requireApiScope } from "@/lib/api-keys";

/** GET /api/v1/ideas?niche=&stage=&q= — teaser-safe public catalog. */
export async function GET(req: Request) {
  const gate = await requireApiScope(req, "teasers:read");
  if ("error" in gate) return gate.error;

  const url = new URL(req.url);
  const niche = url.searchParams.get("niche") ?? undefined;
  const stage = url.searchParams.get("stage") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;

  const ideas = await db.idea.findMany({
    where: {
      status: { in: ["APPROVED", "MATCHED", "UNDER_NDA"] },
      ...(niche ? { niche: niche as Niche } : {}),
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
