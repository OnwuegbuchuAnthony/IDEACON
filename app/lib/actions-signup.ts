"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { requireUser } from "./session";
import { recordEvent } from "./audit";

/**
 * Completes signup right after Better Auth creates the user:
 * - creator → CREATOR role + creator profile
 * - company → COMPANY_MEMBER role + CompanyProfile (unverified) +
 *   founder membership + free subscription
 */
export async function completeSignupAction(input: {
  kind: "creator" | "company";
  companyName?: string;
}) {
  const user = await requireUser();

  if (input.kind === "company") {
    const name = (input.companyName ?? "").trim();
    if (!name) throw new Error("Company name is required");
    await db.user.update({ where: { id: user.id }, data: { role: "COMPANY_MEMBER" } });
    const company = await db.companyProfile.create({ data: { name, verified: false } });
    await db.companyMember.create({
      data: { userId: user.id, companyId: company.id, role: "FOUNDER", verified: true },
    });
    await db.subscription.create({ data: { companyId: company.id, tier: "free" } });
    await recordEvent({
      type: "company.registered",
      actorId: user.id,
      payload: { companyId: company.id, name },
    });
    // Firms opt into a paid tier immediately: verified gold badge on success.
    redirect("/pricing?new=company");
  } else {
    await db.user.update({ where: { id: user.id }, data: { role: "CREATOR" } });
    await db.creatorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, creatorType: "CASUAL" },
    });
    await recordEvent({ type: "creator.registered", actorId: user.id, payload: {} });
  }
  redirect("/onboarding");
}
