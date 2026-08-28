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
import { useCommits, useCommitActivity } from "@/lib/github/queries";
import { formatDate, formatNumber } from "@/lib/format";

export default function CommitsPage() {
  const { selectedRepo } = useGitHubContext();
  const owner = selectedRepo?.owner;
  const repo = selectedRepo?.repo;
  const fullName = repoFullName(selectedRepo);

  const commits = useCommits(owner, repo, { perPage: 100 });
  const activity = useCommitActivity(owner, repo);

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

  if (commits.isLoading || activity.isLoading) {
    return <LoadingSkeleton />;
  }

  if (commits.isError) {
    return (
      <ErrorState
        title="Could not load commits"
        message={commits.error.message}
        onRetry={() => void commits.refetch()}
      />
    );
  }

  const list = commits.data ?? [];
  const contributors = new Set(list.map((commit) => commit.author)).size;
  const latest = list[0];
  const earliest = list[list.length - 1];
  const weekly = activity.data?.weekly ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commits"
        description={`Commit history for ${fullName ?? "the selected repository"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Commits" value={formatNumber(list.length)} icon={GitCommitHorizontal} />
        <StatCard label="Contributors" value={formatNumber(contributors)} icon={Users} />
        <StatCard
          label="Latest Commit"
          value={latest ? formatDate(latest.date) : "—"}
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
          {activity.isError ? (
            <ErrorState
              title="Commit activity unavailable"
              message={activity.error.message}
              onRetry={() => void activity.refetch()}
            />
          ) : (
            <CommitActivityChart data={weekly} />
          )}
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
