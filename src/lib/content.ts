import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project, WritingPost } from "@/types";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");
const WRITING_DIR = path.join(process.cwd(), "content/writing");

// Slugs arrive from URL segments, so keep them to a single safe path component —
// otherwise a crafted slug like "../../secrets" escapes the content directory.
function isSafeSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

function readSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function readProject(slug: string): Project | null {
  if (!isSafeSlug(slug)) return null;
  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    slug,
    title: data.title,
    summary: data.summary,
    description: content.trim(),
    imageUrl: data.imageUrl ?? null,
    techStack: data.techStack ?? [],
    githubUrl: data.githubUrl ?? null,
    liveUrl: data.liveUrl ?? null,
    featured: data.featured ?? false,
    order: data.order ?? 0,
  };
}

export function getAllProjects(): Project[] {
  return readSlugs(PROJECTS_DIR)
    .map((slug) => readProject(slug)!)
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function getProjectBySlug(slug: string): Project | null {
  return readProject(slug);
}

function readPost(slug: string): WritingPost | null {
  if (!isSafeSlug(slug)) return null;
  const filePath = path.join(WRITING_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    content: content.trim(),
    coverImage: data.coverImage ?? null,
    published: data.published ?? false,
    publishedAt: data.publishedAt ?? null,
  };
}

export function getAllPublishedPosts(): WritingPost[] {
  return readSlugs(WRITING_DIR)
    .map((slug) => readPost(slug)!)
    .filter((post) => post.published)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

// Returns null for unpublished posts too, so notFound() at the call site
// hides drafts entirely — same behavior as the old `where: { published: true }` query.
export function getPostBySlug(slug: string): WritingPost | null {
  const post = readPost(slug);
  if (!post || !post.published) return null;
  return post;
}
