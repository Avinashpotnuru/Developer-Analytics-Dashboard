"use client";

import { PageHeader } from "@/components/shared/page-header";
import { RepositoriesTable } from "@/components/repositories/repositories-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { useGitHubContext } from "@/components/github/github-context";
import { useRepositories } from "@/lib/github/queries";

export default function RepositoriesPage() {
  const { username } = useGitHubContext();
  const { data, isLoading, error, refetch } = useRepositories(username, {
    perPage: 100,
    sort: "updated",
    type: "owner",
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load repositories"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  const repos = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositories"
        description="Browse, search and analyze all of your repositories."
      />
      {repos.length === 0 ? (
        <EmptyState
          title="No repositories found"
          description={`We couldn't find any public repositories for @${username}.`}
        />
      ) : (
        <>
          <div className="flex justify-end">
            <RepoSelector />
          </div>
          <RepositoriesTable repositories={repos} />
        </>
      )}
    </div>
  );
}
