"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@prisma/client";
import { ImageUpload } from "./ImageUpload";
import { MarkdownEditor } from "./MarkdownEditor";
import { FormSection } from "./FormSection";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEdit = Boolean(project);

  const [title, setTitle] = useState(project?.title ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    project?.imageUrl ?? null
  );
  // Tag input — comma-separated is fine for v1 (§4.7).
  const [techStack, setTechStack] = useState(
    project?.techStack.join(", ") ?? ""
  );
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [order, setOrder] = useState(project?.order ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      summary,
      description,
      imageUrl,
      techStack: techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null,
      featured,
      order,
    };

    const res = await fetch(
      isEdit ? `/api/projects/${project!.slug}` : "/api/projects",
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
    router.push("/admin/projects");
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
          <label htmlFor="summary" className="block text-sm text-muted mb-1.5">
            Summary <span className="text-xs">(shown on the card)</span>
          </label>
          <textarea
            id="summary"
            required
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>
        <div>
          <label
            htmlFor="techStack"
            className="block text-sm text-muted mb-1.5"
          >
            Tech stack <span className="text-xs">(comma-separated)</span>
          </label>
          <input
            id="techStack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="Next.js, TypeScript, Prisma"
            className={`${inputClass} font-mono`}
          />
        </div>
      </FormSection>

      <FormSection label="Write-up">
        <MarkdownEditor
          label="Description (markdown)"
          value={description}
          onChange={setDescription}
        />
      </FormSection>

      <FormSection label="Media">
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          label="Hero image"
        />
      </FormSection>

      <FormSection label="Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="githubUrl"
              className="block text-sm text-muted mb-1.5"
            >
              GitHub URL <span className="text-xs">(optional)</span>
            </label>
            <input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label
              htmlFor="liveUrl"
              className="block text-sm text-muted mb-1.5"
            >
              Live URL <span className="text-xs">(optional)</span>
            </label>
            <input
              id="liveUrl"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>
      </FormSection>

      <FormSection label="Placement">
        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-[rgb(var(--color-accent))]"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            Order
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-20 rounded-md border border-line bg-bg px-2 py-1 text-sm font-mono outline-none focus:border-accent"
            />
          </label>
        </div>
      </FormSection>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent text-white dark:text-bg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-md border border-line px-5 py-2 text-sm text-muted hover:text-ink hover:border-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
