"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { GoogleButton } from "@/app/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => router.push("/dashboard"),
        onError: (ctx) => setError(ctx.error.message),
      },
    );
    if (error) setError(error.message ?? "Log in failed");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
      <GoogleButton callbackURL="/dashboard" />
      <div className="my-2 flex items-center gap-2 text-xs text-ink/50">
        <span className="h-px flex-1 bg-primary-100" /> or with email <span className="h-px flex-1 bg-primary-100" />
      </div>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input aria-label="Email" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input aria-label="Password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <a href="/forgot-password" className="text-xs font-bold text-primary-600 underline">Forgot password?</a>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white" type="submit">
          Log in
        </button>
      </form>
    </main>
  );
}
