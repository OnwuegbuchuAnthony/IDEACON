/** Skeleton for the /discover list (also used while browse filters load). */
export default function DiscoverLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12" aria-busy="true" aria-label="Loading ideas">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="skeleton h-5 w-full max-w-md rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton mt-2 h-3 w-full rounded" />
            <div className="skeleton mt-1 h-3 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
