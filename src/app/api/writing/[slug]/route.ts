import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writingPostSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const post = await prisma.writingPost.findUnique({ where: { slug } });

  // Public GET only sees published posts; the admin session can read drafts.
  if (!post || (!post.published && !session)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await prisma.writingPost.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = writingPostSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const post = await prisma.writingPost.update({
    where: { slug },
    data: {
      ...parsed.data,
      // Stamp publishedAt on first publish; keep the original on re-publish.
      publishedAt:
        parsed.data.published && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const existing = await prisma.writingPost.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.writingPost.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
