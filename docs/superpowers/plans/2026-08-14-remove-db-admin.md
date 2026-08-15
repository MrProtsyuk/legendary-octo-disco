# Remove DB/Admin, Switch to Static Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Postgres/Prisma/NextAuth/admin-UI content system with filesystem-backed markdown content, so the site needs zero database, zero auth, and zero environment variables.

**Architecture:** Projects and writing posts become one markdown file each (YAML frontmatter + markdown body) under `content/projects/` and `content/writing/`, read via a small `src/lib/content.ts` module using Node `fs` + `gray-matter`. Pages switch from Prisma queries to this module and from `force-dynamic` to static generation. Everything that only existed to support the DB/admin/auth/upload stack is deleted.

**Tech Stack:** Next.js 15 (App Router), TypeScript, `gray-matter` (new), existing `react-markdown` / `reading-time`.

## Global Constraints

> **Executed 2026-08-14** on branch `remove-db-admin`. Deviations from the plan as written are
> noted inline below with **[deviation]**.

- The database is currently empty — there is no data to migrate.
- The finished app must require zero environment variables.
- Do not leave references to `@prisma/client`, `next-auth`, `bcryptjs`, `@vercel/blob`, or `zod` anywhere under `src/`.
- Draft (`published: false`) writing posts must never be servable by slug (`getPostBySlug` returns `null` for them, same as the old DB query behavior).
- No test framework exists in this repo (`package.json` has no test runner). Verification steps use `npx tsc --noEmit`, `npm run build`, and manual `curl`/`grep` checks instead of a unit test suite — this matches how the app is already verified.

---

### Task 1: Content data layer

**Files:**
- Modify: `package.json` (add `gray-matter` dependency)
- Create: `src/lib/content.ts`
- Create: `content/README.md`
- Create: `content/projects/.gitkeep`
- Create: `content/writing/.gitkeep`
- Create: `public/images/projects/.gitkeep`
- Create: `public/images/writing/.gitkeep`
- Create (temporary, deleted in Task 3): `content/projects/test-project.md`, `content/writing/published-post.md`, `content/writing/draft-post.md`
- Test (temporary, deleted at end of this task): `verify-content.ts` (repo root)

**Interfaces:**
- Produces: `getAllProjects(): Project[]`, `getProjectBySlug(slug: string): Project | null`, `getAllPublishedPosts(): WritingPost[]`, `getPostBySlug(slug: string): WritingPost | null` — all exported from `@/lib/content`. `Project`/`WritingPost` types come from `@/types` (defined in Task 2 — for this task, inline-define matching local types at the top of `content.ts`; Task 2 will replace them with the shared `@/types` import).

- [x] **Step 1: Add `gray-matter` and install**

Edit `package.json`, add to `dependencies` (alphabetical, after `framer-motion`):

```json
    "gray-matter": "^4.0.3",
```

Run: `npm install`
Expected: installs cleanly, `package-lock.json` updates.

- [x] **Step 2: Create content and image directories**

```bash
mkdir -p content/projects content/writing public/images/projects public/images/writing
touch content/projects/.gitkeep content/writing/.gitkeep public/images/projects/.gitkeep public/images/writing/.gitkeep
```

- [x] **Step 3: Document the frontmatter schema**

Create `content/README.md`:

```markdown
# Content

Projects and writing posts are markdown files with YAML frontmatter. The
filename (minus `.md`) is the URL slug.

## Projects — `content/projects/<slug>.md`

\`\`\`yaml
---
title: My App
summary: A one-line summary shown on the /projects card.
imageUrl: /images/projects/my-app.png   # or omit / null for no image
techStack: [Next.js, TypeScript, Postgres]
githubUrl: https://github.com/you/my-app  # optional
liveUrl: https://my-app.com               # optional
featured: true
order: 1                                  # lower sorts first
---

Long-form markdown description goes here.
\`\`\`

## Writing posts — `content/writing/<slug>.md`

\`\`\`yaml
---
title: My Post
excerpt: A one-line summary shown on the /writing list.
coverImage: /images/writing/my-post.png   # or omit / null for no image
published: true                           # false = never servable, even by direct URL
publishedAt: "2026-01-15"                 # ISO date; controls sort order
---

Long-form markdown post body goes here.
\`\`\`

## Images

Drop image files into `public/images/projects/` or `public/images/writing/`
and reference them by absolute path (e.g. `/images/projects/my-app.png`) in
the frontmatter above.
```

- [x] **Step 4: Write the content data layer**

Create `src/lib/content.ts`:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// TODO(Task 2): replace these with `import type { Project, WritingPost } from "@/types";`
export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
}

export interface WritingPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
}

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");
const WRITING_DIR = path.join(process.cwd(), "content/writing");

function readSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function readProject(slug: string): Project | null {
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
```

- [x] **Step 5: Create fixtures to verify against**

Create `content/projects/test-project.md`:

```markdown
---
title: Test Project
summary: A project used to verify the content layer.
techStack: [TypeScript, Next.js]
featured: false
order: 1
---

This is the **test** project body.
```

Create `content/writing/published-post.md`:

```markdown
---
title: Published Post
excerpt: A post used to verify the content layer.
published: true
publishedAt: "2026-01-01"
---

This is the published post body.
```

Create `content/writing/draft-post.md`:

```markdown
---
title: Draft Post
excerpt: Should never be readable.
published: false
---

Draft body.
```

- [x] **Step 6: Write and run the verification script**

Create `verify-content.ts` (repo root):

```ts
import assert from "node:assert";
import {
  getAllProjects,
  getProjectBySlug,
  getAllPublishedPosts,
  getPostBySlug,
} from "./src/lib/content";

const projects = getAllProjects();
assert.strictEqual(projects.length, 1, `expected 1 project, got ${projects.length}`);
assert.strictEqual(projects[0].slug, "test-project");
assert.deepStrictEqual(projects[0].techStack, ["TypeScript", "Next.js"]);

const project = getProjectBySlug("test-project");
assert.ok(project);
assert.strictEqual(project.description, "This is the **test** project body.");
assert.strictEqual(getProjectBySlug("does-not-exist"), null);

const posts = getAllPublishedPosts();
assert.strictEqual(posts.length, 1, `expected 1 published post, got ${posts.length}`);
assert.strictEqual(posts[0].slug, "published-post");

assert.strictEqual(
  getPostBySlug("draft-post"),
  null,
  "draft post must not be readable by slug"
);
const post = getPostBySlug("published-post");
assert.ok(post);
assert.strictEqual(post.title, "Published Post");

console.log("content.ts verification passed");
```

Run: `npx tsx verify-content.ts`
Expected: prints `content.ts verification passed` with no assertion errors.

- [x] **Step 7: Delete the verification script (keep the fixtures for Task 3)**

```bash
rm verify-content.ts
```

- [x] **Step 8: Commit**

```bash
git add package.json package-lock.json src/lib/content.ts content/
git commit -m "Add filesystem-backed content data layer"
```

---

### Task 2: Plain content types + card components

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/components/writing/PostCard.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `Project`, `WritingPost` interfaces exported from `@/types`, matching the shapes already defined inline in `src/lib/content.ts` (Task 1, Step 4).

- [x] **Step 1: Replace the Prisma-derived types**

Replace the full contents of `src/types/index.ts`:

```ts
export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
}

export interface WritingPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
}
```

- [x] **Step 2: Point `content.ts` at the shared types**

Edit `src/lib/content.ts`: delete the inline `Project`/`WritingPost` interfaces added in Task 1 (including the `// TODO(Task 2)` comment above them), and add at the top of the file:

```ts
import type { Project, WritingPost } from "@/types";
```

- [x] **Step 3: Update `ProjectCard` to import the shared type**

In `src/components/projects/ProjectCard.tsx`, change:

```ts
import type { Project } from "@prisma/client";
```

to:

```ts
import type { Project } from "@/types";
```

- [x] **Step 4: Update `PostCard` to import the shared type**

In `src/components/writing/PostCard.tsx`, change:

```ts
import type { WritingPost } from "@prisma/client";
```

to:

```ts
import type { WritingPost } from "@/types";
```

- [x] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (pages still query Prisma at this point, but Prisma's generated `Project`/`WritingPost` types are a structural superset of the new interfaces, so they remain assignable).

**[deviation]** This expectation was wrong. Prisma types are *not* a superset: `publishedAt` is
`Date | null` there vs `string | null` here, so `src/app/writing/page.tsx` fails to type-check at
this point. The error is transient and Task 3 Step 3 resolves it by replacing that query.
Also: `ProjectInput`/`WritingPostInput` were dropped from `src/types/index.ts` and confirmed
unreferenced anywhere in `src`.

- [x] **Step 6: Commit**

```bash
git add src/types/index.ts src/lib/content.ts src/components/projects/ProjectCard.tsx src/components/writing/PostCard.tsx
git commit -m "Replace Prisma-derived content types with plain interfaces"
```

---

### Task 3: Migrate pages off Prisma

**Files:**
- Modify: `src/app/projects/page.tsx`
- Modify: `src/app/projects/[slug]/page.tsx`
- Modify: `src/app/writing/page.tsx`
- Modify: `src/app/writing/[slug]/page.tsx`
- Modify: `src/app/sitemap.ts`
- Delete (fixtures from Task 1, once verification passes): `content/projects/test-project.md`, `content/writing/published-post.md`, `content/writing/draft-post.md`

**Interfaces:**
- Consumes: `getAllProjects`, `getProjectBySlug`, `getAllPublishedPosts`, `getPostBySlug` from `@/lib/content` (Task 1).

- [x] **Step 1: Migrate `src/app/projects/page.tsx`**

Replace:

```ts
import { prisma } from "@/lib/prisma";
```

with:

```ts
import { getAllProjects } from "@/lib/content";
```

Replace:

```ts
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Fetched server-side directly via Prisma (§4.3) — no client fetch.
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
```

with:

```ts
export default function ProjectsPage() {
  const projects = getAllProjects();
```

**[deviation]** Also required: the `ProjectCard` list key was `project.id`, which no longer exists
on the new `Project` type. Changed to `project.slug`. The same fix was needed for `post.id` →
`post.slug` in `src/app/writing/page.tsx` (Step 3).

- [x] **Step 2: Migrate `src/app/projects/[slug]/page.tsx`**

Replace:

```ts
import { prisma } from "@/lib/prisma";
```

with:

```ts
import { getAllProjects, getProjectBySlug } from "@/lib/content";
```

Remove `export const dynamic = "force-dynamic";`.

Replace both occurrences of:

```ts
  const project = await prisma.project.findUnique({ where: { slug } });
```

with:

```ts
  const project = getProjectBySlug(slug);
```

(drop `await` from both call sites and from `generateMetadata`/the page function — they no longer need to be `async` for this call, but stay `async` since `params` is still a `Promise`).

Add, after the imports:

```ts
export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}
```

- [x] **Step 3: Migrate `src/app/writing/page.tsx`**

Replace:

```ts
import { prisma } from "@/lib/prisma";
```

with:

```ts
import { getAllPublishedPosts } from "@/lib/content";
```

Replace:

```ts
export const dynamic = "force-dynamic";

export default async function WritingPage() {
  // The query itself excludes drafts (§4.6) — not just hidden by UI.
  const posts = await prisma.writingPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
```

with:

```ts
export default function WritingPage() {
  // getAllPublishedPosts() itself excludes drafts — not just hidden by UI.
  const posts = getAllPublishedPosts();
```

- [x] **Step 4: Migrate `src/app/writing/[slug]/page.tsx`**

Replace:

```ts
import { prisma } from "@/lib/prisma";
```

with:

```ts
import { getAllPublishedPosts, getPostBySlug } from "@/lib/content";
```

Remove `export const dynamic = "force-dynamic";`.

In `generateMetadata`, replace:

```ts
  const post = await prisma.writingPost.findUnique({ where: { slug } });
  if (!post || !post.published) return {};
```

with:

```ts
  const post = getPostBySlug(slug);
  if (!post) return {};
```

In the page component, replace:

```ts
  const post = await prisma.writingPost.findUnique({ where: { slug } });
  // Draft posts are invisible on the public site entirely (§4.6).
  if (!post || !post.published) notFound();
```

with:

```ts
  // getPostBySlug returns null for drafts, so they're invisible on the public site entirely.
  const post = getPostBySlug(slug);
  if (!post) notFound();
```

Add, after the imports:

```ts
export async function generateStaticParams() {
  return getAllPublishedPosts().map((post) => ({ slug: post.slug }));
}
```

- [x] **Step 5: Migrate `src/app/sitemap.ts`**

Replace the full file contents:

```ts
import type { MetadataRoute } from "next";
import { getAllProjects, getAllPublishedPosts } from "@/lib/content";

// TODO: replace with the production domain before deploying.
const BASE_URL = "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects();
  const posts = getAllPublishedPosts();

  return [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/writing`, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({ url: `${BASE_URL}/projects/${p.slug}` })),
    ...posts.map((p) => ({ url: `${BASE_URL}/writing/${p.slug}` })),
  ];
}
```

- [x] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [x] **Step 7: Start the dev server and verify against the Task 1 fixtures**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000/projects | grep -o "Test Project"
curl -s http://localhost:3000/projects/test-project | grep -o "<strong>test</strong>"
curl -s http://localhost:3000/writing | grep -o "Published Post"
curl -s http://localhost:3000/writing | grep -c "Draft Post"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/writing/published-post
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/writing/draft-post
kill %1
```

Expected: `Test Project` found; `<strong>test</strong>` found; `Published Post` found; draft count is `0`; published-post status is `200`; draft-post status is `404`.

- [x] **Step 8: Remove the fixtures now that pages are verified**

```bash
rm content/projects/test-project.md content/writing/published-post.md content/writing/draft-post.md
```

- [x] **Step 9: Commit**

```bash
git add src/app/projects src/app/writing src/app/sitemap.ts content/
git commit -m "Migrate projects/writing pages and sitemap off Prisma to content.ts"
```

---

### Task 4: Remove DB/admin/auth/API code

**Files:**
- Delete: `src/app/admin/` (entire directory)
- Delete: `src/app/api/` (entire directory)
- Delete: `src/components/admin/` (entire directory)
- Delete: `prisma/` (entire directory)
- Delete: `src/lib/auth.ts`
- Delete: `src/lib/prisma.ts`
- Delete: `src/lib/schemas.ts`
- Delete: `src/middleware.ts`
- Modify: `src/lib/utils.ts`
- Modify: `src/components/nav/DashboardNav.tsx`

**Interfaces:**
- Consumes: nothing (this task only removes code; Task 3 already removed every remaining reference to the files being deleted here).

- [x] **Step 1: Delete the admin UI, API routes, and Prisma schema**

```bash
rm -rf src/app/admin src/app/api src/components/admin prisma
```

- [x] **Step 2: Delete auth/DB/validation library files**

```bash
rm src/lib/auth.ts src/lib/prisma.ts src/lib/schemas.ts src/middleware.ts
```

- [x] **Step 3: Remove now-dead slug helpers from `utils.ts`**

`slugify`/`uniqueSlug` were only used by the admin API routes just deleted. Replace the full contents of `src/lib/utils.ts`:

```ts
/** Format a date for display, e.g. "3 Jul 2026". */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
```

- [x] **Step 4: Remove the dead `/admin` guard from `DashboardNav`**

In `src/components/nav/DashboardNav.tsx`, remove:

```ts

  // The admin area has its own chrome — keep the public nav out of it.
  if (pathname.startsWith("/admin")) return null;
```

(the blank line directly above `return (` in `DashboardNav` stays — only the comment + `if` statement go).

- [x] **Step 5: Verify no dangling references remain**

Run: `grep -rn "@prisma/client\|next-auth\|bcryptjs\|@vercel/blob\|from \"zod\"\|from '@/lib/prisma'\|from \"@/lib/auth\"\|from \"@/lib/schemas\"" src`
Expected: no output.

Run: `npx tsc --noEmit`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add -A -- src prisma
git commit -m "Remove admin UI, API routes, auth, and Prisma"
```

---

### Task 5: Dependency, config, and env cleanup + final verification

**Files:**
- Modify: `package.json`
- Modify: `next.config.mjs`
- Delete: `.env`
- Delete: `.env.example`

**Interfaces:**
- Consumes: nothing new — this task removes now-unused dependencies/config and does a full end-to-end check of Tasks 1–4.

- [x] **Step 1: Trim `package.json`**

Remove from `dependencies`: `"@prisma/client"`, `"@vercel/blob"`, `"bcryptjs"`, `"next-auth"`, `"zod"`.
Remove from `devDependencies`: `"prisma"`, `"tsx"`.
Remove scripts: `"db:push"`, `"db:seed"`, `"db:studio"`, `"postinstall"`.
Remove the top-level `"prisma": { "seed": "tsx prisma/seed.ts" }` block.

The resulting `package.json` should read:

```json
{
  "name": "portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "framer-motion": "^12.19.2",
    "gray-matter": "^4.0.3",
    "next": "^15.3.4",
    "next-themes": "^0.4.6",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-markdown": "^10.1.0",
    "reading-time": "^1.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.15.33",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3"
  }
}
```

(Keep whatever exact version strings the current `gray-matter` install produced from Task 1, Step 1, if different from `^4.0.3`.)

Run: `npm install`
Expected: installs cleanly, `package-lock.json` updates, `node_modules` for the removed packages goes away.

- [x] **Step 2: Drop the Vercel Blob image remote pattern**

Replace `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [x] **Step 3: Delete the env files**

```bash
rm -f .env .env.example
```

- [x] **Step 4: Full build verification**

Run: `npm run build`
Expected: build succeeds with no Prisma/next-auth/env-var errors, and the output lists `/projects` and `/writing` (and their `[slug]` children, if any content exists) as statically generated (`○` or `●`), not server-rendered on every request.

- [x] **Step 5: Runtime smoke test**

```bash
npm run start &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/about
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/projects
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/writing
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/projects
kill %1
```

Expected: `/`, `/about`, `/projects`, `/writing` all return `200`; `/admin` and `/api/projects` both return `404`.

- [x] **Step 6: Final grep sweep**

Run: `grep -rn "@prisma/client\|next-auth\|bcryptjs\|@vercel/blob\|DATABASE_URL\|DIRECT_URL\|NEXTAUTH" src package.json next.config.mjs`
Expected: no output.

**[deviation]** This sweep caught a file the plan never listed: `src/app/robots.ts` read
`process.env.NEXTAUTH_URL`, which would have broken the zero-env-vars goal. Rewrote it to use a
hardcoded `BASE_URL` with a TODO matching `sitemap.ts`, and dropped the now-meaningless
`disallow: ["/admin", "/api"]`. `grep -rn "process\.env" src` is now empty.

**[note]** `.env` (gitignored, never committed) held live Supabase/NextAuth/Blob credentials. It was
deleted as the plan specified, and the final `npm run build` was verified green with no `.env`
present at all — confirming the zero-env-vars goal. Those credentials should still be rotated/revoked
at the provider, since deleting the local file does not invalidate them.

- [x] **Step 7: Commit**

```bash
git add -A -- package.json package-lock.json next.config.mjs .env .env.example
git commit -m "Remove DB/auth/upload dependencies and env vars"
```
