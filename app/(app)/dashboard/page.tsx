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
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CommitActivityChart } from "@/components/charts/commit-activity-chart";
import { LanguageDistributionChart } from "@/components/charts/language-distribution-chart";
import { ContributionHeatmap } from "@/components/charts/contribution-heatmap";
import { RepositoriesTable } from "@/components/repositories/repositories-table";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  type DateRangeValue,
  getCommitRange,
} from "@/components/shared/date-range-picker";
import { formatNumber } from "@/lib/format";
import {
  mockActivity,
  mockAnalytics,
  mockProfile,
  mockRepositories,
} from "@/lib/mock-data";

const KPI_ICONS: Record<string, LucideIcon> = {
  repositories: FolderGit2,
  stars: Star,
  forks: GitFork,
  commits: GitCommitHorizontal,
  pullRequests: GitPullRequest,
  issues: CircleDot,
};

export default function DashboardPage() {
  const loading = useSimulatedLoading(700);
  const [range, setRange] = React.useState<DateRangeValue>("12w");
  const [refreshing, setRefreshing] = React.useState(false);

  const commitData = React.useMemo(
    () => getCommitRange(mockAnalytics.commitActivity, range),
    [range],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const firstName = mockProfile.name.split(" ")[0];
  const commitsKpi =
    mockAnalytics.kpis.find((kpi) => kpi.id === "commits") ?? mockAnalytics.kpis[3];
  const reposKpi =
    mockAnalytics.kpis.find((kpi) => kpi.id === "repositories") ??
    mockAnalytics.kpis[0];

  return (
    <div className="space-y-6">
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="ring-brand-gradient rounded-full p-1">
              <Avatar size="lg" className="!size-20">
                <AvatarImage src={mockProfile.avatarUrl} alt={mockProfile.name} />
                <AvatarFallback>
                  {mockProfile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand">Welcome back</p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">
                {firstName}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                You shipped{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(commitsKpi.value)}
                </span>{" "}
                commits across{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {reposKpi.value}
                </span>{" "}
                repositories this year.
              </p>
            </div>
            <div className="sm:ml-auto sm:text-right">
              <p className="font-heading text-4xl font-semibold tracking-tight tabular-nums text-gradient">
                {formatNumber(mockProfile.totalStars)}
              </p>
              <p className="text-sm text-muted-foreground">total stars earned</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {mockAnalytics.kpis.slice(0, 2).map((kpi) => {
            const Icon = KPI_ICONS[kpi.id] ?? FolderGit2;
            return (
              <StatCard
                key={kpi.id}
                label={kpi.label}
                value={formatNumber(kpi.value)}
                change={kpi.change}
                spark={kpi.spark}
                icon={Icon}
              />
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockAnalytics.kpis.slice(2).map((kpi) => {
          const Icon = KPI_ICONS[kpi.id] ?? FolderGit2;
          return (
            <StatCard
              key={kpi.id}
              label={kpi.label}
              value={formatNumber(kpi.value)}
              change={kpi.change}
              spark={kpi.spark}
              icon={Icon}
              featured={kpi.id === "commits"}
            />
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commit Activity</CardTitle>
            <CardDescription>Commits over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <CommitActivityChart data={commitData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Share across repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageDistributionChart data={mockAnalytics.languageDistribution} />
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
            <ContributionHeatmap data={mockAnalytics.contribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity events={mockActivity.slice(0, 8)} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
            <CardDescription>Your most active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <RepositoriesTable repositories={mockRepositories.slice(0, 6)} compact />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
