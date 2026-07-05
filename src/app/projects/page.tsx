import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { HeroConstellation } from "@/components/motion/HeroConstellation";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects — what I've built and why.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Fetched server-side directly via Prisma (§4.3) — no client fetch.
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="relative overflow-hidden">
      <HeroConstellation variant="ambient" />
      <section className="relative mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
        Work
      </h1>
      <p className="mt-3 text-muted max-w-xl">
        Selected projects — what I built, what I chose, and why.
      </p>

      {projects.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-line p-16 text-center">
          <p className="font-mono text-sm text-muted">
            Nothing here yet — projects are on their way.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
