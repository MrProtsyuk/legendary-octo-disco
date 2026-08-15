import type { MetadataRoute } from "next";
import { getAllProjects, getAllPublishedPosts } from "@/lib/content";

// TODO: replace with the production domain before deploying.
const BASE_URL = "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects();
  const posts = getAllPublishedPosts();

  return [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/writing`, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({ url: `${BASE_URL}/projects/${p.slug}` })),
    ...posts.map((p) => ({ url: `${BASE_URL}/writing/${p.slug}` })),
  ];
}
