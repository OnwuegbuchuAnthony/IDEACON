import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ScoreButton, StatusButtons, ReviewForm } from "./ReviewActions";

export default async function ReviewPage() {
  await requireRole("REVIEWER", "BROKER", "ADMIN");
  const queue = await db.idea.findMany({
    where: { status: { in: ["SUBMITTED", "IN_REVIEW", "SCORED"] } },
    select: {
      id: true, title: true, teaser: true, niche: true, stage: true, status: true,
      aiScores: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Review queue ({queue.length})</h1>
      {queue.map((idea) => (
        <article key={idea.id} className="rounded-2xl border border-primary-100 bg-white p-5 shadow">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-800">{idea.niche}</span>
            <span className="rounded-full bg-sun-100 px-2 py-0.5 text-amber-800">{idea.status}</span>
            <StatusButtons ideaId={idea.id} current={idea.status} />
            <ScoreButton ideaId={idea.id} />
          </div>
          <h2 className="mt-2 font-display font-bold">{idea.title}</h2>
          <p className="text-sm text-ink/70">{idea.teaser}</p>
          {idea.aiScores[0] ? (
            <p className="mt-1 text-xs">
              AI bands — O {idea.aiScores[0].originality} · F {idea.aiScores[0].feasibility} · M {idea.aiScores[0].marketFit}{" "}
              <span className="text-ink/50">(advisory — you decide)</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink/50">Not scored yet.</p>
          )}
          <ReviewForm ideaId={idea.id} />
        </article>
      ))}
      {queue.length === 0 && <p className="text-ink/60">Queue clear. 🎉</p>}
    </main>
  );
}
