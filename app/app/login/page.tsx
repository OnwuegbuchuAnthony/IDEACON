"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white" type="submit">
          Log in
        </button>
      </form>
    </main>
  );
}
