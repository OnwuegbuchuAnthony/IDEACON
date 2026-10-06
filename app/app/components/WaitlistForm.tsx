"use client";

import Link from "next/link";
import { useState } from "react";
import { joinWaitlistAction } from "@/lib/actions-waitlist";
import { trackEvent } from "@/lib/analytics";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import type { Niche } from "@prisma/client";

const ROLES = ["creator", "company", "student", "other"] as const;

/**
 * Shared waitlist form (hero, footer, /waitlist page).
 * Inline success/error via aria-live. No third-party tracking.
 */
export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [role, setRole] = useState<(typeof ROLES)[number]>("creator");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (done) {
    return (
      <p aria-live="polite" className="rounded-2xl border border-mint-500 bg-mint-100/50 p-4 text-sm font-bold">
        {done}
      </p>
    );
  }

  return (
    <form
      className={compact ? "flex flex-col gap-2" : "flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-6 shadow"}
      action={async (fd: FormData) => {
        setBusy(true);
        setError("");
        try {
          const res = await joinWaitlistAction({
            email: String(fd.get("email")),
            name: String(fd.get("name") ?? ""),
            role,
            state: String(fd.get("state") ?? ""),
            niche: (String(fd.get("niche") ?? "") || undefined) as Niche | undefined,
            consent: fd.get("consent") === "on",
          });
          setDone(
            res.already
              ? "Already on the list — preferences updated."
              : "You're on the list. Watch your inbox at launch.",
          );
          trackEvent("waitlist_submit", { variant: compact ? "compact" : "full" });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
          setBusy(false);
        }
      }}
    >
      {!compact && (
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`rounded-xl border-2 p-2 text-sm font-bold capitalize ${
                role === r ? "border-primary-600 bg-primary-100/60 text-primary-800" : "border-primary-100 text-ink/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
      {compact && (
        <select name="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} aria-label="I am a">
          {ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">I&apos;m a {r}</option>
          ))}
        </select>
      )}
      {!compact && <input name="name" aria-label="Full name" placeholder="Full name (optional)" maxLength={120} />}
      <input name="email" aria-label="Email address" type="email" placeholder="Email address" required maxLength={254} />
      <select name="state" defaultValue="" aria-label="Nigerian state (optional)">
        <option value="">State in Nigeria (optional)</option>
        {NIGERIAN_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {!compact && (
        <select name="niche" defaultValue="" aria-label="Niche (optional)">
          <option value="">Any niche</option>
          {["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      )}
      <label className="flex items-start gap-2 text-xs text-ink/70">
        <input name="consent" type="checkbox" required className="mt-0.5 w-auto" />
        <span>
          I agree to launch emails per the{" "}
          <Link href="/privacy" className="font-bold text-primary-600 underline">privacy notice</Link>.
        </span>
      </label>
      {error && (
        <p aria-live="polite" className="text-sm text-red-600">{error}</p>
      )}
      <div aria-live="polite" className="sr-only">{busy ? "Joining the waitlist…" : ""}</div>
      <button
        disabled={busy}
        type="submit"
        className="rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}
