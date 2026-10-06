// Groq tryout: scores the highest-potential local idea via the production prompt.
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config();

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

const idea = await db.idea.findFirst({
  where: { status: "APPROVED" },
  orderBy: { createdAt: "asc" },
});
if (!idea) throw new Error("no approved ideas");

const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You score startup ideas for an African innovation broker. Reply with ONLY a JSON object: " +
          '{"originality": 0-10, "feasibility": 0-10, "marketFit": 0-10, ' +
          '"factors": {"originality": "one sentence", "feasibility": "one sentence", "marketFit": "one sentence"}}. ' +
          "Be strict: vague ideas score under 5. Concrete mechanisms, evidence and clear beneficiaries score higher.",
      },
      {
        role: "user",
        content: `Title: ${idea.title}\nStage: ${idea.stage}\nTeaser: ${idea.teaser}\nFull detail: ${idea.fullDetail}`,
      },
    ],
  }),
});
if (!res.ok) throw new Error(`Groq ${res.status}`);
const body = await res.json();
const bands = JSON.parse(body.choices[0].message.content);
console.log(`idea: ${idea.title}`);
console.log(`model: groq/${MODEL}`);
console.log(`originality=${bands.originality} feasibility=${bands.feasibility} marketFit=${bands.marketFit}`);
console.log(`why-o: ${bands.factors.originality}`);
console.log(`why-f: ${bands.factors.feasibility}`);
console.log(`why-m: ${bands.factors.marketFit}`);
await db.$disconnect();
