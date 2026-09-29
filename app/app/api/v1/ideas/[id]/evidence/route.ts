import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiScope } from "@/lib/api-keys";
import { verifyChain } from "@/lib/audit";

/** GET /api/v1/ideas/:id/evidence — hash-chained trail for a teaser idea. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiScope(_req, "evidence:read");
  if ("error" in gate) return gate.error;

  const { id } = await params;
  const idea = await db.idea.findUnique({
    where: { id },
    select: { id: true, title: true, niche: true, stage: true, status: true, originHash: true, createdAt: true },
  });
  if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });

  const events = await db.auditEvent.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    idea,
    chainValid: await verifyChain(id),
    eventCount: events.length,
    events,
  });
}
