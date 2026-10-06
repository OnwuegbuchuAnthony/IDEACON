"use client";

import { useState } from "react";
import { issueKeyAction, revokeKeyAction } from "@/lib/actions-phase2";

export function IssueKeyForm({ companies }: { companies: { id: string; name: string }[] }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [name, setName] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow">
      <h2 className="font-display font-bold">Issue API key</h2>
      <form
        className="mt-2 flex flex-wrap items-center gap-2"
        action={async () => {
          const res = await issueKeyAction(companyId, name);
          setSecret(res.secret);
        }}
      >
        <select value={companyId} aria-label="Company" onChange={(e) => setCompanyId(e.target.value)} style={{ maxWidth: 220 }}>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input aria-label="Key name" placeholder="Key name (e.g. data-warehouse)" value={name} onChange={(e) => setName(e.target.value)} required style={{ maxWidth: 240 }} />
        <button className="rounded-full bg-primary-600 px-4 py-2 text-xs font-bold text-white" type="submit">Issue</button>
      </form>
      {secret && (
        <p className="mt-2 rounded-xl bg-sun-100 p-3 text-sm">
          Copy now — shown once: <code className="font-bold">{secret}</code>
        </p>
      )}
    </div>
  );
}

export function RevokeButton({ keyId }: { keyId: string }) {
  return (
    <button onClick={() => revokeKeyAction(keyId)}
      className="tap rounded-full bg-coral-100 px-3 py-1 text-xs font-bold text-coral-700">
      Revoke
    </button>
  );
}
