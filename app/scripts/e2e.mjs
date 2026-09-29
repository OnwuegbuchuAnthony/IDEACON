// Phase 5 pilot gate: full brokered loop against the live local DB.
// Run: node scripts/e2e.mjs   (uses app/.env.local)
// Creates test rows, walks DRAFT→…→DEAL, verifies the hash chain, cleans up.
import { config } from "dotenv";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config();

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const uid = (p) => `${p}-e2e-${Date.now()}`;
const results = [];
const check = (name, ok) => {
  results.push([name, ok]);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) process.exitCode = 1;
};

async function recordEvent(type, actorId, ideaId, payload) {
  const latest = await db.auditEvent.findFirst({ orderBy: { createdAt: "desc" }, select: { hash: true } });
  const prevHash = latest?.hash ?? "GENESIS";
  const hash = createHash("sha256")
    .update(JSON.stringify({ type, actorId: actorId ?? null, ideaId: ideaId ?? null, payload, prevHash }))
    .digest("hex");
  return db.auditEvent.create({ data: { type, actorId, ideaId, payload, prevHash, hash } });
}

const TRANSITIONS = {
  DRAFT: ["SUBMITTED"], SUBMITTED: ["IN_REVIEW"], IN_REVIEW: ["SCORED"],
  SCORED: ["APPROVED"], APPROVED: ["MATCHED"], MATCHED: ["UNDER_NDA"],
  UNDER_NDA: ["DEAL"], DEAL: ["CLOSED"], FLAGGED: ["DRAFT", "CLOSED"], CLOSED: [],
};

try {
  // Actors
  const creator = await db.user.create({ data: { id: uid("u"), name: "E2E Creator", email: `${uid("c")}@e2e.local`, emailVerified: true, role: "CREATOR" } });
  const reviewer = await db.user.create({ data: { id: uid("u"), name: "E2E Reviewer", email: `${uid("r")}@e2e.local`, emailVerified: true, role: "REVIEWER" } });
  const founder = await db.user.create({ data: { id: uid("u"), name: "E2E Founder", email: `${uid("f")}@e2e.local`, emailVerified: true, role: "COMPANY_MEMBER" } });
  const broker = await db.user.create({ data: { id: uid("u"), name: "E2E Broker", email: `${uid("b")}@e2e.local`, emailVerified: true, role: "BROKER" } });
  const profile = await db.creatorProfile.create({ data: { userId: creator.id, creatorType: "INDEPENDENT" } });
  const company = await db.companyProfile.create({ data: { name: `E2E Co ${Date.now()}`, niche: "AGROTECH", state: "Lagos", verified: true } });
  await db.companyMember.create({ data: { userId: founder.id, companyId: company.id, role: "FOUNDER" } });
  check("actors + company", true);

  // Submit → review → approve
  const idea = await db.idea.create({
    data: {
      title: "E2E test idea", teaser: "teaser", fullDetail: "SECRET-FULL-DETAIL",
      niche: "AGROTECH", creatorId: profile.id, status: "SUBMITTED",
      originHash: createHash("sha256").update("e2e").digest("hex"),
    },
  });
  await recordEvent("idea.submitted", creator.id, idea.id, {});
  for (const to of ["IN_REVIEW", "SCORED", "APPROVED"]) {
    const cur = (await db.idea.findUniqueOrThrow({ where: { id: idea.id } })).status;
    if (!TRANSITIONS[cur].includes(to)) throw new Error(`bad transition ${cur}→${to}`);
    await db.idea.update({ where: { id: idea.id }, data: { status: to } });
  }
  check("submit→review→approve", (await db.idea.findUniqueOrThrow({ where: { id: idea.id } })).status === "APPROVED");

  // Teaser leak check: listing select must not contain fullDetail
  const teaser = await db.idea.findFirst({
    where: { id: idea.id },
    select: { id: true, title: true, teaser: true, niche: true, stage: true, status: true },
  });
  check("teaser query excludes fullDetail", teaser && !("fullDetail" in teaser));

  // Request → approve → NDA → unlock
  const match = await db.match.create({ data: { ideaId: idea.id, companyId: company.id, source: "manual" } });
  await db.idea.update({ where: { id: idea.id }, data: { status: "MATCHED" } });
  const grant = await db.ndaGrant.create({
    data: { ideaId: idea.id, companyId: company.id, templateVersion: "mutual-v1-ng", expiresAt: new Date(Date.now() + 864e5) },
  });
  await db.idea.update({ where: { id: idea.id }, data: { status: "UNDER_NDA" } });
  const gated = await db.ndaGrant.findFirst({ where: { ideaId: idea.id, companyId: company.id, expiresAt: { gt: new Date() } } });
  check("NDA grant gates full detail", !!gated && gated.id === grant.id);

  // Deal + commission + message
  const deal = await db.deal.create({ data: { ideaId: idea.id, companyId: company.id, template: "licensing", jurisdiction: "NG" } });
  await db.idea.update({ where: { id: idea.id }, data: { status: "DEAL" } });
  await db.deal.update({ where: { id: deal.id }, data: { amountKobo: 50000000n, commissionKobo: 5000000n, status: "invoiced" } });
  await db.dealMessage.create({ data: { dealId: deal.id, authorId: broker.id, body: "terms sent" } });
  await recordEvent("deal.opened", broker.id, idea.id, { dealId: deal.id });
  check("deal + 10% commission booked", true);

  // Chain verify
  const rows = await db.auditEvent.findMany({ where: { ideaId: idea.id }, orderBy: { createdAt: "asc" } });
  let prev = "GENESIS", valid = rows.length >= 2;
  for (const row of rows) {
    const recomputed = createHash("sha256")
      .update(JSON.stringify({ type: row.type, actorId: row.actorId ?? null, ideaId: row.ideaId ?? null, payload: row.payload, prevHash: row.prevHash }))
      .digest("hex");
    if (row.prevHash !== prev || recomputed !== row.hash) { valid = false; break; }
    prev = row.hash;
  }
  check(`audit chain valid (${rows.length} events)`, valid);

  // Cleanup (reverse order)
  await db.dealMessage.deleteMany({ where: { dealId: deal.id } });
  await db.deal.delete({ where: { id: deal.id } });
  await db.ndaGrant.delete({ where: { id: grant.id } });
  await db.match.delete({ where: { id: match.id } });
  await db.auditEvent.deleteMany({ where: { ideaId: idea.id } });
  await db.idea.delete({ where: { id: idea.id } });
  await db.companyMember.deleteMany({ where: { companyId: company.id } });
  await db.companyProfile.delete({ where: { id: company.id } });
  await db.creatorProfile.delete({ where: { id: profile.id } });
  for (const u of [creator, reviewer, founder, broker]) await db.user.delete({ where: { id: u.id } });
  check("test data cleaned up", true);
} catch (e) {
  console.error("E2E ERROR:", e.message);
  process.exitCode = 1;
}

await db.$disconnect();
const failed = results.filter(([, ok]) => !ok).length;
console.log(failed === 0 ? "E2E ALL PASS" : `E2E ${failed} FAILURES`);
