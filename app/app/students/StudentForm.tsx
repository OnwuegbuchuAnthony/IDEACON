"use client";

import { useState } from "react";
import { joinWaitlistAction } from "@/lib/actions-waitlist";
import { trackEvent } from "@/lib/analytics";
import { Turnstile } from "@/app/components/Turnstile";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { NIGERIAN_UNIVERSITIES } from "@/lib/nigerian-universities";

/** Campus lane: fixed role=student plus university + department. */
export function StudentWaitlistForm() {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [uni, setUni] = useState("");

  if (done) {
    return (
      <p aria-live="polite" className="rounded-2xl border border-mint-500 bg-mint-100/50 p-4 text-sm font-bold">
        {done}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-6 shadow"
      action={async (fd: FormData) => {
        setBusy(true);
        setError("");
        try {
          const other = String(fd.get("universityOther") ?? "").trim();
          if (!uni) throw new Error("Select your university");
          if (uni === "Other (not listed)" && !other) {
            throw new Error("Type your university name");
          }
          const res = await joinWaitlistAction({
            email: String(fd.get("email")),
            name: String(fd.get("name") ?? ""),
            role: "student",
            state: String(fd.get("state") ?? ""),
            university:
              uni === "Other (not listed)"
                ? `Other: ${String(fd.get("universityOther") ?? "").trim()}`
                : uni,
            department: String(fd.get("department") ?? ""),
            consent: fd.get("consent") === "on",
            turnstileToken: token || undefined,
          });
          setDone(res.already ? "Already registered — details updated. Confirm via email if you haven't yet." : "You're in! Check your email to confirm your spot.");
          trackEvent("waitlist_submit", { variant: "student" });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-display text-lg font-bold">Join the student lane</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" aria-label="Full name" placeholder="Full name (optional)" maxLength={120} />
        <input name="email" aria-label="Email address" type="email" placeholder="Email address" required maxLength={254} />
        <input name="department" aria-label="Department or faculty" placeholder="Department / faculty" required maxLength={120} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          aria-label="University (NUC-approved list)"
          value={uni}
          onChange={(e) => setUni(e.target.value)}
          required
        >
          <option value="">Select your university…</option>
          {NIGERIAN_UNIVERSITIES.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <input
          name="universityOther"
          aria-label="University name, if not listed"
          placeholder={uni === "Other (not listed)" ? "Type your university…" : "Only if ‘Other’ selected"}
          disabled={uni !== "Other (not listed)"}
          maxLength={120}
        />
      </div>
      <input name="university" type="hidden" value={uni} />
      <select name="state" defaultValue="" aria-label="Nigerian state (optional)">
        <option value="">State in Nigeria (optional)</option>
        {NIGERIAN_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <label className="flex items-start gap-2 text-xs text-ink/70">
        <input name="consent" type="checkbox" required className="mt-0.5 w-auto" />
        <span>
          I agree to launch emails per the <a href="/privacy" className="font-bold text-primary-600 underline">privacy notice</a>.
        </span>
      </label>
      {error && <p aria-live="polite" className="text-sm text-red-600">{error}</p>}
      <Turnstile onVerify={setToken} />
      <div aria-live="polite" className="sr-only">{busy ? "Joining…" : ""}</div>
      <button disabled={busy} type="submit" className="rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
        {busy ? "Joining…" : "Join as a student"}
      </button>
    </form>
  );
}
