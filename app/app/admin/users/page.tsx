import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { setUserRoleAction, verifyCompanyAction } from "@/lib/actions-workspace";

const ROLES = ["CREATOR", "COMPANY_MEMBER", "REVIEWER", "BROKER", "ADMIN"];

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const [users, companies] = await Promise.all([
    db.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.companyProfile.findMany({ select: { id: true, name: true, verified: true, state: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Users &amp; companies</h1>

      <section>
        <h2 className="font-display text-xl font-bold">Companies</h2>
        <div className="mt-2 flex flex-col gap-2">
          {companies.map((c) => (
            <form key={c.id} action={async () => {
              "use server";
              const { verifyCompanyAction: v } = await import("@/lib/actions-workspace");
              await v(c.id, !c.verified);
            }} className="flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
              <b>{c.name}</b>
              <span className="text-ink/50">{c.state ?? ""}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.verified ? "bg-mint-100 text-emerald-800" : "bg-sun-100 text-amber-800"}`}>
                {c.verified ? "verified" : "unverified"}
              </span>
              <button className="ml-auto rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800" type="submit">
                {c.verified ? "Unverify" : "Verify"}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Users</h2>
        <div className="mt-2 flex flex-col gap-2">
          {users.map((u) => (
            <form key={u.id} action={async (fd: FormData) => {
              "use server";
              const { setUserRoleAction: s } = await import("@/lib/actions-workspace");
              await s(u.id, String(fd.get("role")));
            }} className="flex flex-wrap items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
              <b>{u.name}</b>
              <span className="text-ink/50">{u.email}</span>
              <select name="role" defaultValue={u.role} style={{ maxWidth: 170 }}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button className="rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white" type="submit">Set</button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
