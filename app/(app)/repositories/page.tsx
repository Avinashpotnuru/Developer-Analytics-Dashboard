"use client";

import { FolderGit2, GitFork, Star } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RepositoriesTable } from "@/components/repositories/repositories-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { useDeveloperAnalytics } from "@/lib/analytics/queries";
import { formatNumber } from "@/lib/format";

export default function RepositoriesPage() {
  const {
    analytics,
    repositories,
    isLoading,
    isError,
    error,
    refetch,
  } = useDeveloperAnalytics();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !analytics || !repositories) {
    return (
      <ErrorState
        title="Could not load repositories"
        message={error?.message ?? "An unexpected error occurred."}
        onRetry={refetch}
      />
    );
  }

  const repoAnalytics = analytics.repositories;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositories"
        description="Browse, search and analyze all of your repositories."
      />
      {repositories.length === 0 ? (
        <EmptyState
          title="No repositories found"
          description="We couldn't find any public repositories for this account."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Repositories" value={formatNumber(repoAnalytics.totalRepositories)} icon={FolderGit2} />
            <StatCard label="Total Stars" value={formatNumber(repoAnalytics.totalStars)} icon={Star} />
            <StatCard label="Total Forks" value={formatNumber(repoAnalytics.totalForks)} icon={GitFork} />
            <StatCard
              label="Avg Stars / Repo"
              value={formatNumber(repoAnalytics.averageStarsPerRepository)}
              icon={Star}
            />
          </div>
          <div className="flex justify-end">
            <RepoSelector />
          </div>
          <RepositoriesTable repositories={repositories} />
        </>
      )}
    </div>
  );
}
