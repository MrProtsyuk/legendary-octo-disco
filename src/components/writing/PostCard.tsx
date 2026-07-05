import Link from "next/link";
import type { WritingPost } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import readingTime from "reading-time";

export function PostCard({ post }: { post: WritingPost }) {
  const stats = readingTime(post.content);

  return (
    <Link
      href={`/writing/${post.slug}`}
      className="pulse-border group block rounded-xl border border-line bg-surface p-6 hover:border-muted transition-colors"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl sm:text-2xl font-semibold group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <span className="font-mono text-xs text-muted whitespace-nowrap">
          {formatDate(post.publishedAt)}
        </span>
      </div>
      <p className="mt-2 text-muted leading-relaxed">{post.excerpt}</p>
      <span className="mt-3 inline-block font-mono text-xs text-muted">
        {stats.text}
      </span>
    </Link>
  );
}
