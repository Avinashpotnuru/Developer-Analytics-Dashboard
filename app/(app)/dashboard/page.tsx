"use client";

import * as React from "react";
import {
  CircleDot,
  FolderGit2,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Loader2,
  Star,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CommitActivityChart } from "@/components/charts/commit-activity-chart";
import { LanguageDistributionChart } from "@/components/charts/language-distribution-chart";
import { PrStatusChart } from "@/components/charts/pr-status-chart";
import { ContributionHeatmap } from "@/components/charts/contribution-heatmap";
import { RepositoriesTable } from "@/components/repositories/repositories-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";
import { RepoSelector } from "@/components/github/repo-selector";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import { useDeveloperAnalytics } from "@/lib/analytics/queries";
import { formatRangeLabel } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import type { ActivityEvent } from "@/lib/types";

const KPI_ICONS: Record<string, LucideIcon> = {
  repositories: FolderGit2,
  stars: Star,
  forks: GitFork,
  commits: GitCommitHorizontal,
  pullRequests: GitPullRequest,
  issues: CircleDot,
};

export default function DashboardPage() {
  const { username, selectedRepo, dateRange } = useGitHubContext();
  const fullName = repoFullName(selectedRepo);
  const {
    analytics,
    profile,
    repositories,
    commits,
    isLoading,
    isRefreshing,
    isError,
    error,
    sectionErrors,
    refetch,
  } = useDeveloperAnalytics();

  if (!username) {
    return <OnboardingGuide />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !analytics) {
    return (
      <ErrorState
        title="Could not load the dashboard"
        message={error?.message ?? "An unexpected error occurred."}
        onRetry={refetch}
      />
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <div className="space-y-6">
        <Header username={username} />
        <EmptyState
          title="No repositories found"
          description={`We couldn't find any public repositories for @${username}.`}
        />
      </div>
    );
  }

  const { overview, languages, commits: commitAnalytics } = analytics;
  const weekly = commitAnalytics.activity.weekly;
  const daily = commitAnalytics.activity.daily;

  const kpis = [
    { id: "repositories", label: "Repositories", value: overview.totalRepositories },
    { id: "stars", label: "Total Stars", value: overview.totalStars },
    { id: "forks", label: "Forks", value: overview.totalForks },
    { id: "commits", label: "Recent commits", value: overview.totalCommits },
    { id: "pullRequests", label: "Recent PRs", value: overview.totalPullRequests },
    { id: "issues", label: "Recent Issues", value: overview.totalIssues },
  ];

  const firstName = (profile?.name ?? username).split(" ")[0];
  const recentEvents: ActivityEvent[] = (commits ?? []).slice(0, 8).map(
    (commit) => ({
      id: commit.id,
      type: "commit",
      repository: commit.repository,
      description: commit.message,
      date: commit.date,
    }),
  );

  return (
    <div className="space-y-6">
      <Header username={username} />

      <DashboardControls isRefreshing={isRefreshing} onRefresh={refetch} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="ring-brand-gradient rounded-full p-1">
              <Avatar size="lg" className="!size-20">
                <AvatarImage src={profile?.avatarUrl} alt={profile?.name ?? username} />
                <AvatarFallback>
                  {(profile?.name ?? username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand">Welcome back</p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">
                {firstName}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                You have{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(overview.totalRepositories)}
                </span>{" "}
                public repositories with{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(overview.totalStars)}
                </span>{" "}
                total stars.
              </p>
            </div>
            <div className="sm:ml-auto sm:text-right">
              <p className="font-heading text-4xl font-semibold tracking-tight tabular-nums text-gradient">
                {formatNumber(overview.totalStars)}
              </p>
              <p className="text-sm text-muted-foreground">total stars earned</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {kpis.slice(0, 2).map((kpi) => (
            <StatCard
              key={kpi.id}
              label={kpi.label}
              value={formatNumber(kpi.value)}
              icon={KPI_ICONS[kpi.id] ?? FolderGit2}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.slice(2).map((kpi) => (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={formatNumber(kpi.value)}
            icon={KPI_ICONS[kpi.id] ?? FolderGit2}
            featured={kpi.id === "commits"}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commit Activity</CardTitle>
            <CardDescription>
              Weekly commits · {formatRangeLabel(dateRange)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sectionErrors.activity ? (
              <ErrorState
                title="Commit activity unavailable"
                message={sectionErrors.activity.message}
                onRetry={refetch}
              />
            ) : (
              <CommitActivityChart data={weekly} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Languages in {fullName ?? "the repository"}</CardDescription>
          </CardHeader>
          <CardContent>
            {sectionErrors.languages ? (
              <ErrorState
                title="Languages unavailable"
                message={sectionErrors.languages.message}
                onRetry={refetch}
              />
            ) : (
              <LanguageDistributionChart data={languages.distribution} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Contribution Graph</CardTitle>
            <CardDescription>
              Your coding activity · {formatRangeLabel(dateRange)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sectionErrors.activity ? (
              <ErrorState
                title="Contribution graph unavailable"
                message={sectionErrors.activity.message}
                onRetry={refetch}
              />
            ) : (
              <ContributionHeatmap data={daily} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest commits across the repository</CardDescription>
          </CardHeader>
          <CardContent>
            {sectionErrors.commits ? (
              <ErrorState
                title="Activity unavailable"
                message={sectionErrors.commits.message}
                onRetry={refetch}
              />
            ) : recentEvents.length > 0 ? (
              <RecentActivity events={recentEvents} />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No recent commits.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pull Requests</CardTitle>
            <CardDescription>
              Merge rate {Math.round(analytics.pullRequests.mergeRate)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sectionErrors.pulls ? (
              <ErrorState
                title="Pull requests unavailable"
                message={sectionErrors.pulls.message}
                onRetry={refetch}
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <PrStatusChart
                  data={{
                    open: analytics.pullRequests.open,
                    merged: analytics.pullRequests.merged,
                    closed: analytics.pullRequests.closed,
                  }}
                />
                <dl className="grid w-full grid-cols-3 gap-2 text-center">
                  <div>
                    <dt className="text-xs text-muted-foreground">Open</dt>
                    <dd className="font-heading text-lg font-semibold tabular-nums">
                      {formatNumber(analytics.pullRequests.open)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Merged</dt>
                    <dd className="font-heading text-lg font-semibold tabular-nums">
                      {formatNumber(analytics.pullRequests.merged)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Closed</dt>
                    <dd className="font-heading text-lg font-semibold tabular-nums">
                      {formatNumber(analytics.pullRequests.closed)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <RepositoriesTable repositories={repositories.slice(0, 6)} compact />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Header({ username }: { username: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Analytics for @{username}</p>
      </div>
    </div>
  );
}

function DashboardControls({
  isRefreshing,
  onRefresh,
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-3"
      aria-busy={isRefreshing}
    >
      <RepoSelector />
      <DateRangeFilter />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Refresh dashboard data"
      >
        <Loader2
          className={isRefreshing ? "size-4 animate-spin" : "size-4"}
          aria-hidden="true"
        />
        {isRefreshing ? "Refreshing…" : "Refresh"}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {isRefreshing ? "Refreshing dashboard data" : ""}
      </span>
    </div>
  );
}
