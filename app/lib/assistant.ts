import { db } from "./db";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the IDEACON assistant (Idea + Connection), a platform that links novel ideas to industries.
Facts you must use:
- Creators (inventors, public, experts, students) SUBMIT ideas as public teasers; full detail is locked behind NDA.
- Companies (founders, R&D leads, product managers) BROWSE teasers by niche (HealthTech, AgroTech, FinTech, Business), stage and problem; they REQUEST ACCESS, a broker approves, they SIGN an NDA (14 days), then a brokered DEAL follows (licensing / revenue-share / advisory).
- There is NO open chat between creators and companies — everything is broker-mediated.
- Pricing: free tier, paid starter/growth via Paystack, enterprise assisted. Nigeria-first (Lagos, Abuja, Rivers, Kano, Ogun).
- Relevant ideas are appended below when available — cite them by title and tell the user to open the linked idea page.
Rules: be concise (under 120 words unless asked for detail), never invent idea details beyond the teasers given, never reveal full details, and route deal/legal questions to the broker team via the idea page.`;

/** Retrieve teaser-safe context for the user's question (never fullDetail). */
async function teaserContext(question: string): Promise<{ id: string; title: string; teaser: string; niche: string }[]> {
  const hits = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Idea"
    WHERE status IN ('APPROVED', 'MATCHED', 'UNDER_NDA')
      AND (similarity(title, ${question}) > 0.12 OR similarity(teaser, ${question}) > 0.12
           OR title ILIKE ${`%${question.slice(0, 60)}%`})
    ORDER BY GREATEST(similarity(title, ${question}), similarity(teaser, ${question})) DESC
    LIMIT 5;
  `;
  if (hits.length === 0) return [];
  const rows = await db.idea.findMany({
    where: { id: { in: hits.map((h) => h.id) } },
    select: { id: true, title: true, teaser: true, niche: true },
  });
  return rows;
}

/** Ask-me-anything: grounded answer + linked ideas. Login required (cost control). */
export async function askAssistant(
  history: ChatMessage[],
): Promise<{ reply: string; ideas: { id: string; title: string }[] }> {
  const apiKey = process.env.GROQ_API_KEY ?? "";
  if (!apiKey) throw new Error("AI assistant is not configured yet");
  const model = process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b";

  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const context = await teaserContext(lastUser.slice(0, 500));
  const contextBlock =
    context.length > 0
      ? "\n\nLive teasers relevant to the question:\n" +
        context.map((c) => `- [${c.title}](/ideas/${c.id}) (${c.niche}): ${c.teaser}`).join("\n")
      : "";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM + contextBlock },
        ...history.slice(-8).map((m) => ({ role: m.role, content: m.content.slice(0, 800) })),
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const reply = body.choices?.[0]?.message?.content?.trim() ?? "I couldn't answer that — try rephrasing.";
  return { reply, ideas: context.map(({ id, title }) => ({ id, title })) };
}
