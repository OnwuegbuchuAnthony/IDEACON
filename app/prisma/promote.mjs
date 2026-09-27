// Promote a signed-up user: node prisma/promote.mjs <email> <creator|reviewer|broker|admin> [company:<Company Name>]
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config();

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const [email, roleArg, companyArg] = process.argv.slice(2);
if (!email || !roleArg) {
  console.log("usage: node prisma/promote.mjs <email> <creator|reviewer|broker|admin> [company:<Name>]");
  process.exit(1);
}

const ROLE = { creator: "CREATOR", reviewer: "REVIEWER", broker: "BROKER", admin: "ADMIN" }[roleArg.toLowerCase()];
if (!ROLE) throw new Error("bad role");

const user = await db.user.update({ where: { email }, data: { role: ROLE } });

if (companyArg?.startsWith("company:")) {
  const name = companyArg.slice("company:".length);
  let company = await db.companyProfile.findFirst({ where: { name } });
  if (!company) company = await db.companyProfile.create({ data: { name, verified: true } });
  await db.companyMember.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: { role: "FOUNDER" },
    create: { userId: user.id, companyId: company.id, role: "FOUNDER" },
  });
  console.log(`member of ${company.name}`);
}
console.log(`${email} → ${ROLE}`);
await db.$disconnect();
