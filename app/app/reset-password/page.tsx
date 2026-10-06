"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) setError(error.message ?? "Reset failed");
    else router.push("/login");
  }

  if (!token) return <p className="mt-4 text-sm text-red-600">Missing reset token — request a fresh link.</p>;

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
      <input aria-label="New password" placeholder="New password (8+ chars)" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white" type="submit">
        Set new password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Choose a new password</h1>
      <Suspense>
        <ResetForm />
      </Suspense>
    </main>
  );
}
