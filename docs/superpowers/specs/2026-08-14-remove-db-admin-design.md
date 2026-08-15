# Remove database/admin, switch to local static content

## Context

The portfolio site (built per `PORTFOLIO_DESIGN_DOC.md`) currently stores projects and
writing posts in Postgres (Supabase), edited through an `/admin` UI backed by NextAuth
and API routes, with images uploaded to Vercel Blob.

The Supabase free tier is ending. The database is currently empty (no projects or posts
have been published yet), so there is no data to migrate. The owner will maintain content
by editing files locally and redeploying, rather than through a live admin UI.

## Goal

Replace the database-backed content system with filesystem-backed static content, and
remove everything that only existed to support the database/admin/auth/upload stack.
The resulting app should require zero environment variables and have no server-side
data dependencies — content ships in the repo.

## Content storage

One markdown file per item, filename (minus `.md`) is the slug:

- `content/projects/<slug>.md`
- `content/writing/<slug>.md`

YAML frontmatter holds metadata; the markdown body is the long-form content
(`description` for projects, `content` for posts) — rendered by the existing
`Markdown` component exactly as before.

Projects frontmatter:
```yaml
title: string
summary: string
imageUrl: string | null       # e.g. /images/projects/my-app.png
techStack: string[]
githubUrl: string | null
liveUrl: string | null
featured: boolean
order: number
```

Writing frontmatter:
```yaml
title: string
excerpt: string
coverImage: string | null     # e.g. /images/writing/my-post.png
published: boolean
publishedAt: string | null    # ISO date
```

Parsed with `gray-matter` (new dependency — small, standard, zero-config).

## Data access layer

`src/lib/content.ts` replaces `src/lib/prisma.ts`:

- `getAllProjects(): Project[]` — reads `content/projects/*.md`, sorted by
  `order asc, then filename desc` (mirrors the old `orderBy`).
- `getProjectBySlug(slug: string): Project | null`
- `getAllPublishedPosts(): WritingPost[]` — reads `content/writing/*.md`, filters
  `published === true`, sorted by `publishedAt desc`.
- `getPostBySlug(slug: string): WritingPost | null` — returns null for unpublished
  posts too, so `notFound()` at the call site still hides drafts entirely (same
  behavior as today's DB query).

Reads happen via Node `fs`, at module scope so results are cached per server process
(fine for build-time static generation).

## Types

`src/types/index.ts`: drop the `@prisma/client` re-exports and `ProjectInput`/
`WritingPostInput` (only used by admin forms). Replace with plain interfaces:

```ts
export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string; // markdown body
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
  content: string; // markdown body
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
}
```

No `id`/`createdAt`/`updatedAt` — nothing in the UI uses them (`ProjectCard`/`PostCard`
key off `slug`; `WritingPostPage` uses `publishedAt`; no page reads `createdAt`/`updatedAt`).

## Pages

`src/app/projects/page.tsx`, `src/app/projects/[slug]/page.tsx`,
`src/app/writing/page.tsx`, `src/app/writing/[slug]/page.tsx`:

- Swap Prisma calls for the `content.ts` functions.
- Drop `export const dynamic = "force-dynamic"`.
- Add `generateStaticParams` to both `[slug]` pages (return all slugs from
  `getAllProjects`/`getAllPublishedPosts`), so pages are statically generated at
  build time.

`src/app/sitemap.ts` swaps its Prisma query for the same content functions.

## Images

No upload UI exists anymore, so images are placed directly under
`public/images/projects/` and `public/images/writing/`, referenced by path in
frontmatter (`imageUrl: /images/projects/my-app.png`). `next.config.mjs` drops the
Vercel Blob `remotePatterns` entry — local paths need no remote pattern.

## Full removal

- Directories: `src/app/admin/`, `src/app/api/`, `src/components/admin/`, `prisma/`
- Files: `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/schemas.ts`,
  `src/middleware.ts`
- `package.json` dependencies: `@prisma/client`, `prisma`, `next-auth`, `bcryptjs`,
  `@vercel/blob`, `zod`, `tsx` — confirmed unused outside the code being removed.
- `package.json` scripts: `db:push`, `db:seed`, `db:studio`, `postinstall`, and the
  `"prisma": { "seed": ... }` block.
- `.env` / `.env.example`: drop `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`,
  `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`. No env
  vars remain.
- `src/components/nav/DashboardNav.tsx`: drop the dead
  `if (pathname.startsWith("/admin")) return null;` guard.

## Testing

- `npm run build` succeeds with no Prisma/next-auth/env-var errors.
- Local dev: `/`, `/projects`, `/projects/<slug>`, `/writing`, `/writing/<slug>`
  render correctly with at least one sample project and one sample (published) post
  added under `content/`.
- An unpublished writing post's slug 404s.
- `/admin/*` and `/api/*` routes no longer exist (404).
- `npm run build` produces no leftover references to removed packages
  (`grep -r "@prisma/client\|next-auth\|bcryptjs\|@vercel/blob" src` returns nothing).
