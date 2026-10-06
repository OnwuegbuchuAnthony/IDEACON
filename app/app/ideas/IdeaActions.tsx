"use client";

import { useState } from "react";
import { requestAccessAction, signNdaAction } from "@/lib/actions";

export function RequestAccessButton({ ideaId }: { ideaId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className="rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white"
      onClick={async () => { setBusy(true); await requestAccessAction(ideaId); }}
    >
      {busy ? "Requesting…" : "Request access"}
    </button>
  );
}

export function SignNdaForm({ ideaId }: { ideaId: string }) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex flex-col gap-2 rounded-2xl border-2 border-violet-500 bg-violet-100/40 p-5"
      action={async () => signNdaAction({ ideaId, signerName: name })}
    >
      <h3 className="font-display font-bold">🔐 Sign mutual NDA (v1) — 14-day access</h3>
      <input aria-label="Full legal name of signer" placeholder="Full legal name of signer" value={name} onChange={(e) => setName(e.target.value)} required />
      <button className="rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white" type="submit">
        Sign &amp; unlock full detail
      </button>
    </form>
  );
}
