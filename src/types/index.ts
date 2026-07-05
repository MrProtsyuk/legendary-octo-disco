import type { Project, WritingPost } from "@prisma/client";

export type { Project, WritingPost };

/** Shape of the project create/edit form payloads. */
export interface ProjectInput {
  title: string;
  summary: string;
  description: string;
  imageUrl?: string | null;
  techStack: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  featured: boolean;
  order: number;
}

/** Shape of the writing post create/edit form payloads. */
export interface WritingPostInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  published: boolean;
}
