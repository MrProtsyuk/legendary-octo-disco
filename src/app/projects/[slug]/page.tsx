import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/ui/Markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/projects"
        className="font-mono text-sm text-muted hover:text-accent transition-colors"
      >
        ← Work
      </Link>

      <h1 className="mt-6 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <p className="mt-3 text-muted">{project.summary}</p>

      {(project.githubUrl || project.liveUrl) && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent text-white dark:text-bg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Live site ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium hover:border-muted transition-colors"
            >
              GitHub ↗
            </a>
          )}
        </div>
      )}

      {project.imageUrl && (
        <div className="relative aspect-[16/9] mt-10 rounded-xl overflow-hidden border border-line">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {project.techStack.length > 0 && (
        <div className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Tech stack
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="font-mono text-xs border border-line rounded px-2 py-0.5"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Markdown>{project.description}</Markdown>
      </div>
    </article>
  );
}
