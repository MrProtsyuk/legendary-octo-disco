export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
}

export interface WritingPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
}
