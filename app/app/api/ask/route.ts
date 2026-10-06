import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { askAssistant, type ChatMessage } from "@/lib/assistant";

/** POST /api/ask {messages:[{role,content}]} — login required (cost control). */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "login required" }, { status: 401 });

  const { messages } = (await req.json()) as { messages?: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return NextResponse.json({ error: "last message must be from you" }, { status: 400 });
  }
  try {
    return NextResponse.json(await askAssistant(clean));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "assistant failed";
    const status = msg.includes("not configured") ? 503 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
