"use client";

import { useState } from "react";
import { submitIdeaAction } from "@/lib/actions";
import type { Niche } from "@prisma/client";

const NICHES: Niche[] = ["HEALTHTECH", "AGROTECH", "FINTECH", "BUSINESS", "OTHER"];
const STAGES = ["concept", "prototype", "ready-to-scale"];

export default function SubmitPage() {
  const [draft, setDraft] = useState({ title: "", teaser: "", fullDetail: "", problemType: "" });
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");

  // Draft autosave (offline-tolerant per design system).
  function update(field: keyof typeof draft, value: string) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    try {
      localStorage.setItem("ideacon:draft", JSON.stringify(next));
    } catch { /* private mode */ }
  }

  async function submit(formData: FormData) {
    setSaving(true);
    setNote("");
    // Upload attachments direct to R2 first (skipped gracefully if unconfigured).
    const uploaded: { r2Key: string; fileName: string; mimeType: string; sizeBytes: number }[] = [];
    for (const f of files) {
      try {
        const key = `${Date.now()}-${f.name}`;
        const res = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, contentType: f.type || "application/octet-stream" }),
        });
        if (!res.ok) throw new Error();
        const { url, r2Key } = await res.json();
        const put = await fetch(url, { method: "PUT", headers: { "Content-Type": f.type || "application/octet-stream" }, body: f });
        if (!put.ok) throw new Error();
        uploaded.push({ r2Key, fileName: f.name, mimeType: f.type, sizeBytes: f.size });
      } catch {
        setNote("Storage not configured — idea will submit without attachments.");
      }
    }
    await submitIdeaAction({
      title: String(formData.get("title")),
      teaser: String(formData.get("teaser")),
      fullDetail: String(formData.get("fullDetail")),
      niche: String(formData.get("niche")) as Niche,
      problemType: String(formData.get("problemType") ?? ""),
      stage: String(formData.get("stage") ?? "concept"),
      files: uploaded,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="font-display text-3xl font-extrabold">Submit your idea</h1>
      <p className="text-sm text-ink/70">
        Only the teaser goes public. Full detail stays locked behind NDA, with a
        timestamped proof-of-origin recorded at submit.
      </p>
      <form action={submit} className="flex flex-col gap-3">
        <input name="title" placeholder="Title" required defaultValue={draft.title}
          onChange={(e) => update("title", e.target.value)} />
        <textarea name="teaser" rows={3} placeholder="Public teaser (what it does, who it helps — no secrets)" required
          defaultValue={draft.teaser} onChange={(e) => update("teaser", e.target.value)} />
        <textarea name="fullDetail" rows={6} placeholder="Full detail (locked behind NDA)" required
          defaultValue={draft.fullDetail} onChange={(e) => update("fullDetail", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select name="niche" defaultValue="OTHER">
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <select name="stage" defaultValue="concept">
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <input name="problemType" placeholder="Problem type (e.g. post-harvest loss)"
          defaultValue={draft.problemType} onChange={(e) => update("problemType", e.target.value)} />
        <label className="text-sm font-bold">Attachments (drawings, prototypes, PDFs)
          <input type="file" multiple onChange={(e) => setFiles([...(e.target.files ?? [])])} />
        </label>
        {note && <p className="text-sm text-amber-700">{note}</p>}
        <button disabled={saving} className="rounded-full bg-gradient-to-r from-coral-500 to-orange-400 px-6 py-3 text-sm font-bold text-white" type="submit">
          {saving ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </main>
  );
}
