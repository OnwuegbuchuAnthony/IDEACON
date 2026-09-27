import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

function canonical(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Append-only audit writer. NEVER update/delete AuditEvent rows —
 * the hash chain (each row commits to the previous hash) is the
 * proof-of-origin backbone. UTC timestamps throughout.
 */
export async function recordEvent(input: {
  type: string;
  actorId?: string;
  ideaId?: string;
  payload?: Prisma.InputJsonValue;
}) {
  const latest = await db.auditEvent.findFirst({
    orderBy: { createdAt: "desc" },
    select: { hash: true },
  });
  const prevHash = latest?.hash ?? "GENESIS";
  const body = canonical({
    type: input.type,
    actorId: input.actorId ?? null,
    ideaId: input.ideaId ?? null,
    payload: input.payload ?? {},
    prevHash,
  });
  const hash = createHash("sha256").update(body).digest("hex");

  return db.auditEvent.create({
    data: {
      type: input.type,
      actorId: input.actorId,
      ideaId: input.ideaId,
      payload: input.payload ?? {},
      prevHash,
      hash,
    },
  });
}

/** Verify the chain for one idea. Returns false at the first broken link. */
export async function verifyChain(ideaId: string): Promise<boolean> {
  const rows = await db.auditEvent.findMany({
    where: { ideaId },
    orderBy: { createdAt: "asc" },
  });
  let prev = "GENESIS";
  for (const row of rows) {
    if (row.prevHash !== prev) return false;
    const recomputed = createHash("sha256")
      .update(
        canonical({
          type: row.type,
          actorId: row.actorId ?? null,
          ideaId: row.ideaId ?? null,
          payload: row.payload,
          prevHash: row.prevHash,
        }),
      )
      .digest("hex");
    if (recomputed !== row.hash) return false;
    prev = row.hash;
  }
  return true;
}
