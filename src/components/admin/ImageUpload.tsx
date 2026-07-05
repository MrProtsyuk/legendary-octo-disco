"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Upload failed — try again.");
      return;
    }
    const data = (await res.json()) as { url: string };
    onChange(data.url);
  }

  return (
    <div>
      <span className="block text-sm text-muted mb-1.5">{label}</span>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-line">
          <div className="relative aspect-[16/9]">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              sizes="672px"
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded bg-bg/90 border border-line px-2 py-1 text-xs hover:border-muted transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded bg-bg/90 border border-line px-2 py-1 text-xs text-red-500 hover:border-muted transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full rounded-lg border border-dashed border-line py-10 text-sm text-muted hover:border-muted hover:text-ink transition-colors disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Click to upload an image (max 5 MB)"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
