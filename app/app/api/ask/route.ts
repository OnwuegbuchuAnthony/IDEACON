import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { askAssistantStream, type ChatMessage } from "@/lib/assistant";
import { verifyTurnstile } from "@/lib/turnstile";
import { db } from "@/lib/db";

/**
 * POST /api/ask {messages, turnstileToken?} — login + bot-check required.
 * Streams `text/plain`: first line is JSON `{"ideas":[...]}`, the rest is
 * reply text as it arrives. Failures are logged to UnansweredQuery.
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "login required" }, { status: 401 });

  const { messages, turnstileToken } = (await req.json()) as {
    messages?: ChatMessage[];
    turnstileToken?: string;
  };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ error: "bot check failed" }, { status: 403 });
  }

  const clean = (messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return NextResponse.json({ error: "last message must be from you" }, { status: 400 });
  }
  try {
    const { ideas, stream } = await askAssistantStream(clean);
    const encoder = new TextEncoder();
    const out = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ ideas }) + "\n"));
        const reader = stream.getReader();
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });
    return new Response(out, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "assistant failed";
    const status = msg.includes("no LLM provider") ? 503 : 502;
    try {
      await db.unansweredQuery.create({
        data: {
          question: clean[clean.length - 1].content.slice(0, 500),
          reason: msg.slice(0, 200),
        },
      });
    } catch {
      // Logging must never break the error response (e.g. table not yet pushed).
    }
    return NextResponse.json({ error: msg }, { status });
  }
}
