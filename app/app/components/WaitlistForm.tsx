"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { joinWaitlistAction } from "@/lib/actions-waitlist";
import { trackEvent } from "@/lib/analytics";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { Turnstile } from "@/app/components/Turnstile";
import type { Niche } from "@prisma/client";

const ROLES = ["creator", "company", "student", "other"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABEL: Record<Role, string> = {
  creator: "I'm a creator",
  company: "I'm a company",
  student: "I'm a student",
  other: "I'm something else",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shared waitlist form (hero, footer, /waitlist page).
 * Two steps: 1) email + role, 2) state (searchable) + consent.
 * Inline success/error via aria-live. No third-party tracking.
 */
export function WaitlistForm({
  variant = "full",
}: {
  variant?: "full" | "compact" | "minimal";
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("creator");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");

  if (done) {
    return (
      <p aria-live="polite" className="rounded-2xl border border-mint-500 bg-mint-100/50 p-4 text-sm font-bold">
        {done}
      </p>
    );
  }

  async function submit(fd: FormData) {
    setBusy(true);
    setError("");
    try {
      const res = await joinWaitlistAction({
        email: String(fd.get("email")),
        name: String(fd.get("name") ?? ""),
        role: variant === "minimal" ? "other" : role,
        state: String(fd.get("state") ?? ""),
            niche: (String(fd.get("niche") ?? "") || undefined) as Niche | undefined,
            consent: fd.get("consent") === "on",
            turnstileToken: token || undefined,
          });
      setDone(
        res.already
          ? "Already on the list — preferences updated."
          : "You're on the list. Watch your inbox at launch.",
      );
      trackEvent("waitlist_submit", { variant });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");

  function goStep2() {
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address to continue");
      return;
    }
    setError("");
    setStep(2);
  }

  return (
    <form
      ref={formRef}
      className={variant === "full" ? "flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-6 shadow" : "flex flex-col gap-2"}
      action={submit}
    >
      {(step === 1 || variant === "minimal") && (
        <>
          {variant === "full" && (
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="I am a">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`rounded-xl border-2 p-2 text-sm font-bold ${
                    role === r ? "border-primary-600 bg-primary-100/60 text-primary-800" : "border-primary-100 text-ink/60"
                  }`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          )}
          {variant === "compact" && (
            <select name="role" value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="I am a">
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          )}
          {variant === "full" && <input name="name" aria-label="Full name" placeholder="Full name (optional)" maxLength={120} />}
          <input name="email" aria-label="Email address" type="email" placeholder="Email address" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
        </>
      )}

      {step === 2 && variant !== "minimal" && (
        <>
          <input type="hidden" name="email" value={email} />
          <input
            name="state"
            aria-label="Nigerian state (optional)"
            placeholder="State in Nigeria — type to search (optional)"
            list="waitlist-states"
            maxLength={40}
          />
          <datalist id="waitlist-states">
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {variant === "full" && (
            <select name="niche" defaultValue="" aria-label="Niche (optional)">
              <option value="">Any niche</option>
              {["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}
        </>
      )}

      {(step === 2 || variant === "minimal") && (
        <label className="flex items-start gap-2 text-xs text-ink/70">
          <input name="consent" type="checkbox" required className="mt-0.5 w-auto" />
          <span>
            I agree to launch emails per the{" "}
            <Link href="/privacy" className="font-bold text-primary-600 underline">privacy notice</Link>.
          </span>
        </label>
      )}

      {error && (
        <p aria-live="polite" className="text-sm text-red-600">{error}</p>
      )}
      <Turnstile onVerify={setToken} />
      <div aria-live="polite" className="sr-only">{busy ? "Joining the waitlist…" : ""}</div>
      <div className="flex gap-2">
        {step === 2 && variant !== "minimal" && (
          <button type="button" onClick={() => setStep(1)} className="rounded-full border border-primary-100 px-5 py-2.5 text-sm font-bold text-ink/70">
            ← Back
          </button>
        )}
        <button
          disabled={busy}
          type={step === 1 && variant !== "minimal" ? "button" : "submit"}
          onClick={step === 1 && variant !== "minimal" ? goStep2 : undefined}
          className="rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Joining…" : step === 1 && variant !== "minimal" ? "Continue →" : "Join the waitlist"}
        </button>
      </div>
    </form>
  );
}
