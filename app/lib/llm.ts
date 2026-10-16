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

function streamEndpoint(name: string): { url: string; key: string } {
  if (name === "groq") {
    return { url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY ?? "" };
  }
  return {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    key: process.env.GEMINI_API_KEY ?? "",
  };
}

function streamHeaders(name: string, key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(name === "groq" ? { Authorization: `Bearer ${key}` } : { "x-goog-api-key": key }),
  };
}

/** OpenAI-compatible SSE → ReadableStream of text deltas. Throws if the stream can't start. */
async function sseTextStream(p: Provider, input: ChatInput): Promise<ReadableStream<string>> {
  const { url, key } = streamEndpoint(p.name);
  if (!key) throw new Error(`${p.name}: API key missing`);
  const res = await fetch(url, {
    method: "POST",
    headers: streamHeaders(p.name, key),
    body: JSON.stringify({
      model: p.model,
      stream: true,
      temperature: input.temperature ?? 0.3,
      ...(input.maxTokens ? { max_tokens: input.maxTokens } : {}),
      messages: [{ role: "system", content: input.system }, ...input.messages],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`${p.name} ${res.status}`);
  const body = res.body;
  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(delta);
            } catch {
              // Partial SSE frame — next chunk completes it.
            }
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

/**
 * Streaming chat across providers (Groq → Gemini). Resolves once the first
 * provider accepts the stream; per-token errors afterwards surface on read.
 */
export async function chatLlmStream(input: ChatInput): Promise<{ stream: ReadableStream<string>; model: string }> {
  const available = providers();
  if (available.length === 0) throw new Error("no LLM provider configured");
  let lastError = "";
  for (const p of available) {
    try {
      const stream = await sseTextStream(p, input);
      return { stream, model: `${p.name}/${p.model}` };
    } catch (e) {
      lastError = `${p.name}: ${e instanceof Error ? e.message : e}`;
    }
  }
  throw new Error(lastError || "all LLM providers failed");
}
