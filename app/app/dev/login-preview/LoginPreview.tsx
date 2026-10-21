"use client";

import { useState } from "react";
import { LoginModal } from "@/app/components/LoginModal";

/** Mock handlers: resolve after 800ms, never touch auth. */
const mock = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

export function LoginPreview() {
  const [open, setOpen] = useState(true);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Login modal preview</h1>
        <p className="text-sm text-ink/60">
          Dev-only route behind the real header. Mock handlers resolve after 800ms — auth is untouched.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-2.5 text-sm font-bold text-white"
      >
        Reopen login
      </button>

      <section
        className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow"
        style={{ border: "1px solid var(--ic-border)", borderRadius: "var(--ic-radius-card)" }}
      >
        <h2 className="font-display text-lg font-bold">Field styles</h2>
        <input aria-label="Sample email" type="email" placeholder="Email address" />
        <select aria-label="Sample niche" defaultValue="HEALTHTECH">
          <option value="HEALTHTECH">HealthTech</option>
          <option value="AGROTECH">AgroTech</option>
          <option value="FINTECH">FinTech</option>
        </select>
        <textarea
          aria-label="Sample teaser"
          rows={3}
          placeholder="Public teaser (what it does, who it helps — no secrets)"
        />
      </section>

      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
        onGoogle={mock}
        onEmailLogin={mock}
        onRegister={mock}
        onForgot={() => setOpen(false)}
      />
    </main>
  );
}
