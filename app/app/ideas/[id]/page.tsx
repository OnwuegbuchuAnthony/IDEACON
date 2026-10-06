import Link from "next/link";
import { getIdeaDetail } from "@/lib/ideas";
import { requireUser, myCompanyId } from "@/lib/session";
import { communityScore } from "@/lib/voting";
import { similarIdeas } from "@/lib/similar";
import { RequestAccessButton, SignNdaForm } from "../IdeaActions";
import { VoteButtons } from "../VoteButtons";

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const companyId = await myCompanyId(user.id);
  const idea = await getIdeaDetail(id, companyId, user.id);
  if (!idea) return <main className="p-12">Idea not found.</main>;
  const [community, similar] = await Promise.all([communityScore(id), similarIdeas(id)]);

  const avg = idea.aiScores[0]
    ? Math.round(((idea.aiScores[0].originality + idea.aiScores[0].feasibility + idea.aiScores[0].marketFit) / 3) * 10) / 10
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-12">
      <div className="flex flex-wrap gap-1 text-[11px] font-bold">
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-800">{idea.niche}</span>
        <span className="rounded-full bg-coral-100 px-2 py-0.5 text-coral-700">{idea.stage}</span>
        <span className="rounded-full bg-sun-100 px-2 py-0.5 text-amber-800">{idea.status}</span>
        {avg !== null && <span className="rounded-full bg-mint-100 px-2 py-0.5 text-emerald-800">{avg} fit</span>}
      </div>
      <h1 className="font-display text-3xl font-extrabold">{idea.title}</h1>
      <VoteButtons ideaId={idea.id} score={community.score} count={community.count} />
      <p className="text-ink/80">{idea.teaser}</p>

      {idea.unlocked && idea.fullDetail ? (
        <section className="rounded-2xl border border-mint-500 bg-white p-5 shadow">
          <h2 className="font-display font-bold">Full detail (NDA-covered)</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{idea.fullDetail}</p>
          {idea.files.length > 0 && (
            <ul className="mt-3 text-sm">
              {idea.files.map((f) => <li key={f.id}>📎 {f.fileName}</li>)}
            </ul>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-primary-400 bg-primary-100/40 p-5">
          <p className="text-sm">🔒 Full design, files &amp; creator identity are locked.</p>
          {companyId ? <SignNdaForm ideaId={idea.id} /> : <RequestAccessButton ideaId={idea.id} />}
        </section>
      )}

      {similar.length > 0 && (
        <section>
          <h2 className="font-display font-bold">Similar ideas</h2>
          <div className="mt-2 grid gap-2">
            {similar.map((s) => (
              <Link key={s.id} href={`/ideas/${s.id}`} className="card-hover rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
                <b>{s.title}</b> <span className="text-ink/50">· {s.niche} · {Math.round(s.sim * 100)}% alike</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-ink/50">
        Origin hash <code>{idea.originHash ?? "—"}</code> ·{" "}
        <Link className="underline" href={`/api/ideas/${idea.id}/evidence`}>evidence pack (JSON)</Link>
      </p>
    </main>
  );
}
