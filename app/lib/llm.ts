type ChatInput = {
  system: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
};

type Provider = {
  name: string;
  model: string;
  call: (input: ChatInput, model: string) => Promise<string>;
};

async function groqCall(input: ChatInput, model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY ?? "";
  if (!apiKey) throw new Error("GROQ_API_KEY missing");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.3,
      ...(input.maxTokens ? { max_tokens: input.maxTokens } : {}),
      ...(input.jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "system", content: input.system }, ...input.messages],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return body.choices?.[0]?.message?.content ?? "";
}

async function geminiCall(input: ChatInput, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY ?? "";
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  // Gemini's OpenAI-compatible endpoint (key travels in a header, never the URL).
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.3,
      ...(input.maxTokens ? { max_tokens: input.maxTokens } : {}),
      ...(input.jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "system", content: input.system }, ...input.messages],
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return body.choices?.[0]?.message?.content ?? "";
}

function providers(): Provider[] {
  const list: Provider[] = [];
  // Dev defaults differ from production on purpose: committed fallbacks must
  // never equal production secret/env values (secrets scanners flag matches).
  if (process.env.GROQ_API_KEY) {
    list.push({ name: "groq", model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b", call: groqCall });
  }
  if (process.env.GEMINI_API_KEY) {
    list.push({ name: "gemini", model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash", call: geminiCall });
  }
  return list;
}

/**
 * Chat across configured LLM providers (Groq → Gemini), first success wins.
 * Throws when no provider is configured or all fail — callers fall back.
 */
export async function chatLlm(input: ChatInput): Promise<{ text: string; model: string }> {
  const available = providers();
  if (available.length === 0) throw new Error("no LLM provider configured");
  let lastError = "";
  for (const p of available) {
    try {
      const text = await p.call(input, p.model);
      if (text.trim()) return { text, model: `${p.name}/${p.model}` };
      lastError = `${p.name}: empty reply`;
    } catch (e) {
      lastError = `${p.name}: ${e instanceof Error ? e.message : e}`;
    }
  }
  throw new Error(lastError || "all LLM providers failed");
}
