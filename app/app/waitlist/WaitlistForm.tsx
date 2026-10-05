"use client";

import { useState } from "react";
import { joinWaitlistAction } from "@/lib/actions-waitlist";
import type { Niche } from "@prisma/client";

/** Branded waitlist form (v1.1 Bright). No login needed. */
export function WaitlistForm() {
  const [kind, setKind] = useState<"creator" | "company">("creator");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-mint-500 bg-mint-100/50 p-6 text-center">
        <p className="font-display text-xl font-bold">You're on the list ✓</p>
        <p className="mt-1 text-sm text-ink/70">{done}</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-6 shadow"
      action={async (fd: FormData) => {
        setBusy(true);
        setError("");
        try {
          const res = await joinWaitlistAction({
            email: String(fd.get("email")),
            name: String(fd.get("name") ?? ""),
            kind,
            niche: (String(fd.get("niche") ?? "") || undefined) as Niche | undefined,
          });
          setDone(
            res.already
              ? "Email already registered — we've updated your preferences."
              : "We'll email you the moment your lane opens. Welcome to IDEACON.",
          );
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        {(["creator", "company"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-xl border-2 p-3 text-sm font-bold ${
              kind === k ? "border-primary-600 bg-primary-100/60 text-primary-800" : "border-primary-100 text-ink/60"
            }`}
          >
            {k === "creator" ? "💡 I have ideas" : "🏢 I need ideas"}
          </button>
        ))}
      </div>
      <input name="name" placeholder="Full name (optional)" />
      <input name="email" type="email" placeholder="Email address" required />
      <select name="niche" defaultValue="">
        <option value="">Any niche</option>
        {["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-50" type="submit">
        {busy ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}
