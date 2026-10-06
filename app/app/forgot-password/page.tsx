"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    if (error) setError(error.message ?? "Request failed");
    else setDone(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Reset password</h1>
      {done ? (
        <p className="mt-4 rounded-2xl bg-mint-100 p-4 text-sm text-emerald-800">
          If that email has an account, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input aria-label="Email" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white" type="submit">
            Send reset link
          </button>
        </form>
      )}
    </main>
  );
}
