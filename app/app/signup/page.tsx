"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { completeSignupAction } from "@/lib/actions-signup";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [kind, setKind] = useState<"creator" | "company">(
    params.get("type") === "company" ? "company" : "creator",
  );
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (kind === "company" && !companyName.trim()) {
      setError("Company name is required");
      return;
    }
    const { error } = await authClient.signUp.email(
      { name, email, password },
      {
        onSuccess: async () => {
          try {
            await completeSignupAction({ kind, companyName });
          } catch (err) {
            // Server-action redirect() navigates via a thrown signal — let it through.
            if (err instanceof Error && "digest" in err && String((err as { digest?: string }).digest).includes("NEXT_REDIRECT")) throw err;
            setError(err instanceof Error ? err.message : "Setup failed");
          }
        },
        onError: (ctx) => setError(ctx.error.message),
      },
    );
    if (error) setError(error.message ?? "Sign up failed");
    else router.refresh();
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["creator", "company"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-2xl border-2 p-4 text-left ${
              kind === k ? "border-primary-600 bg-primary-100/60" : "border-primary-100 bg-white"
            }`}
          >
            <p className="font-display font-bold">{k === "creator" ? "💡 Creator" : "🏢 Company"}</p>
            <p className="text-xs text-ink/60">
              {k === "creator" ? "Submit ideas, get discovered" : "Discover ideas, license & partner"}
            </p>
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        {kind === "company" && (
          <input placeholder="Company / firm name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        )}
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password (8+ chars)" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white" type="submit">
          Create {kind === "creator" ? "creator" : "company"} account
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
