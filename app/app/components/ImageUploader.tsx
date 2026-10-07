"use client";

import { useState } from "react";

/**
 * Image upload via presigned R2 URL, then hands the key to a server action.
 * Accepts common image types, 5MB cap. Degrades gracefully when R2 is unset.
 */
export function ImageUploader({
  label,
  accept = "image/png,image/jpeg,image/webp",
  onUploaded,
}: {
  label: string;
  accept?: string;
  onUploaded: (r2Key: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function pick(file: File | undefined) {
    if (!file || busy) return;
    if (file.size > 5 * 1024 * 1024) {
      setNote("Max 5MB — pick a smaller file.");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const res = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: file.type || "application/octet-stream" }),
      });
      if (!res.ok) throw new Error("storage");
      const { url, r2Key } = await res.json();
      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error("upload");
      await onUploaded(r2Key);
    } catch {
      setNote("Upload unavailable — storage not configured yet.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-bold">
        {label}
        <input
          type="file"
          accept={accept}
          aria-label={label}
          disabled={busy}
          onChange={(e) => pick(e.target.files?.[0])}
          className="mt-1 block text-sm font-normal"
        />
      </label>
      {busy && <p className="text-xs text-ink/50">Uploading…</p>}
      {note && <p className="text-xs text-amber-700">{note}</p>}
    </div>
  );
}
