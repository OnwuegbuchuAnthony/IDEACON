import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { avatarUrl, logoUrl } from "@/lib/media";
import { ImageUploader } from "@/app/components/ImageUploader";
import { CompanyCard } from "./CompanyCard";
import type { CreatorType } from "@prisma/client";
import { NICHES, parseNiche } from "@/lib/niche";

const CREATOR_TYPES: CreatorType[] = ["INDEPENDENT", "CASUAL", "EXPERT", "STUDENT"];


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
  const photo = await avatarUrl(record);
  const logos = new Map<string, string | null>();
  for (const m of memberships) {
    logos.set(m.companyId, await logoUrl(m.company.logoKey));
  }
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-teal-500 font-display text-2xl font-extrabold text-white">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your photo" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
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
        <input name="name" aria-label="Display name" defaultValue={record.name} placeholder="Display name" required />
        <input name="image" aria-label="Avatar image URL" defaultValue={record.image ?? ""} placeholder="Avatar image URL (optional)" />
        <button className="w-fit rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Save</button>
      </form>
      <ImageUploader label="Or upload a photo (max 5MB)" onUploaded={async (r2Key) => { "use server"; const { setAvatarAction: s } = await import("@/lib/actions-profile"); await s(r2Key); }} />

      <form action={async (fd: FormData) => {
        "use server";
        const { updateCreatorAction: u } = await import("@/lib/actions-profile");
        await u({ creatorType: String(fd.get("creatorType")) as CreatorType, bio: String(fd.get("bio") ?? "") });
      }} className="flex flex-col gap-2 rounded-2xl border border-primary-100 bg-white p-5 shadow">
        <h2 className="font-display font-bold">Creator bio</h2>
        <select name="creatorType" aria-label="Creator type" defaultValue={creator?.creatorType ?? "CASUAL"}>
          {CREATOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <textarea name="bio" aria-label="Creator bio" rows={4} defaultValue={creator?.bio ?? ""} placeholder="Who you are, what you build, what industries fit…" />
        <button className="w-fit rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Save bio</button>
      </form>

      {memberships.map((m) => (
        <CompanyCard key={m.companyId} membership={m} logo={logos.get(m.companyId) ?? null} />
      ))}

      {memberships.length === 0 && (
        <form action={async (fd: FormData) => {
          "use server";
          const { createCompanyAction: c } = await import("@/lib/actions-profile");
          await c({ name: String(fd.get("name")), niche: parseNiche(fd.get("niche")) ?? "OTHER", state: String(fd.get("state") ?? "") });
        }} className="flex flex-col gap-2 rounded-2xl border border-dashed border-primary-400 bg-primary-100/40 p-5">
          <h2 className="font-display font-bold">🏢 Register a firm</h2>
          <input name="name" aria-label="New company name" placeholder="Company / firm name" required />
          <div className="grid grid-cols-2 gap-2">
            <select name="niche" aria-label="Company niche" defaultValue="OTHER">
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <input name="state" aria-label="Company state" placeholder="State (e.g. Lagos)" />
          </div>
          <button className="w-fit rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">Register firm</button>
        </form>
      )}
    </main>
  );
}
