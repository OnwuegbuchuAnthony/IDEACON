"use server";

import { redirect } from "next/navigation";
import type { CreatorType, Niche } from "@prisma/client";
import { db } from "./db";
import { requireUser, myCompanyId } from "./session";
import { recordEvent } from "./audit";

/** Personal basics: display name + avatar URL. */
export async function updatePersonalAction(form: { name: string; image: string }) {
  const user = await requireUser();
  const name = form.name.trim();
  if (!name) throw new Error("Name is required");
  await db.user.update({
    where: { id: user.id },
    data: { name, image: form.image.trim() || null },
  });
  await recordEvent({ type: "profile.updated", actorId: user.id, payload: { fields: ["name", "image"] } });
  redirect("/profile");
}

/** Creator bio: persona type + free-text bio. */
export async function updateCreatorAction(form: { creatorType: CreatorType; bio: string }) {
  const user = await requireUser();
  await db.creatorProfile.upsert({
    where: { userId: user.id },
    update: { creatorType: form.creatorType, bio: form.bio },
    create: { userId: user.id, creatorType: form.creatorType, bio: form.bio },
  });
  await recordEvent({ type: "profile.creator", actorId: user.id, payload: { creatorType: form.creatorType } });
  redirect("/profile");
}

/** Company card: name, niche, state, country. Members only. */
export async function updateCompanyAction(form: {
  companyId: string;
  name: string;
  niche: Niche;
  state: string;
  country: string;
}) {
  const user = await requireUser();
  const mine = await myCompanyId(user.id);
  if (mine !== form.companyId) throw new Error("Not a member of this company");
  const name = form.name.trim();
  if (!name) throw new Error("Company name is required");
  await db.companyProfile.update({
    where: { id: form.companyId },
    data: { name, niche: form.niche, state: form.state.trim() || null, country: form.country.trim() || "NG" },
  });
  await recordEvent({ type: "profile.company", actorId: user.id, payload: { companyId: form.companyId } });
  redirect("/profile");
}

/** Register an additional firm from the profile page (founder + free tier). */
export async function createCompanyAction(form: { name: string; niche: Niche; state: string }) {
  const user = await requireUser();
  const name = form.name.trim();
  if (!name) throw new Error("Company name is required");
  const company = await db.companyProfile.create({
    data: { name, niche: form.niche, state: form.state.trim() || null, verified: false },
  });
  await db.companyMember.create({ data: { userId: user.id, companyId: company.id, role: "FOUNDER" } });
  await db.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: { companyId: company.id, tier: "free" },
  });
  await db.user.update({ where: { id: user.id }, data: { role: "COMPANY_MEMBER" } });
  await recordEvent({ type: "company.registered", actorId: user.id, payload: { companyId: company.id, name } });
  redirect("/profile");
}
