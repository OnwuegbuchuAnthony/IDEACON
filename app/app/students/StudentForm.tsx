"use client";

import { useState } from "react";
import { joinWaitlistAction } from "@/lib/actions-waitlist";
import { trackEvent } from "@/lib/analytics";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";

/** Campus lane: fixed role=student plus university + department. */
export function StudentWaitlistForm() {
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
      className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-6 shadow"
      action={async (fd: FormData) => {
        setBusy(true);
        setError("");
        try {
          const res = await joinWaitlistAction({
            email: String(fd.get("email")),
            name: String(fd.get("name") ?? ""),
            role: "student",
            state: String(fd.get("state") ?? ""),
            university: String(fd.get("university") ?? ""),
            department: String(fd.get("department") ?? ""),
            consent: fd.get("consent") === "on",
          });
          setDone(res.already ? "Already registered — details updated." : "You're in! Watch your inbox at launch.");
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
        <input name="university" aria-label="University" placeholder="University" required maxLength={120} />
        <input name="department" aria-label="Department or faculty" placeholder="Department / faculty" required maxLength={120} />
      </div>
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
      <div aria-live="polite" className="sr-only">{busy ? "Joining…" : ""}</div>
      <button disabled={busy} type="submit" className="rounded-full bg-gradient-to-r from-primary-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
        {busy ? "Joining…" : "Join as a student"}
      </button>
    </form>
  );
}
