"use client";

import {
  CircleDot,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PrStatusChart } from "@/components/charts/pr-status-chart";
import { PullRequestTable } from "@/components/pull-requests/pull-request-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import { usePullRequests } from "@/lib/github/queries";
import { summarizePullRequests } from "@/lib/github/transform";
import { formatNumber } from "@/lib/format";

export default function PullRequestsPage() {
  const { selectedRepo } = useGitHubContext();
  const owner = selectedRepo?.owner;
  const repo = selectedRepo?.repo;
  const fullName = repoFullName(selectedRepo);

  const query = usePullRequests(owner, repo, { perPage: 100 });

  if (!selectedRepo) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pull Requests"
          description="Track and analyze pull request activity."
        />
        <EmptyState
          title="Select a repository"
          description="Choose a repository above to view its pull requests."
          action={<RepoSelector />}
        />
      </div>
    );
  }

  if (query.isLoading) {
    return <LoadingSkeleton />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load pull requests"
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const pullRequests = query.data ?? [];
  const counts = summarizePullRequests(pullRequests);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pull Requests"
        description={`Pull request activity for ${fullName ?? "the selected repository"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total PRs" value={formatNumber(counts.total)} icon={GitPullRequest} />
        <StatCard label="Open" value={formatNumber(counts.open)} icon={CircleDot} />
        <StatCard label="Merged" value={formatNumber(counts.merged)} icon={GitMerge} />
        <StatCard label="Closed" value={formatNumber(counts.closed)} icon={GitPullRequestClosed} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pull Request Status</CardTitle>
          <CardDescription>Distribution by current state</CardDescription>
        </CardHeader>
        <CardContent>
          <PrStatusChart
            data={{
              open: counts.open,
              merged: counts.merged,
              closed: counts.closed,
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Pull Request History
        </h2>
        {pullRequests.length === 0 ? (
          <EmptyState title="No pull requests" description="This repository has no pull requests." />
        ) : (
          <PullRequestTable pullRequests={pullRequests} />
        )}
      </div>
    </div>
  );
}
