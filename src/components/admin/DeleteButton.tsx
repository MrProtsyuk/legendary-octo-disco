"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(endpoint, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      window.alert("Delete failed — try again.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="rounded-md px-2.5 py-1.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
