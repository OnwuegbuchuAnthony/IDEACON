// Phase 1 demo seed: 8 teasers across 4 niches + company + university.
// Run: node prisma/seed.mjs   (DATABASE_URL from app/.env.local)
// Real logins: sign up in the app, then `node prisma/promote.mjs <email> <reviewer|broker|admin|company>`
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config();

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const IDEAS = [
  ["HEALTHTECH", "concept", "USSD triage assistant for rural clinics",
    "Nurse-led clinics route patients 3x faster with an offline-first USSD symptom checklist in English, Hausa and Yoruba.",
    "Full protocol: 42-symptom decision tree, escalation thresholds, SMS referral slips, pilot plan for 6 PHCs in Ogun. Needs a diagnostics partner for validation.",
    "triage"],
  ["HEALTHTECH", "prototype", "Solar vaccine cold-box with SMS alerts",
    "Keeps vaccines at 2–8°C for 72h off-grid; texts the officer when temperature drifts. Built sensor rig, 2 field tests done.",
    "Full detail: Peltier + phase-change design, Arduino firmware, BoM ₦185k, test logs from 2 clinics, failure analysis. Seeking medtech manufacturer.",
    "cold-chain"],
  ["AGROTECH", "prototype", "Solar cold-box for tomato transport",
    "Cuts post-harvest tomato loss on long-haul Kano–Lagos routes without grid power. Uniqueness high, multi-state scaling.",
    "Full design: 400L insulated chamber, 300W solar + thermal battery, loading procedure, cost per trip model, 3 transporter interviews. Needs agro-processor pilot.",
    "post-harvest loss"],
  ["AGROTECH", "concept", "Soil-moisture voice alerts for smallholders",
    "Low-cost capacitive sensors text farmers in Hausa when to irrigate. 30% water saving in dry-season rice, per bench tests.",
    "Full detail: sensor schematic, GSM module firmware, per-hectare costing, 12-farmer interview notes. Seeking input supplier.",
    "irrigation"],
  ["FINTECH", "concept", "USSD micro-credit scoring for market traders",
    "Alternative credit signal from daily market-ledger activity for traders without bank history. Model sketch + sample ledger data dictionary.",
    "Full spec: feature list (turnover velocity, stall tenure, group guarantees), scoring weights v0, bias review, MFB integration plan. Needs microfinance pilot.",
    "credit scoring"],
  ["FINTECH", "prototype", "POS fraud-tripwire for agents",
    "Flags SIM-swap and velocity anomalies on agency-banking terminals in under 60 seconds. Rule engine + dashboard demo ready.",
    "Full detail: detection rules, false-positive tuning results (2.1%), agent rollout guide, API spec. Seeking bank or switch partner.",
    "fraud prevention"],
  ["BUSINESS", "concept", "Returnable crate network for FMCG last-mile",
    "Shared, trackable crates cut packaging cost 40% for Lagos distributors. Deposit + QR return loop, hub design included.",
    "Full detail: crate spec, deposit economics, hub staffing model, 5-distributor LOI pipeline. Seeking logistics operator.",
    "packaging cost"],
  ["BUSINESS", "ready-to-scale", "Solar dryer franchise for pepper processors",
    "Cabinet dryers + franchise playbook already running in 3 Kano clusters. Unit economics proven, 11-month payback.",
    "Full detail: dryer BoM, franchise agreement draft, training manual, 18 months of throughput data. Seeking scale-up capital/partner.",
    "processing efficiency"],
];

async function main() {
  const bot = await db.user.upsert({
    where: { email: "seed-bot@ideacon.local" },
    update: {},
    create: { id: "seed-bot", name: "Seed Bot", email: "seed-bot@ideacon.local", emailVerified: true, role: "BROKER" },
  });
  let profile = await db.creatorProfile.findUnique({ where: { userId: bot.id } });
  if (!profile) {
    profile = await db.creatorProfile.create({ data: { userId: bot.id, creatorType: "EXPERT" } });
  }
  await db.universityPartner.upsert({
    where: { id: "unilag-hub" },
    update: {},
    create: { id: "unilag-hub", name: "UNILAG Innovation Hub", state: "Lagos" },
  });
  await db.companyProfile.upsert({
    where: { id: "kano-foods" },
    update: {},
    create: { id: "kano-foods", name: "Kano Foods Ltd", niche: "AGROTECH", state: "Kano", verified: true },
  });

  for (const [niche, stage, title, teaser, full, problem] of IDEAS) {
    const exists = await db.idea.findFirst({ where: { title } });
    if (exists) continue;
    const { createHash } = await import("node:crypto");
    await db.idea.create({
      data: {
        title, teaser, fullDetail: full, niche, stage, problemType: problem,
        status: "APPROVED", creatorId: profile.id,
        originHash: createHash("sha256").update(title + full).digest("hex"),
      },
    });
  }
  console.log("seed done");
}

await main();
await db.$disconnect();
