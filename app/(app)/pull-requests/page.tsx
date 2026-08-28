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
import { useDeveloperAnalytics } from "@/lib/analytics/queries";
import { formatNumber } from "@/lib/format";

export default function PullRequestsPage() {
  const { selectedRepo } = useGitHubContext();
  const fullName = repoFullName(selectedRepo);
  const {
    analytics,
    pullRequests,
    isLoading,
    isError,
    error,
    refetch,
  } = useDeveloperAnalytics();

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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !analytics) {
    return (
      <ErrorState
        title="Could not load pull requests"
        message={error?.message ?? "An unexpected error occurred."}
        onRetry={refetch}
      />
    );
  }

  const prAnalytics = analytics.pullRequests;
  const list = pullRequests ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pull Requests"
        description={`Pull request activity for ${fullName ?? "the selected repository"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total PRs" value={formatNumber(prAnalytics.total)} icon={GitPullRequest} />
        <StatCard label="Open" value={formatNumber(prAnalytics.open)} icon={CircleDot} />
        <StatCard label="Merged" value={formatNumber(prAnalytics.merged)} icon={GitMerge} />
        <StatCard label="Closed" value={formatNumber(prAnalytics.closed)} icon={GitPullRequestClosed} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pull Request Status</CardTitle>
          <CardDescription>
            Distribution by current state · merge rate {prAnalytics.mergeRate}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrStatusChart
            data={{
              open: prAnalytics.open,
              merged: prAnalytics.merged,
              closed: prAnalytics.closed,
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Pull Request History
        </h2>
        {list.length === 0 ? (
          <EmptyState title="No pull requests" description="This repository has no pull requests." />
        ) : (
          <PullRequestTable pullRequests={list} />
        )}
      </div>
    </div>
  );
}
