"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { Turnstile } from "@/app/components/Turnstile";

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
  const [token, setToken] = useState("");
  const [followups, setFollowups] = useState<string[]>([]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    setError("");
    setFollowups([]);
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    trackEvent("ask_query");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, turnstileToken: token || undefined }),
      });
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || !ct.startsWith("text/plain")) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Assistant failed");
      }
      if (!res.body) throw new Error("empty stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let headerDone = false;
      let text = "";
      let found: Idea[] = [];
      setMsgs([...next, { role: "assistant" as const, content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        if (!headerDone) {
          const nl = buf.indexOf("\n");
          if (nl === -1) continue;
          try {
            found = (JSON.parse(buf.slice(0, nl)) as { ideas?: Idea[] }).ideas ?? [];
          } catch {
            found = [];
          }
          setIdeas(found);
          buf = buf.slice(nl + 1);
          headerDone = true;
        }
        text += buf;
        buf = "";
        const snapshot = text;
        setMsgs([...next, { role: "assistant" as const, content: snapshot }]);
      }
      if (!text.trim()) {
        setMsgs([...next, { role: "assistant" as const, content: "I couldn't answer that — try rephrasing." }]);
      }
      setFollowups([
        ...(found[0] ? [`Tell me more about ${found[0].title}`] : ["What kind of ideas are listed?"]),
        "How do NDAs work here?",
        "What does it cost?",
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assistant failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-[45vh] min-h-[220px] flex-col gap-2 overflow-y-auto rounded-2xl border border-primary-100 bg-white p-4 shadow">
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
        {(followups.length > 0 ? followups : SUGGESTIONS).map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border border-primary-200 px-3 py-1 text-xs font-bold text-primary-700">
            {s}
          </button>
        ))}
      </div>
      <Turnstile onVerify={setToken} />
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
