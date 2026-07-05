"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@prisma/client";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="pulse-border block rounded-xl border border-line bg-surface overflow-hidden hover:border-muted transition-colors h-full"
      >
        {project.imageUrl ? (
          <div className="relative aspect-[16/9] border-b border-line">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] border-b border-line bg-bg flex items-center justify-center">
            <span className="font-mono text-xs text-muted">
              {project.slug}
            </span>
          </div>
        )}
        <div className="p-6">
          <h2 className="font-display text-xl font-semibold">
            {project.title}
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {project.summary}
          </p>
          {project.techStack.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs text-muted border border-line rounded px-2 py-0.5"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
