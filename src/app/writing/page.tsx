import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/writing/PostCard";
import { HeroConstellation } from "@/components/motion/HeroConstellation";
import { BookGlyph } from "@/components/motion/PageGlyphs";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and notes.",
};

export const dynamic = "force-dynamic";

export default async function WritingPage() {
  // The query itself excludes drafts (§4.6) — not just hidden by UI.
  const posts = await prisma.writingPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="relative overflow-hidden flex-1">
      <HeroConstellation variant="ambient" />
      <section className="relative mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center gap-4">
        <BookGlyph className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 text-accent" />
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Writing
        </h1>
      </div>
      <p className="mt-3 text-muted">Essays and notes.</p>

      {posts.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-line p-16 text-center">
          <p className="font-mono text-sm text-muted">
            Nothing published yet — check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
