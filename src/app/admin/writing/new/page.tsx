import { PostForm } from "@/components/admin/PostForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewPostPage() {
  return (
    <div>
      <AdminPageHeader
        kicker="writing / new"
        title="New post"
        description="Starts as a draft unless you tick Published."
      />
      <div className="mt-8">
        <PostForm />
      </div>
    </div>
  );
}
