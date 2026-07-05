import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div>
      <AdminPageHeader
        kicker={`${projects.length} total · ${featuredCount} featured`}
        title="Projects"
        description="What shows up on /projects, in this order."
        action={{ href: "/admin/projects/new", label: "+ New project" }}
      />

      {projects.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-16 text-center">
          <p className="font-mono text-sm text-muted">
            $ ls projects/ <span className="text-ink">— empty.</span> Create
            the first one.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex items-center gap-5 rounded-xl border border-line bg-surface px-5 py-4 hover:border-accent/40 transition-colors"
            >
              <span className="font-mono text-xs text-muted w-8 text-right shrink-0">
                {String(project.order).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-semibold truncate">
                    {project.title}
                  </span>
                  {project.featured && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-accent bg-accent/10 rounded px-1.5 py-0.5">
                      featured
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span className="font-mono truncate">/{project.slug}</span>
                  <span aria-hidden>·</span>
                  <span>updated {formatDate(project.updatedAt)}</span>
                </div>
                {project.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] text-muted border border-line rounded px-1.5 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 5 && (
                      <span className="font-mono text-[10px] text-muted px-1">
                        +{project.techStack.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/projects/${project.slug}`}
                  className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:text-ink hover:bg-bg transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="rounded-md px-2.5 py-1.5 text-sm text-accent hover:bg-accent/10 transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton
                  endpoint={`/api/projects/${project.slug}`}
                  label={project.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
