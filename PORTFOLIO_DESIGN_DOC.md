# Portfolio Site — Design Document

**Author:** Mark
**Purpose:** Spec for building out `portfolio-scaffold.zip` into a finished site. Written to hand to Claude (Fable 5) inside Claude Code as the source of truth for implementation decisions.

---

## 1. Overview & Goals

A single-page-feeling personal site with four sections — Home, Work/Projects, About, Writing — plus a private admin area where Mark can add/edit projects and writing posts directly from the browser, with no code deploy required per update.

**Goals**
- Feels like a SPA: instant, animated transitions between sections, no full page reloads
- Content (projects, writing posts) is editable live, from the site itself, behind auth
- Sleek but not templated — a real visual point of view, not default AI-generated aesthetics
- Fast to ship an MVP, easy to keep extending afterward

**Non-goals (for v1)**
- Multi-user / public sign-up (this is a single-admin CMS, not a platform)
- Comments, likes, or other social features on writing posts
- A native mobile app — responsive web is sufficient

---

## 2. Tech Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript** | You already know Next.js/TS from Dev Catapult. App Router gives client-side navigation (no full reloads, feels like an SPA) *and* a built-in API layer, so you don't need a separate backend service for auth/CRUD. |
| Styling | **Tailwind CSS** | Fast to theme via CSS variables (see §9 for how light/dark actually works), pairs cleanly with the token system in §3. |
| Animation | **Framer Motion** | Page-transition wrapper, hover/scroll micro-interactions, theme-toggle motion. Industry-standard, good docs, plays well with App Router. |
| Database | **PostgreSQL** (via Neon or Supabase free tier) | Relational fits this data cleanly (Projects, WritingPost, one User). Prisma makes the schema portable if you outgrow the free tier. |
| ORM | **Prisma** | Type-safe queries, migrations via `db push`, seed script for the admin user. |
| Auth | **NextAuth.js, Credentials provider, single seeded admin** | You are the only user — no public registration flow. NextAuth handles session/JWT plumbing so you're not hand-rolling cookie logic. |
| Image storage | **Vercel Blob** (swap for Cloudinary/S3 if not deploying to Vercel) | Simple upload API, works well with `next/image`. |
| Content format | **Markdown**, rendered via `react-markdown` | Lets the writing editor be a plain textarea + live preview rather than a full rich-text editor — much less to build for v1. |
| Deployment | **Vercel** | Zero-config for Next.js + Postgres via Neon integration + Blob storage all in one place. |

**Alternative considered:** a pure client-side SPA (Vite + React Router) with a separate Express/GraphQL backend. Rejected for v1 — it doubles the deployment surface (two services instead of one) for no real benefit at this scale, and you'd be rebuilding auth/session handling that NextAuth gives you for free. GraphQL is worth revisiting later if the API surface grows past simple CRUD.

---

## 3. Visual & Motion Direction

This is a **starting point**, not a locked decision — adjust freely, but the intent is to avoid the three defaults AI-generated sites tend to converge on (cream+terracotta, near-black+neon accent, broadsheet/newspaper). Given the actual subject — CS/math precision crossed with theatre and long-distance running — the direction below leans into **precision with warmth**: a clean, technical grid system (nods to the math background) with one warm, deliberate accent color rather than a cold "startup blue."

**Palette** (light / dark pairs, already wired as CSS variables in `globals.css`)
- Background: warm off-white `#FAFAF9` / near-black `#0F0F10`
- Surface (cards): white `#FFFFFF` / charcoal `#1A1A1C`
- Ink (text): near-black `#171717` / off-white `#EDEDEB`
- Muted (secondary text): `#737373` / `#A3A3A3`
- Accent: indigo `#3B5BDB` / lifted indigo `#7A94FF` — think "chalk on a blackboard diagram," not "SaaS button blue"

**Type**
- Display (headings, nav wordmark): a characterful serif or slab with some editorial weight — something like *Fraunces* or *Newsreader* gives the theatre/writing side of the site some warmth without tipping into generic elegance
- Body: a clean, high-legibility sans — *Inter* or *Public Sans*
- Mono (tech-stack tags, code snippets in project write-ups): *JetBrains Mono* or *IBM Plex Mono* — a quiet nod to the engineering side

**Layout**
- Sticky top nav acting as the "dashboard" — persistent across all routes, active-link underline in accent color (already built in `DashboardNav.tsx`)
- Content column capped at a readable max-width (currently `max-w-5xl` / `max-w-2xl` for prose-heavy pages)
- Project grid: 2-column on desktop, 1-column on mobile, generous card padding

**Motion**
- Route transitions: short fade + 8px vertical slide (`PageTransition.tsx`) — subtle, not a full slide-in
- Project cards: small lift on hover (`-4px` translate), no rotation/scale gimmicks
- Theme toggle: icon rotates in on switch rather than a hard swap
- Respect `prefers-reduced-motion` everywhere (already handled globally in `globals.css`)
- **Signature moment (pick one, don't do all three):** a subtle animated constellation/graph-paper texture behind the Home hero that responds to cursor position; OR a typewriter-style reveal on the hero line (nod to writing); OR a scroll-triggered stagger on the project grid. One deliberate moment, not scattered effects everywhere.

---

## 4. Page-by-Page Spec

### 4.1 Dashboard Shell (persistent layout)
- Sticky nav: wordmark/name (left) · Home / Work / About / Writing (center-right) · theme toggle (far right)
- Active route gets an underline in accent color
- Lives in `src/app/layout.tsx`, never remounts on navigation

### 4.2 Home (`/`)
- Hero: name + one/two-line positioning statement
- Social links: LinkedIn, Instagram (add GitHub too — it's currently missing from the brief but you'll want it linked from Home, not just from individual project pages)
- Resume: link to a static PDF in `/public/resume.pdf` (simplest v1) — see §10 for a "view resume as a page" alternative
- **Decision: Home stays minimal** — hero + socials + resume only, no featured-project surfacing. Keeps Home fast to scan; Work is one click away via the nav. The `featured` field on `Project` is still useful (e.g. for sort order or a future use) even though Home doesn't query it.

### 4.3 Work / Projects (`/projects`)
- Grid of `ProjectCard`s, each showing: image, title, tech-stack tags, short summary
- Data fetched server-side directly via Prisma (no client fetch needed for the public view)
- Empty state when no projects exist yet (already handled in scaffold)
- Sort by `order` field (manual) then `createdAt` — lets you control which projects lead

### 4.4 Project Detail (`/projects/[slug]`)
- GitHub link, live-site link (either can be absent — e.g. private repos)
- Long-form description, rendered as markdown
- Hero image
- Consider: a "tech stack" section broken out from the card tags into a short paragraph on *why* those choices — this is where your engineering judgment shows, not just a list of logos

### 4.5 About (`/about`)
- Intentionally left as a stub in the scaffold — this is copywriting, not architecture
- Suggested shape: one paragraph on the engineering background, one on the through-line between math/theatre/running (discipline, repetition, performing under constraints — there's a real connective thread there if you want to use it), and what you're currently building toward

### 4.6 Writing — public (`/writing`, `/writing/[slug]`)
- List view: only `published: true` posts, sorted by `publishedAt` descending
- Detail view: markdown-rendered content
- Draft posts are invisible on the public site entirely (not just hidden by UI — the query itself excludes them)

### 4.7 Admin — auth & CRUD (`/admin/*`)
- `/admin/login` — email + password against the single seeded user (already built)
- `/admin/projects` — list with edit links, `+ New project` — **TODO**
- `/admin/projects/new` and `/admin/projects/[id]/edit` — form: title, summary, description (markdown textarea + preview), image upload, tech stack (tag input — comma-separated is fine for v1), GitHub URL, live URL, featured toggle — **TODO, placeholder in scaffold**
- `/admin/writing` — list with published/draft indicator, `+ New post` — **TODO**
- `/admin/writing/new` and `/admin/writing/[id]/edit` — form: title, excerpt, content (**plain textarea + live markdown preview pane — confirmed for v1**, upgrade path to Tiptap or similar noted in §13 if it starts feeling limiting), cover image, published toggle — **TODO, placeholder in scaffold**
- All of `/admin/*` is gated by `src/middleware.ts` — unauthenticated requests redirect to `/admin/login` automatically, nothing to build here

---

## 5. Data Model

See `prisma/schema.prisma` in the scaffold for the authoritative version. Summary:

- **User** — `id, email, passwordHash, createdAt`. Exactly one row, created by `prisma/seed.ts` from `.env` values. No registration endpoint exists anywhere in the app — that's deliberate.
- **Project** — `id, slug, title, summary, description, imageUrl, techStack[], githubUrl, liveUrl, featured, order, createdAt, updatedAt`
- **WritingPost** — `id, slug, title, excerpt, content, coverImage, published, publishedAt, createdAt, updatedAt`

Slugs are generated server-side from the title (`slugify()` in `src/lib/utils.ts`) on create — no need to expose a slug field in the admin forms unless you want manual override later.

---

## 6. API Design

REST, under `/api/*`. All mutating routes require an authenticated session (checked via `getServerSession(authOptions)`).

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/projects` | No | List all projects |
| POST | `/api/projects` | Yes | Create a project |
| GET | `/api/projects/[slug]` | No | Get one project |
| PUT | `/api/projects/[slug]` | Yes | Update a project |
| DELETE | `/api/projects/[slug]` | Yes | Delete a project |
| GET | `/api/writing` | No | List *published* posts only |
| POST | `/api/writing` | Yes | Create a post |
| GET | `/api/writing/[slug]` | No | Get one *published* post |
| PUT | `/api/writing/[slug]` | Yes | Update a post |
| DELETE | `/api/writing/[slug]` | Yes | Delete a post |
| POST | `/api/upload` | Yes | Upload an image, returns a URL — **not implemented yet, see TODO in file** |
| * | `/api/auth/[...nextauth]` | — | NextAuth's internal routes (signin/signout/session) |

Request bodies are validated with `zod` schemas already defined in each route file — extend those schemas rather than trusting `req.json()` directly when you add fields.

---

## 7. Auth & Security Notes

- Single admin account, seeded via environment variables — never hardcode credentials in source
- Session strategy: JWT (via NextAuth), no separate session table needed
- `src/middleware.ts` protects everything under `/admin/*` at the routing layer, before any page code runs
- **Before this goes fully public, still needed:**
  - Rate limiting / lockout on the login `authorize()` call — it's the one exposed door into the whole CMS. A simple in-memory or IP-based limiter is enough at this scale; Upstash Ratelimit is a drop-in if you want something more durable.
  - `NEXTAUTH_SECRET` must be a real random value in production, not the placeholder in `.env.example`
  - Validate uploaded file type/size in `/api/upload` once it's implemented, even though it's auth-gated

---

## 8. Image Handling

- Uploads go through `POST /api/upload` (auth-gated), which should store the file with your chosen provider and return a public URL
- That URL is what gets saved on `Project.imageUrl` / `WritingPost.coverImage` — the app never stores binary data itself
- `next/image` handles optimization/responsive sizing on the frontend; remember to add your storage provider's domain to `remotePatterns` in `next.config.mjs` (there's a TODO marking exactly where)

---

## 9. Theming System (light/dark)

- `next-themes` toggles a `dark` class on `<html>`; Tailwind is configured with `darkMode: "class"`
- Colors are defined once as CSS variables in `globals.css` (`--color-bg`, `--color-ink`, etc.) with a light set on `:root` and a dark set under `.dark` — Tailwind utility classes (`bg-bg`, `text-ink`, `text-accent`...) read from those variables, so changing the palette later means editing exactly one file
- Preference persists automatically via `next-themes` (defaults to system preference, remembers manual override)
- Toggle component already respects `prefers-reduced-motion` through the global CSS rule, not a special case in the component itself

---

## 10. Additional Recommended Features

Roughly in priority order — not required for v1, but each is low-effort relative to its payoff:

1. **SEO basics** — per-page `metadata` exports (title/description), Open Graph tags, a generated `sitemap.xml` and `robots.txt` (Next.js supports both as file conventions). Matters if you want project/writing links to look good when shared.
2. **Dynamic OG images** — `@vercel/og` can generate a share-preview image per project/post on the fly (title + your name, styled to match the site). Nice touch, genuinely easy with Next.js.
3. **RSS feed for Writing** — a `/writing/feed.xml` route generated from published posts. Cheap to add, meaningful if anyone wants to follow along without checking back manually.
4. **Command palette (⌘K)** — jump to any project/post/page by typing. Fits the "dashboard" framing nicely and reads as a deliberate, engineering-flavored touch rather than a generic feature. `cmdk` is a lightweight library for this.
5. **Tech-stack filtering on `/projects`** — if the project list grows past ~6–8 entries, a simple tag filter (client-side, no new API needed) keeps it scannable.
6. **Reading time on Writing posts** — `reading-time` is already a scaffold dependency; a one-line addition once posts have real content.
7. **Resume as a page, not just a PDF link** — an `/resume` route that renders the same content as structured HTML (in addition to the PDF) reads better on mobile and is more accessible. Keep the PDF for people who want to download/print.
8. **Testing** — you already know Jest from Dev Catapult; `jest` + `@testing-library/react` are already in the scaffold's devDependencies. Worth covering the slug generation logic and the auth-gating on API routes at minimum. Playwright for an end-to-end "can I log in and publish a post" smoke test is worth it given how central that flow is.
9. **CI** — a GitHub Actions workflow running `lint` + `test` on PRs, with Vercel's own preview-deploy-per-PR covering the rest.
10. **Analytics** — Vercel Analytics (zero-config if deploying there) or Plausible if you'd rather not touch cookies at all.
11. **404 page** — Next.js supports a custom `not-found.tsx`; worth a version that matches the site's voice rather than the framework default.

---

## 11. Folder Structure

```
portfolio/
├── prisma/
│   ├── schema.prisma        # User, Project, WritingPost
│   └── seed.ts               # creates the single admin user
├── src/
│   ├── middleware.ts          # protects /admin/*
│   ├── app/
│   │   ├── layout.tsx          # nav + theme provider + page transitions
│   │   ├── globals.css         # CSS variable tokens (light/dark)
│   │   ├── page.tsx             # Home
│   │   ├── about/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── projects/[slug]/page.tsx
│   │   ├── writing/page.tsx
│   │   ├── writing/[slug]/page.tsx
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── projects/{page,new,[id]/edit}.tsx
│   │   │   └── writing/{page,new,[id]/edit}.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── projects/{route,[slug]/route}.ts
│   │       ├── writing/{route,[slug]/route}.ts
│   │       └── upload/route.ts
│   ├── components/
│   │   ├── nav/{DashboardNav,ThemeToggle}.tsx
│   │   ├── motion/PageTransition.tsx
│   │   ├── projects/ProjectCard.tsx
│   │   ├── writing/PostCard.tsx
│   │   └── ui/ThemeProvider.tsx
│   ├── lib/{prisma,auth,utils}.ts
│   └── types/index.ts
└── public/                   # resume.pdf goes here
```

---

## 12. Suggested Build Order

The scaffold already covers step 0. Recommended order for what's left, each step independently shippable:

1. **Data layer** — stand up a free Postgres instance (Neon/Supabase), run `db:push`, run `db:seed`, confirm you can query via `db:studio`
2. **Public read-only site** — get Home/Projects/About/Writing rendering against real (even if minimal) seeded data, no admin yet
3. **Admin auth** — confirm login works end-to-end against the seeded user
4. **Admin CRUD forms** — build the four placeholder forms (§4.7); this is the biggest remaining chunk of actual work
5. **Image upload** — wire `/api/upload` to Vercel Blob (or your chosen provider)
6. **Visual pass** — apply the real palette/type decisions from §3, build the one signature motion moment, do a mobile pass
7. **Polish from §10** — SEO, OG images, RSS, command palette, in whatever order matters most to you
8. **Deploy** — Vercel + Neon + Blob, set real environment variables, re-seed against production DB

---

## 13. Open Questions (confirm before/while building)

**Resolved:**
- ~~Featured projects on Home?~~ → No, Home stays minimal (hero + socials + resume). See §4.2.
- ~~Markdown editor approach?~~ → Plain textarea + live preview for v1. See §4.7. If it starts feeling limiting once you're writing regularly, Tiptap is the natural upgrade — swap the textarea in `admin/writing/new` and `[id]/edit` for a Tiptap instance that still stores markdown/HTML in the same `content` field, no schema change needed.

**Still open:**
- Is GitHub a third social link on Home, separate from per-project GitHub links?
- Any content that should exist at launch vs. "add projects/posts after the fact" — worth seeding 2–3 real projects before the first deploy so the site isn't empty on day one.
