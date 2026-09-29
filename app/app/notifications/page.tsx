import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { markInboxReadAction } from "@/lib/actions-workspace";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">Inbox</h1>
        <form action={markInboxReadAction}>
          <button className="rounded-full bg-primary-100 px-4 py-1 text-xs font-bold text-primary-800" type="submit">
            Mark all read
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <div key={n.id} className={`rounded-xl border px-4 py-2 text-sm shadow ${n.readAt ? "border-primary-100 bg-white" : "border-primary-400 bg-primary-100/50"}`}>
            {n.link ? <Link href={n.link} className="font-bold underline">{n.title}</Link> : <b>{n.title}</b>}
            <span className="ml-2 text-xs text-ink/50">{n.kind} · {n.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-ink/50">All quiet. Reviews, approvals and deals will land here.</p>}
      </div>
    </main>
  );
}
