import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyChain } from "@/lib/audit";

/** Evidence pack: teaser-safe metadata + full hash-chained event trail. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
  const chainValid = await verifyChain(id);

  return NextResponse.json({ idea, chainValid, eventCount: events.length, events });
}
