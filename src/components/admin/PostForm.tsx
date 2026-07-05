"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WritingPost } from "@prisma/client";
import { ImageUpload } from "./ImageUpload";
import { MarkdownEditor } from "./MarkdownEditor";
import { FormSection } from "./FormSection";

export function PostForm({ post }: { post?: WritingPost }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(
    post?.coverImage ?? null
  );
  const [published, setPublished] = useState(post?.published ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = { title, excerpt, content, coverImage, published };

    const res = await fetch(
      isEdit ? `/api/writing/${post!.slug}` : "/api/writing",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Save failed — check the fields and try again.");
      return;
    }
    router.push("/admin/writing");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-md border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <FormSection label="Details">
        <div>
          <label htmlFor="title" className="block text-sm text-muted mb-1.5">
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm text-muted mb-1.5">
            Excerpt <span className="text-xs">(shown in the list)</span>
          </label>
          <textarea
            id="excerpt"
            required
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>
      </FormSection>

      <FormSection label="Content">
        <MarkdownEditor
          label="Body (markdown)"
          value={content}
          onChange={setContent}
          rows={20}
        />
      </FormSection>

      <FormSection label="Media">
        <ImageUpload
          value={coverImage}
          onChange={setCoverImage}
          label="Cover image (optional)"
        />
      </FormSection>

      <FormSection label="Visibility">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-[rgb(var(--color-accent))]"
          />
          Published
          <span className="text-xs text-muted">
            — drafts are invisible on the public site
          </span>
        </label>
      </FormSection>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent text-white dark:text-bg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/writing")}
          className="rounded-md border border-line px-5 py-2 text-sm text-muted hover:text-ink hover:border-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
