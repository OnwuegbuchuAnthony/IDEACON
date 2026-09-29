import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/me/export — NDPR/data-portability: everything the platform
 * holds about the signed-in user, as JSON.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as unknown as { id: string }).id;
  const [user, profile, memberships, votes] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.creatorProfile.findUnique({
      where: { userId },
      include: { ideas: { select: { id: true, title: true, status: true, createdAt: true } } },
    }),
    db.companyMember.findMany({
      where: { userId },
      include: { company: { select: { id: true, name: true } } },
    }),
    db.vote.findMany({ where: { userId }, select: { ideaId: true, value: true, createdAt: true } }),
  ]);
  const events = await db.auditEvent.findMany({
    where: { actorId: userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ exportedAt: new Date().toISOString(), user, profile, memberships, votes, events });
}
