import { PageHeader } from "@/components/shared/page-header";
import { RepositoriesTable } from "@/components/repositories/repositories-table";
import { mockRepositories } from "@/lib/mock-data";

export default function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositories"
        description="Browse, search and analyze all of your repositories."
      />
      <RepositoriesTable repositories={mockRepositories} />
    </div>
  );
}
