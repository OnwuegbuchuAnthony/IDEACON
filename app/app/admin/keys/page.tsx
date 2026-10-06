import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { IssueKeyForm, RevokeButton } from "./KeyActions";

export default async function ApiKeysPage() {
  await requireRole("BROKER", "ADMIN");
  const [companies, keys] = await Promise.all([
    db.companyProfile.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.apiKey.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const names = new Map(companies.map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">API keys</h1>
      <p className="text-sm text-ink/60">Scopes: <code>teasers:read</code> · <code>evidence:read</code>. Secrets are hashed at rest.</p>
      <IssueKeyForm companies={companies} />
      <div className="flex flex-col gap-2">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm">
            <code className="font-bold">{k.keyPrefix}…</code>
            <span>{names.get(k.companyId) ?? k.companyId}</span>
            <span className="text-ink/50">{k.name}</span>
            {k.revokedAt
              ? <span className="rounded-full bg-coral-100 px-2 py-0.5 text-xs font-bold text-coral-700">revoked</span>
              : <RevokeButton keyId={k.id} />}
          </div>
        ))}
        {keys.length === 0 && <p className="text-sm text-ink/50">No keys yet.</p>}
      </div>
    </main>
  );
}
