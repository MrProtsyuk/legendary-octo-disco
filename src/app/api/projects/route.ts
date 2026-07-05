import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";
import { projectSchema } from "@/lib/schemas";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Slug generated server-side from the title (§5).
  const slug = await uniqueSlug(parsed.data.title, async (candidate) => {
    const existing = await prisma.project.findUnique({
      where: { slug: candidate },
    });
    return existing !== null;
  });

  const project = await prisma.project.create({
    data: { ...parsed.data, slug },
  });

  return NextResponse.json(project, { status: 201 });
}
