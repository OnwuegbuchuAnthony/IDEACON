import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser, myCompanyId } from "@/lib/session";
import { unreadCount } from "@/lib/notifications";

// Phase 6: real role dashboards (replaces the Phase 0 shell).
export default async function DashboardPage() {
  const user = await requireUser();
  const companyId = await myCompanyId(user.id);
  const unread = await unreadCount(user.id);

  const profile = await db.creatorProfile.findUnique({ where: { userId: user.id } });
  const myIdeas = profile
    ? await db.idea.findMany({
        where: { creatorId: profile.id },
        select: { id: true, title: true, status: true, niche: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const company = companyId
    ? await db.companyProfile.findUnique({
        where: { id: companyId },
        include: {
          matches: { orderBy: { createdAt: "desc" }, take: 10, include: { idea: { select: { id: true, title: true } } } },
        },
      })
    : null;
  const searches = companyId
    ? await db.savedSearch.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } })
    : [];
  const grants = companyId
    ? await db.ndaGrant.findMany({ where: { companyId, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" }, take: 10 })
    : [];
  const deals = companyId
    ? await db.deal.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 10 })
    : [];

  const searchHref = (s: { niche: string | null; stage: string | null; q: string | null }) => {
    const p = new URLSearchParams();
    if (s.niche) p.set("niche", s.niche);
    if (s.stage) p.set("stage", s.stage);
    if (s.q) p.set("q", s.q);
    return `/browse?${p.toString()}`;
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Hello, {user.name}</h1>
      <p className="text-sm text-ink/70">
        Role: <b>{user.role}</b> · {user.email} ·{" "}
        <Link href="/notifications" className="font-bold text-primary-600 underline">
          Inbox ({unread} unread)
        </Link>
      </p>

      {(user.role === "REVIEWER" || user.role === "BROKER" || user.role === "ADMIN") && (
        <div className="flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/review" className="rounded-full bg-sun-100 px-4 py-2 text-amber-800">Review queue</Link>
          <Link href="/broker" className="rounded-full bg-teal-100 px-4 py-2 text-teal-700">Broker console</Link>
          {user.role === "ADMIN" && (
            <>
              <Link href="/admin/users" className="rounded-full bg-grape-100 px-4 py-2 text-grape-500">Users</Link>
              <Link href="/admin/keys" className="rounded-full bg-grape-100 px-4 py-2 text-grape-500">API keys</Link>
              <Link href="/admin/events" className="rounded-full bg-grape-100 px-4 py-2 text-grape-500">Audit</Link>
            </>
          )}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">My submissions ({myIdeas.length})</h2>
          <Link href="/submit" className="text-sm font-bold text-coral-500 underline">+ New idea</Link>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {myIdeas.map((i) => (
            <Link key={i.id} href={`/ideas/${i.id}`} className="rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
              <b>{i.title}</b> <span className="text-ink/50">· {i.niche} · {i.status}</span>
            </Link>
          ))}
          {myIdeas.length === 0 && <p className="text-sm text-ink/50">Nothing submitted yet.</p>}
        </div>
      </section>

      {company && (
        <>
          <section>
            <h2 className="font-display text-xl font-bold">{company.name} — requests</h2>
            <div className="mt-2 flex flex-col gap-2">
              {company.matches.map((m) => (
                <Link key={m.id} href={`/ideas/${m.idea.id}`} className="rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
                  <b>{m.idea.title}</b> <span className="text-ink/50">· {m.source} · {m.createdAt.toISOString().slice(0, 10)}</span>
                </Link>
              ))}
              {company.matches.length === 0 && <p className="text-sm text-ink/50">No access requests yet — <Link href="/browse" className="underline">browse teasers</Link>.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Active NDA grants ({grants.length})</h2>
            <div className="mt-2 flex flex-col gap-2">
              {grants.map((g) => (
                <Link key={g.id} href={`/ideas/${g.ideaId}`} className="rounded-xl border border-mint-500 bg-white px-4 py-2 text-sm shadow">
                  Idea <code>{g.ideaId.slice(0, 8)}</code> · {g.templateVersion} · expires {g.expiresAt.toISOString().slice(0, 10)}
                </Link>
              ))}
              {grants.length === 0 && <p className="text-sm text-ink/50">No active grants.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Deals ({deals.length})</h2>
            <div className="mt-2 flex flex-col gap-2">
              {deals.map((d) => (
                <Link key={d.id} href={`/deals/${d.id}`} className="rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
                  <b>{d.template}</b> <span className="text-ink/50">· {d.status} · {d.currency}</span>
                </Link>
              ))}
              {deals.length === 0 && <p className="text-sm text-ink/50">No deals yet.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Saved searches</h2>
            <div className="mt-2 flex flex-col gap-2">
              {searches.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
                  <Link href={searchHref(s)} className="font-bold underline">{s.name}</Link>
                  <span className="text-ink/50">{[s.niche, s.stage, s.q].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
              {searches.length === 0 && <p className="text-sm text-ink/50">Save a filter set from the browse page.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
