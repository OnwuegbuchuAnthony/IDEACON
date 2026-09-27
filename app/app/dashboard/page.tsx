import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Phase 0 shell — role-specific dashboards land in Phase 1.
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">
        Hello, {session.user.name}
      </h1>
      <p className="text-sm text-ink/70">
        Role: <b>{(session.user as { role?: string }).role ?? "CREATOR"}</b> · {session.user.email}
      </p>
      <div className="rounded-2xl border border-dashed border-primary-400 bg-primary-100/40 p-6 text-sm">
        Dashboard widgets (submissions, review queue, matches, deals) ship in
        Phase 1. Auth + session + role guard verified ✓
      </div>
    </main>
  );
}
