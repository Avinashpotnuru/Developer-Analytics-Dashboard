"use client";

import { Clock, GitCommitHorizontal, History, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CommitActivityChart } from "@/components/charts/commit-activity-chart";
import { CommitTable } from "@/components/commits/commit-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import { useDeveloperAnalytics } from "@/lib/analytics/queries";
import { formatDate, formatNumber } from "@/lib/format";

export default function CommitsPage() {
  const { selectedRepo } = useGitHubContext();
  const fullName = repoFullName(selectedRepo);
  const {
    analytics,
    commits,
    isLoading,
    isError,
    error,
    refetch,
  } = useDeveloperAnalytics();

  if (!selectedRepo) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Commits"
          description="Commit history and statistics for a repository."
        />
        <EmptyState
          title="Select a repository"
          description="Choose a repository above to view its commit history."
          action={<RepoSelector />}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !analytics) {
    return (
      <ErrorState
        title="Could not load commits"
        message={error?.message ?? "An unexpected error occurred."}
        onRetry={refetch}
      />
    );
  }

  const commitAnalytics = analytics.commits;
  const list = commits ?? [];
  const contributors = new Set(list.map((commit) => commit.author)).size;
  const earliest = list[list.length - 1];
  const weekly = commitAnalytics.activity.weekly;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commits"
        description={`Commit history for ${fullName ?? "the selected repository"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recent commits" value={formatNumber(commitAnalytics.totalCommits)} icon={GitCommitHorizontal} />
        <StatCard label="Contributors" value={formatNumber(contributors)} icon={Users} />
        <StatCard
          label="Avg / Week"
          value={formatNumber(commitAnalytics.averageCommitsPerWeek)}
          icon={Clock}
        />
        <StatCard
          label="First Commit"
          value={earliest ? formatDate(earliest.date) : "—"}
          icon={History}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commit Activity</CardTitle>
          <CardDescription>Weekly commits over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          <CommitActivityChart data={weekly} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Commit History</h2>
        {list.length === 0 ? (
          <EmptyState title="No commits" description="This repository has no commit history available." />
        ) : (
          <CommitTable commits={list} />
        )}
      </div>
    </div>
  );
}
