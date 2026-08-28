"use client";

import * as React from "react";
import {
  CircleDot,
  FolderGit2,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Star,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CommitActivityChart } from "@/components/charts/commit-activity-chart";
import { LanguageDistributionChart } from "@/components/charts/language-distribution-chart";
import { ContributionHeatmap } from "@/components/charts/contribution-heatmap";
import { RepositoriesTable } from "@/components/repositories/repositories-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { RepoSelector } from "@/components/github/repo-selector";
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import {
  useCommits,
  useCommitActivity,
  useIssues,
  useLanguages,
  usePullRequests,
  useRepositories,
  useUser,
} from "@/lib/github/queries";
import {
  summarizeIssues,
  summarizePullRequests,
  summarizeRepositories,
} from "@/lib/github/transform";
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
  const { username, selectedRepo, setSelectedRepo } = useGitHubContext();
  const fullName = repoFullName(selectedRepo);

  const user = useUser(username);
  const repos = useRepositories(username, {
    perPage: 100,
    sort: "updated",
    type: "owner",
  });
  const activity = useCommitActivity(selectedRepo?.owner, selectedRepo?.repo);
  const languages = useLanguages(selectedRepo?.owner, selectedRepo?.repo);
  const pulls = usePullRequests(selectedRepo?.owner, selectedRepo?.repo, {
    perPage: 100,
  });
  const issues = useIssues(selectedRepo?.owner, selectedRepo?.repo, {
    perPage: 100,
  });
  const commits = useCommits(selectedRepo?.owner, selectedRepo?.repo, {
    perPage: 100,
  });

  React.useEffect(() => {
    if (!selectedRepo && repos.data && repos.data.length > 0) {
      const [owner, ...rest] = repos.data[0].fullName.split("/");
      setSelectedRepo({ owner, repo: rest.join("/") });
    }
  }, [selectedRepo, repos.data, setSelectedRepo]);

  const isLoading = user.isLoading || repos.isLoading;
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const userError = user.error ?? repos.error;
  if (userError) {
    return (
      <ErrorState
        title="Could not load the dashboard"
        message={userError.message}
        onRetry={() => {
          void user.refetch();
          void repos.refetch();
        }}
      />
    );
  }

  const profile = user.data;
  if (!profile) {
    return null;
  }

  const repoList = repos.data ?? [];

  if (repoList.length === 0) {
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

  const repoSummary = summarizeRepositories(repoList);
  const prSummary = summarizePullRequests(pulls.data ?? []);
  const issueSummary = summarizeIssues(issues.data ?? []);
  const weekly = activity.data?.weekly ?? [];
  const totalCommits = weekly.reduce((sum, point) => sum + point.commits, 0);
  const contribution = activity.data?.daily ?? [];

  const kpis = [
    { id: "repositories", label: "Repositories", value: repoSummary.count },
    { id: "stars", label: "Total Stars", value: repoSummary.totalStars },
    { id: "forks", label: "Forks", value: repoSummary.totalForks },
    { id: "commits", label: "Commits", value: totalCommits },
    { id: "pullRequests", label: "Pull Requests", value: prSummary.total },
    { id: "issues", label: "Issues", value: issueSummary.total },
  ];

  const firstName = profile.name.split(" ")[0];
  const recentEvents: ActivityEvent[] = (commits.data ?? []).slice(0, 8).map(
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="ring-brand-gradient rounded-full p-1">
              <Avatar size="lg" className="!size-20">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback>
                  {profile.name.slice(0, 2).toUpperCase()}
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
                  {formatNumber(repoSummary.count)}
                </span>{" "}
                public repositories with{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(repoSummary.totalStars)}
                </span>{" "}
                total stars.
              </p>
            </div>
            <div className="sm:ml-auto sm:text-right">
              <p className="font-heading text-4xl font-semibold tracking-tight tabular-nums text-gradient">
                {formatNumber(repoSummary.totalStars)}
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
              Weekly commits for {fullName ?? "the selected repository"}
            </CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Languages in {fullName ?? "the repository"}</CardDescription>
          </CardHeader>
          <CardContent>
            {languages.isError ? (
              <ErrorState
                title="Languages unavailable"
                message={languages.error.message}
                onRetry={() => void languages.refetch()}
              />
            ) : (
              <LanguageDistributionChart data={languages.data ?? []} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contribution Graph</CardTitle>
            <CardDescription>Your coding activity over the last year</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.isError ? (
              <ErrorState
                title="Contribution graph unavailable"
                message={activity.error.message}
                onRetry={() => void activity.refetch()}
              />
            ) : (
              <ContributionHeatmap data={contribution} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest commits across the repository</CardDescription>
          </CardHeader>
          <CardContent>
            {commits.isError ? (
              <ErrorState
                title="Activity unavailable"
                message={commits.error.message}
                onRetry={() => void commits.refetch()}
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
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <RepositoriesTable repositories={repoList.slice(0, 6)} compact />
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
      <RepoSelector />
    </div>
  );
}
