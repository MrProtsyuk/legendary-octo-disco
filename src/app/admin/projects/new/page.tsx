import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewProjectPage() {
  return (
    <div>
      <AdminPageHeader
        kicker="projects / new"
        title="New project"
        description="The slug is generated from the title on save."
      />
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
