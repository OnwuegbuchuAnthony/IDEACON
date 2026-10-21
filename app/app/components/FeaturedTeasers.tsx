import Link from "next/link";
import { listTeasers } from "@/lib/ideas";

/** Live featured teasers (build-time data, revalidated hourly). */
export async function FeaturedTeasers() {
  const ideas = await listTeasers({}).then((all) => all.slice(0, 6));
  if (ideas.length === 0) return null;
  return (
    <section aria-label="Featured teasers" className="w-full">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Featured teasers
        </h2>
        <Link href="/discover" className="text-sm font-bold text-primary-600 underline underline-offset-4">
          All teasers →
        </Link>
      </div>
      <div className="mt-4 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="card-hover rounded-2xl border border-border bg-surface p-5 shadow"
          >
            <div className="flex flex-wrap gap-1 text-[11px] font-bold">
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-800">{idea.niche}</span>
              <span className="rounded-full bg-coral-100 px-2 py-0.5 text-coral-700">{idea.stage}</span>
            </div>
            <h3 className="mt-2 font-display text-base font-bold">{idea.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{idea.teaser}</p>
            <p className="mt-2 text-xs font-bold text-ink/50">🔒 Full detail under NDA</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
