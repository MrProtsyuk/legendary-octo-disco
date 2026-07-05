"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

/**
 * Plain textarea + live markdown preview pane — confirmed for v1 (§4.7).
 * Upgrade path: swap the textarea for Tiptap, keep storing markdown (§13).
 */
export function MarkdownEditor({
  value,
  onChange,
  label,
  rows = 16,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  rows?: number;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted">{label}</span>
        <div className="flex rounded-md border border-line overflow-hidden">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs capitalize transition-colors ${
                tab === t
                  ? "bg-accent text-white dark:text-bg"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm font-mono leading-relaxed outline-none focus:border-accent resize-y"
          placeholder="Write markdown…"
        />
      ) : (
        <div className="rounded-md border border-line bg-bg px-4 py-3 min-h-[10rem]">
          {value.trim() ? (
            <div className="prose-content text-sm">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
