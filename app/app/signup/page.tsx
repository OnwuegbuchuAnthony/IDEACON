"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const accountType = params.get("type") === "company" ? "COMPANY_MEMBER" : "CREATOR";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await authClient.signUp.email(
      { name, email, password },
      {
        onSuccess: () => router.push("/onboarding"),
        onError: (ctx) => setError(ctx.error.message),
      },
    );
    if (error) setError(error.message ?? "Sign up failed");
  }

  return (
    <>
      <p className="mt-1 text-sm text-ink/70">
        Join as {accountType === "CREATOR" ? "a creator" : "a company"}
      </p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password (8+ chars)" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white" type="submit">
          Create account
        </button>
      </form>
    </>
  );
}

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Join IDEACON</h1>
      <Suspense>
        <SignupForm />
      </Suspense>
    </main>
  );
}
