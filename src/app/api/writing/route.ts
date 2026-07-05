import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";
import { writingPostSchema } from "@/lib/schemas";

// Public list returns *published* posts only (§6).
export async function GET() {
  const posts = await prisma.writingPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = writingPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const slug = await uniqueSlug(parsed.data.title, async (candidate) => {
    const existing = await prisma.writingPost.findUnique({
      where: { slug: candidate },
    });
    return existing !== null;
  });

  const post = await prisma.writingPost.create({
    data: {
      ...parsed.data,
      slug,
      // Stamp publishedAt the first time a post goes live.
      publishedAt: parsed.data.published ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
