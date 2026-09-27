"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { requireRole, requireUser } from "./session";
import { TIERS, bookDealValue, type TierName } from "./billing";
import { sendEmail } from "./email";
import { suggestMatches } from "./matching";
import { recordEvent } from "./audit";

/** Broker sets a company's subscription tier (manual invoicing in v1). */
export async function setTierAction(companyId: string, tier: TierName) {
  const user = await requireRole("BROKER", "ADMIN");
  if (!TIERS[tier]) throw new Error("Unknown tier");
  await db.subscription.upsert({
    where: { companyId },
    update: { tier, seats: TIERS[tier].seats, status: "active" },
    create: { companyId, tier, seats: TIERS[tier].seats },
  });
  await recordEvent({
    type: "subscription.tier",
    actorId: user.id,
    payload: { companyId, tier, priceNgn: TIERS[tier].priceNgn },
  });
  redirect("/broker");
}

/** Broker books deal value + commission ledger entry. */
export async function bookDealAction(dealId: string, amountNaira: number) {
  const user = await requireRole("BROKER", "ADMIN");
  if (!Number.isFinite(amountNaira) || amountNaira <= 0) throw new Error("Invalid amount");
  await bookDealValue(dealId, BigInt(Math.round(amountNaira * 100)), user.id);
  redirect(`/deals/${dealId}`);
}

/** Broker books deal value in a chosen currency (NGN default, USD supported). */
export async function bookDealCurrencyAction(dealId: string, amountMajor: number, currency: string) {
  const user = await requireRole("BROKER", "ADMIN");
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) throw new Error("Invalid amount");
  if (!["NGN", "USD"].includes(currency)) throw new Error("Unsupported currency");
  const { bookDealValueIn } = await import("./billing");
  await bookDealValueIn(dealId, BigInt(Math.round(amountMajor * 100)), currency, user.id);
  redirect(`/deals/${dealId}`);
}

/** Broker/creator publishes a case study (trust engine). */
export async function publishCaseStudyAction(form: {
  title: string;
  body: string;
  company: string;
}) {
  const user = await requireRole("BROKER", "ADMIN");
  await db.caseStudy.create({
    data: { title: form.title, body: form.body, company: form.company || null, published: true },
  });
  await recordEvent({ type: "casestudy.published", actorId: user.id, payload: { title: form.title } });
  redirect("/trust");
}

/** University ambassador bulk intake: one idea title per line → drafts. */
export async function bulkIntakeAction(form: { universityId: string; lines: string }) {
  const user = await requireUser();
  const titles = form.lines.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 50);
  if (titles.length === 0) throw new Error("No titles provided");
  let profile = await db.creatorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await db.creatorProfile.create({
      data: { userId: user.id, creatorType: "STUDENT", universityId: form.universityId },
    });
  }
  for (const title of titles) {
    const idea = await db.idea.create({
      data: {
        title,
        teaser: "Bulk intake via university ambassador — teaser pending.",
        fullDetail: "Pending full write-up.",
        creatorId: profile.id,
        status: "DRAFT",
      },
    });
    await recordEvent({
      type: "idea.intake",
      actorId: user.id,
      ideaId: idea.id,
      payload: { universityId: form.universityId, title },
    });
  }
  redirect("/browse");
}

/** Broker-triggered match digest emails to verified companies. */
export async function sendDigestsAction() {
  const user = await requireRole("BROKER", "ADMIN");
  const companies = await db.companyProfile.findMany({
    where: { verified: true },
    include: { members: { select: { user: { select: { email: true, name: true } } }, take: 3 } },
  });
  let sent = 0;
  for (const company of companies) {
    const top = await suggestMatches({ companyId: company.id, limit: 3 });
    if (top.length === 0) continue;
    const lines = top.map((t) => `• ${t.title} (${t.fit} fit) — ${t.why}`).join("\n");
    for (const m of company.members) {
      await sendEmail({
        to: m.user.email,
        subject: `Fresh IDEACON matches for ${company.name}`,
        html: `<p>Hi ${m.user.name},</p><p>Top fits this week:</p><pre>${lines}</pre>`,
      });
      sent++;
    }
  }
  await recordEvent({ type: "digest.sent", actorId: user.id, payload: { emails: sent } });
  redirect("/broker");
}
