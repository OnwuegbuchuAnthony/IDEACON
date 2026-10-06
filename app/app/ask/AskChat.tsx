"use client";

import { useState } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; content: string };
type Idea = { id: string; title: string };

const SUGGESTIONS = [
  "Find me AgroTech ideas",
  "How do NDAs work here?",
  "How do I price my idea?",
  "What can companies do?",
];

/** Ask-me-anything chat, grounded in the live teaser catalog. */
export function AskChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    setError("");
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Assistant failed");
      setMsgs([...next, { role: "assistant" as const, content: body.reply }]);
      setIdeas(body.ideas ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assistant failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-[280px] flex-col gap-2 rounded-2xl border border-primary-100 bg-white p-4 shadow">
        {msgs.length === 0 && (
          <p className="text-sm text-ink/50">
            Ask about ideas, NDAs, pricing, how the brokered handoff works — I answer from the live catalog.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "self-end bg-primary-600 text-white" : "self-start bg-primary-100/60"}`}>
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
        {busy && <p className="text-sm text-ink/50">Thinking…</p>}
        {ideas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ideas.map((it) => (
              <Link key={it.id} href={`/ideas/${it.id}`} className="rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {it.title}
              </Link>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error} — <Link href="/login" className="underline">log in</Link> to use the assistant.</p>}
      <div className="flex flex-wrap gap-1">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border border-primary-200 px-3 py-1 text-xs font-bold text-primary-700">
            {s}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => { e.preventDefault(); send(input); }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything…" aria-label="Ask me anything" maxLength={800} />
        <button disabled={busy} className="rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-6 py-2 text-sm font-bold text-white disabled:opacity-50" type="submit">
          Ask
        </button>
      </form>
    </div>
  );
}
