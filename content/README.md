# Content

Projects and writing posts are markdown files with YAML frontmatter. The
filename (minus `.md`) is the URL slug.

## Projects — `content/projects/<slug>.md`

```yaml
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
```

## Writing posts — `content/writing/<slug>.md`

```yaml
---
title: My Post
excerpt: A one-line summary shown on the /writing list.
coverImage: /images/writing/my-post.png   # or omit / null for no image
published: true                           # false = never servable, even by direct URL
publishedAt: "2026-01-15"                 # ISO date; controls sort order
---

Long-form markdown post body goes here.
```

## Images

Drop image files into `public/images/projects/` or `public/images/writing/`
and reference them by absolute path (e.g. `/images/projects/my-app.png`) in
the frontmatter above.
