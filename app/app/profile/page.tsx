import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { updatePersonalAction, updateCreatorAction, updateCompanyAction } from "@/lib/actions-profile";
import type { CreatorType, Niche } from "@prisma/client";

const CREATOR_TYPES: CreatorType[] = ["INDEPENDENT", "CASUAL", "EXPERT", "STUDENT"];
const NICHES: Niche[] = ["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"];

// Bio-style profile: personal basics, creator bio, company cards. All editable.
export default async function ProfilePage() {
  const user = await requireUser();
  const [record, creator, memberships] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id } }),
    db.creatorProfile.findUnique({ where: { userId: user.id } }),
    db.companyMember.findMany({
      where: { userId: user.id },
      include: { company: true },
    }),
  ]);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-teal-500 font-display text-2xl font-extrabold text-white">
          {record.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={record.image} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            record.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold">{record.name}</h1>
          <p className="text-sm text-ink/60">{record.email} · {record.role}{record.emailVerified ? " · ✓ verified" : ""}</p>
        </div>
      </div>

      <form action={async (fd: FormData) => {
        "use server";
        const { updatePersonalAction: u } = await import("@/lib/actions-profile");
        await u({ name: String(fd.get("name")), image: String(fd.get("image") ?? "") });
      }} className="flex flex-col gap-2 rounded-2xl border border-primary-100 bg-white p-5 shadow">
        <h2 className="font-display font-bold">Personal</h2>
        <input name="name" defaultValue={record.name} placeholder="Display name" required />
        <input name="image" defaultValue={record.image ?? ""} placeholder="Avatar image URL (optional)" />
        <button className="w-fit rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Save</button>
      </form>

      <form action={async (fd: FormData) => {
        "use server";
        const { updateCreatorAction: u } = await import("@/lib/actions-profile");
        await u({ creatorType: String(fd.get("creatorType")) as CreatorType, bio: String(fd.get("bio") ?? "") });
      }} className="flex flex-col gap-2 rounded-2xl border border-primary-100 bg-white p-5 shadow">
        <h2 className="font-display font-bold">Creator bio</h2>
        <select name="creatorType" defaultValue={creator?.creatorType ?? "CASUAL"}>
          {CREATOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <textarea name="bio" rows={4} defaultValue={creator?.bio ?? ""} placeholder="Who you are, what you build, what industries fit…" />
        <button className="w-fit rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Save bio</button>
      </form>

      {memberships.map((m) => (
        <form key={m.companyId} action={async (fd: FormData) => {
          "use server";
          const { updateCompanyAction: u } = await import("@/lib/actions-profile");
          await u({
            companyId: String(fd.get("companyId")),
            name: String(fd.get("name")),
            niche: String(fd.get("niche")) as Niche,
            state: String(fd.get("state") ?? ""),
            country: String(fd.get("country") ?? ""),
          });
        }} className="flex flex-col gap-2 rounded-2xl border-2 border-teal-500 bg-white p-5 shadow">
          <h2 className="font-display font-bold">🏢 Company {m.company.verified ? "(✓ verified)" : "(unverified)"} · you are {m.role}</h2>
          <input type="hidden" name="companyId" value={m.companyId} />
          <input name="name" defaultValue={m.company.name} placeholder="Company / firm name" required />
          <div className="grid grid-cols-2 gap-2">
            <select name="niche" defaultValue={m.company.niche}>
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <input name="state" defaultValue={m.company.state ?? ""} placeholder="State (e.g. Lagos)" />
          </div>
          <input name="country" defaultValue={m.company.country} placeholder="Country code (e.g. NG)" />
          <button className="w-fit rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white" type="submit">Save company</button>
        </form>
      ))}

      {memberships.length === 0 && (
        <form action={async (fd: FormData) => {
          "use server";
          const { createCompanyAction: c } = await import("@/lib/actions-profile");
          await c({ name: String(fd.get("name")), niche: String(fd.get("niche")) as Niche, state: String(fd.get("state") ?? "") });
        }} className="flex flex-col gap-2 rounded-2xl border border-dashed border-primary-400 bg-primary-100/40 p-5">
          <h2 className="font-display font-bold">🏢 Register a firm</h2>
          <input name="name" placeholder="Company / firm name" required />
          <div className="grid grid-cols-2 gap-2">
            <select name="niche" defaultValue="OTHER">
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <input name="state" placeholder="State (e.g. Lagos)" />
          </div>
          <button className="w-fit rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Register firm</button>
        </form>
      )}
    </main>
  );
}
