import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/PostForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.writingPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <AdminPageHeader
        kicker={`writing / ${post.slug} · ${post.published ? "published" : "draft"}`}
        title={post.title}
        description="Changes go live as soon as you save."
      />
      <div className="mt-8">
        <PostForm post={post} />
      </div>
    </div>
  );
}
