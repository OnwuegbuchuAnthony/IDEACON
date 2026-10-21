import { db } from "@/lib/db";

/** Live platform stats (build-time data, revalidated hourly). */
export async function StatsRow() {
  const [ideas, companies, grants, deals] = await Promise.all([
    db.idea.count({ where: { status: { in: ["APPROVED", "MATCHED", "UNDER_NDA", "DEAL"] } } }),
    db.companyProfile.count({ where: { verified: true } }),
    db.ndaGrant.count(),
    db.deal.count(),
  ]);

  // Before launch every counter reads zero, and a row of zeros reads as a
  // dead product rather than a new one. Show a launch badge until there is
  // something real to count.
  if (ideas + companies + grants + deals === 0) {
    return (
      <div className="w-full">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-100/60 px-4 py-2 text-sm font-bold text-primary-800">
          <span aria-hidden="true" className="font-display">◈</span>
          Launching in Lagos and Abuja
        </p>
      </div>
    );
  }

  const stats: [string, string][] = [
    [String(ideas), "ideas vetted live"],
    [String(companies), "companies verified"],
    [String(grants), "NDAs signed"],
    [String(deals), "brokered deals"],
  ];
  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-4">
        {stats.map(([n, l]) => (
          <div key={l} className="rounded-2xl border border-primary-100 bg-white p-4 text-center shadow">
            <p className="font-display text-3xl font-extrabold text-primary-600">{n}</p>
            <p className="text-xs text-ink/60">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Expert board strip — roles, never invented names. */
export function BoardStrip() {
  const roles = [
    ["MedTech reviewer", "Clinicians who separate viable devices from wishful sketches."],
    ["Agro economist", "Operators who price post-harvest ideas against real field costs."],
    ["FinTech operator", "Builders who stress-test inclusion and fraud claims."],
  ];
  return (
    <section aria-label="Expert review board" className="w-full">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">Checked by people who&apos;ve built it</h2>
      <p className="mt-1 max-w-xl text-sm text-ink-muted">
        Every approved teaser carries a named reviewer verdict — AI scores advise, humans decide.
      </p>
      <div className="mt-4 grid w-full gap-4 sm:grid-cols-3">
        {roles.map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-border bg-surface p-5 shadow">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-display text-base font-extrabold text-violet-500">✓</span>
            <h3 className="mt-2 font-display text-base font-bold">{t}</h3>
            <p className="mt-1 text-sm text-ink-muted">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
