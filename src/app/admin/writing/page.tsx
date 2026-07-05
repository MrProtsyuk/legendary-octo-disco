import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminWritingPage() {
  const posts = await prisma.writingPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div>
      <AdminPageHeader
        kicker={`${posts.length} total · ${publishedCount} published · ${
          posts.length - publishedCount
        } drafts`}
        title="Writing"
        description="Drafts stay invisible on the public site until published."
        action={{ href: "/admin/writing/new", label: "+ New post" }}
      />

      {posts.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-16 text-center">
          <p className="font-mono text-sm text-muted">
            $ ls writing/ <span className="text-ink">— empty.</span> Write the
            first one.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex items-center gap-5 rounded-xl border border-line bg-surface px-5 py-4 hover:border-accent/40 transition-colors"
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  post.published ? "bg-accent" : "bg-line"
                }`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-semibold truncate">
                    {post.title}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 ${
                      post.published
                        ? "text-accent bg-accent/10"
                        : "text-muted bg-bg border border-line"
                    }`}
                  >
                    {post.published ? "published" : "draft"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span className="font-mono truncate">/{post.slug}</span>
                  <span aria-hidden>·</span>
                  <span>updated {formatDate(post.updatedAt)}</span>
                  {post.publishedAt && (
                    <>
                      <span aria-hidden>·</span>
                      <span>published {formatDate(post.publishedAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {post.published && (
                  <Link
                    href={`/writing/${post.slug}`}
                    className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:text-ink hover:bg-bg transition-colors"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/admin/writing/${post.id}/edit`}
                  className="rounded-md px-2.5 py-1.5 text-sm text-accent hover:bg-accent/10 transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton
                  endpoint={`/api/writing/${post.slug}`}
                  label={post.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
