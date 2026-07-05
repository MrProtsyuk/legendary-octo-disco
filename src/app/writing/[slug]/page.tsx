import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import readingTime from "reading-time";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/ui/Markdown";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.writingPost.findUnique({ where: { slug } });
  if (!post || !post.published) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.writingPost.findUnique({ where: { slug } });
  // Draft posts are invisible on the public site entirely (§4.6).
  if (!post || !post.published) notFound();

  const stats = readingTime(post.content);

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/writing"
        className="font-mono text-sm text-muted hover:text-accent transition-colors"
      >
        ← Writing
      </Link>

      <h1 className="mt-6 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
        {post.title}
      </h1>
      <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted">
        <span>{formatDate(post.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span>{stats.text}</span>
      </div>

      {post.coverImage && (
        <div className="relative aspect-[16/9] mt-10 rounded-xl overflow-hidden border border-line">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  );
}
