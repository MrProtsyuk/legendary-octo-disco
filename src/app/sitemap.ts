import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    prisma.project.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.writingPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/writing`, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
    })),
    ...posts.map((p) => ({
      url: `${BASE_URL}/writing/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
