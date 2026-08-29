"use client";

import * as React from "react";
import { CheckCircle2, CircleDot, CircleSlash } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { IssueTrendChart } from "@/components/charts/issue-trend-chart";
import { IssueTable } from "@/components/issues/issue-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import { useDeveloperAnalytics } from "@/lib/analytics/queries";
import { calculateIssueTrend } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";

export default function IssuesPage() {
  const { selectedRepo, username } = useGitHubContext();
  const fullName = repoFullName(selectedRepo);
  const {
    analytics,
    issues,
    isLoading,
    isError,
    error,
    refetch,
  } = useDeveloperAnalytics();

  const trend = React.useMemo(
    () => calculateIssueTrend(issues ?? []),
    [issues],
  );

  if (!username) {
    return <OnboardingGuide />;
  }

  if (!selectedRepo) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Issues"
          description="Open and closed issues across your repositories."
        />
        <EmptyState
          title="Select a repository"
          description="Choose a repository above to view its issues."
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
        title="Could not load issues"
        message={error?.message ?? "An unexpected error occurred."}
        onRetry={refetch}
      />
    );
  }

  const issueAnalytics = analytics.issues;
  const list = issues ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issues"
        description={`Issue activity for ${fullName ?? "the selected repository"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Recent Issues" value={formatNumber(issueAnalytics.total)} icon={CircleSlash} />
        <StatCard label="Open" value={formatNumber(issueAnalytics.open)} icon={CircleDot} />
        <StatCard label="Closed" value={formatNumber(issueAnalytics.closed)} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Trend</CardTitle>
          <CardDescription>
            Issues opened vs closed per month · resolution rate{" "}
            {issueAnalytics.resolutionRate}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IssueTrendChart data={trend} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Issue History</h2>
        {list.length === 0 ? (
          <EmptyState title="No issues" description="This repository has no issues." />
        ) : (
          <IssueTable issues={list} />
        )}
      </div>
    </div>
  );
}
