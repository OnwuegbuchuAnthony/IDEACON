"use client";

import { postMessageAction } from "@/lib/actions";

export function MessageForm({ dealId }: { dealId: string }) {
  return (
    <form className="flex gap-2" action={async (fd: FormData) => {
      await postMessageAction({ dealId, body: String(fd.get("body")) });
    }}>
      <input name="body" placeholder="Broker note to parties…" required />
      <button className="rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white" type="submit">
        Send
      </button>
    </form>
  );
}
