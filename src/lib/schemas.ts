import { z } from "zod";

// Request-body validation for the API routes (§6).
// Extend these schemas rather than trusting req.json() directly.

const optionalUrl = z
  .string()
  .url()
  .nullish()
  .or(z.literal("").transform(() => null));

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().min(1, "Summary is required").max(500),
  description: z.string().min(1, "Description is required"),
  imageUrl: optionalUrl,
  techStack: z.array(z.string().min(1).max(50)).default([]),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const writingPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  content: z.string().min(1, "Content is required"),
  coverImage: optionalUrl,
  published: z.boolean().default(false),
});
