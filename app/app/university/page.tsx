import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { bulkIntakeAction } from "@/lib/actions-phase2";

// University pipeline: partners, ambassador intake, idea counts.
export default async function UniversityPage() {
  await requireUser();
  const partners = await db.universityPartner.findMany({
    include: { _count: { select: { creators: true } } },
    orderBy: { name: "asc" },
  });
  const counts = await db.idea.groupBy({
    by: ["creatorId"],
    _count: true,
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">University pipeline</h1>
      <p className="text-sm text-ink/60">
        Innovation hubs turn student projects into submissions. Ambassadors paste one idea title per line — drafts are created for follow-up.
      </p>

      <section className="flex flex-col gap-2">
        {partners.map((p) => (
          <div key={p.id} className="rounded-2xl border border-primary-100 bg-white p-4 shadow">
            <b>{p.name}</b> <span className="text-sm text-ink/60">{p.state ?? ""} · {p._count.creators} creators</span>
          </div>
        ))}
      </section>

      <form action={async (fd: FormData) => {
        "use server";
        await bulkIntakeAction({ universityId: String(fd.get("universityId")), lines: String(fd.get("lines")) });
      }} className="flex flex-col gap-2 rounded-2xl border-2 border-teal-500 bg-teal-100/40 p-5">
        <h2 className="font-display font-bold">Ambassador bulk intake</h2>
        <select name="universityId" required defaultValue={partners[0]?.id ?? ""}>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <textarea name="lines" rows={5} placeholder={"Solar dryer for pepper\nVoice soil alerts\n…"} required />
        <button className="rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white" type="submit">
          Create drafts
        </button>
      </form>
      <p className="text-xs text-ink/50">{counts.length} creators hold ideas in the system.</p>
    </main>
  );
}
