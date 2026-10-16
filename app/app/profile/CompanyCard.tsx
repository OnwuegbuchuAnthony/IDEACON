import type { CompanyMember, CompanyProfile, Niche } from "@prisma/client";
import { GoldBadge, BlueBadge } from "@/app/components/Badges";
import { ImageUploader } from "@/app/components/ImageUploader";
import { Card } from "@/app/components/ui";

const NICHES: Niche[] = ["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"];

type Membership = CompanyMember & { company: CompanyProfile };

/** Single firm card: logo, badges, editable details, logo upload. */
export function CompanyCard({
  membership,
  logo,
}: {
  membership: Membership;
  logo: string | null;
}) {
  const m = membership;
  return (
    <>
      <form
        action={async (fd: FormData) => {
          "use server";
          const { updateCompanyAction: u } = await import("@/lib/actions-profile");
          await u({
            companyId: String(fd.get("companyId")),
            name: String(fd.get("name")),
            niche: String(fd.get("niche")) as Niche,
            state: String(fd.get("state") ?? ""),
            country: String(fd.get("country") ?? ""),
          });
        }}
      >
        <Card accent>
          <div className="flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={`${m.company.name} logo`} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 font-display text-xl font-extrabold text-primary-800">
                {m.company.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <h2 className="font-display font-bold">
                🏢 {m.company.name} {m.company.verified && <GoldBadge />}
              </h2>
              <p className="text-xs text-ink/60">you are {m.role} {m.verified && <BlueBadge />}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <input type="hidden" name="companyId" value={m.companyId} />
            <input name="name" aria-label="Company name" defaultValue={m.company.name} placeholder="Company / firm name" required />
            <div className="grid grid-cols-2 gap-2">
              <select name="niche" aria-label="Company niche" defaultValue={m.company.niche}>
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <input name="state" aria-label="Company state" defaultValue={m.company.state ?? ""} placeholder="State (e.g. Lagos)" />
            </div>
            <input name="country" aria-label="Country code" defaultValue={m.company.country} placeholder="Country code (e.g. NG)" />
            <button className="w-fit rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white" type="submit">Save company</button>
          </div>
        </Card>
      </form>
      <ImageUploader label="Official logo (max 5MB)" onUploaded={async (r2Key) => { "use server"; const { setCompanyLogoAction: s } = await import("@/lib/actions-profile"); await s(m.companyId, r2Key); }} />
    </>
  );
}
