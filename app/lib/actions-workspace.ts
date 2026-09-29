"use server";

import { redirect } from "next/navigation";
import type { Niche } from "@prisma/client";
import { db } from "./db";
import { requireRole, requireUser, myCompanyId } from "./session";
import { markAllRead } from "./notifications";
import { recordEvent } from "./audit";

/** Save the current browse filter set for the caller's company. */
export async function saveSearchAction(input: {
  name: string;
  niche?: Niche;
  stage?: string;
  q?: string;
}) {
  const user = await requireRole("COMPANY_MEMBER", "BROKER", "ADMIN");
  const companyId = await myCompanyId(user.id);
  if (!companyId) throw new Error("Join or create a company profile first");
  await db.savedSearch.create({
    data: {
      companyId,
      name: input.name || "Untitled search",
      niche: input.niche ?? null,
      stage: input.stage || null,
      q: input.q || null,
    },
  });
  redirect("/dashboard");
}

export async function deleteSearchAction(id: string) {
  const user = await requireUser();
  const companyId = await myCompanyId(user.id);
  await db.savedSearch.deleteMany({ where: { id, companyId: companyId ?? "none" } });
  redirect("/dashboard");
}

export async function markInboxReadAction() {
  const user = await requireUser();
  await markAllRead(user.id);
  redirect("/notifications");
}

/** Attach an already-uploaded R2 key to an idea (owner or broker only). */
export async function attachFileAction(input: { ideaId: string; r2Key: string; fileName: string; mimeType: string; sizeBytes: number }) {
  const user = await requireUser();
  const idea = await db.idea.findUnique({
    where: { id: input.ideaId },
    include: { creator: { select: { userId: true } } },
  });
  if (!idea) throw new Error("Idea not found");
  if (idea.creator.userId !== user.id && !["BROKER", "ADMIN"].includes((user as { role?: string }).role ?? "")) {
    throw new Error("Only the owner or a broker can attach files");
  }
  await db.ideaFile.create({
    data: {
      ideaId: input.ideaId,
      r2Key: input.r2Key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    },
  });
  await recordEvent({ type: "idea.file", actorId: user.id, ideaId: input.ideaId, payload: { fileName: input.fileName } });
  redirect(`/ideas/${input.ideaId}`);
}

/** Admin: set a user's platform role. */
export async function setUserRoleAction(userId: string, role: string) {
  const admin = await requireRole("ADMIN");
  if (!["CREATOR", "COMPANY_MEMBER", "REVIEWER", "BROKER", "ADMIN"].includes(role)) {
    throw new Error("Unknown role");
  }
  await db.user.update({ where: { id: userId }, data: { role: role as "CREATOR" } });
  await recordEvent({ type: "admin.role", actorId: admin.id, payload: { userId, role } });
  redirect("/admin/users");
}

/** Admin: verify a company profile. */
export async function verifyCompanyAction(companyId: string, verified: boolean) {
  const admin = await requireRole("ADMIN");
  await db.companyProfile.update({ where: { id: companyId }, data: { verified } });
  await recordEvent({ type: "admin.verify", actorId: admin.id, payload: { companyId, verified } });
  redirect("/admin/users");
}
