import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatNgn } from "@/lib/billing";
import { MessageForm } from "../DealActions";
import { ValueForm } from "../ValueActions";

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!deal) return <main className="p-12">Deal not found.</main>;

  const events = await db.auditEvent.findMany({
    where: { ideaId: deal.ideaId },
    orderBy: { createdAt: "asc" },
    select: { type: true, createdAt: true, hash: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-12">
      <div className="flex flex-wrap gap-1 text-[11px] font-bold">
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-800">{deal.template}</span>
        <span className="rounded-full bg-sun-100 px-2 py-0.5 text-amber-800">{deal.status}</span>
        <span className="rounded-full bg-mint-100 px-2 py-0.5 text-emerald-800">{deal.currency}</span>
      </div>
      <h1 className="font-display text-3xl font-extrabold">Deal timeline</h1>
      <p className="text-sm">
        Value: <b>{formatNgn(deal.amountKobo)}</b> · Commission (10%): <b>{formatNgn(deal.commissionKobo)}</b>
      </p>
      <ValueForm dealId={deal.id} />

      <ul className="flex flex-col gap-2">
        {events.map((e) => (
          <li key={e.hash} className="rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm">
            <b>{e.type}</b> <span className="text-ink/50">· {e.createdAt.toISOString()} · #{e.hash.slice(0, 8)}</span>
          </li>
        ))}
      </ul>

      <h2 className="font-display text-xl font-bold">Broker-mediated thread</h2>
      <div className="flex flex-col gap-2">
        {deal.messages.map((m) => (
          <p key={m.id} className="rounded-xl bg-white border border-primary-100 px-4 py-2 text-sm">{m.body}</p>
        ))}
        {deal.messages.length === 0 && <p className="text-sm text-ink/50">No messages yet.</p>}
      </div>
      <MessageForm dealId={deal.id} />
    </main>
  );
}
