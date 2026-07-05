import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <AdminPageHeader
        kicker={`projects / ${project.slug}`}
        title={project.title}
        description="Changes go live as soon as you save."
      />
      <div className="mt-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
