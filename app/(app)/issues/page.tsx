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
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import { useIssues } from "@/lib/github/queries";
import { summarizeIssues } from "@/lib/github/transform";
import { formatNumber } from "@/lib/format";
import type { Issue, IssueTrendPoint } from "@/lib/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonthLabel(iso: string): string {
  const [year, month] = iso.split("-");
  const index = Number(month) - 1;
  if (index < 0 || index > 11) return iso;
  return `${MONTHS[index]} ${year.slice(2)}`;
}

function buildIssueTrend(issues: Issue[]): IssueTrendPoint[] {
  const buckets = new Map<string, { opened: number; closed: number }>();
  for (const issue of issues) {
    const openedKey = issue.createdAt.slice(0, 7);
    const opened = buckets.get(openedKey) ?? { opened: 0, closed: 0 };
    opened.opened += 1;
    buckets.set(openedKey, opened);
    if (issue.state === "closed" && issue.closedAt) {
      const closedKey = issue.closedAt.slice(0, 7);
      const closed = buckets.get(closedKey) ?? { opened: 0, closed: 0 };
      closed.closed += 1;
      buckets.set(closedKey, closed);
    }
  }

  const labels: string[] = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    labels.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  return labels.map((label) => ({
    month: formatMonthLabel(label),
    opened: buckets.get(label)?.opened ?? 0,
    closed: buckets.get(label)?.closed ?? 0,
  }));
}

export default function IssuesPage() {
  const { selectedRepo } = useGitHubContext();
  const owner = selectedRepo?.owner;
  const repo = selectedRepo?.repo;
  const fullName = repoFullName(selectedRepo);

  const query = useIssues(owner, repo, { perPage: 100 });

  const issues = React.useMemo(() => query.data ?? [], [query.data]);
  const counts = summarizeIssues(issues);
  const trend = React.useMemo(() => buildIssueTrend(issues), [issues]);

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

  if (query.isLoading) {
    return <LoadingSkeleton />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Could not load issues"
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issues"
        description={`Issue activity for ${fullName ?? "the selected repository"}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Issues" value={formatNumber(counts.total)} icon={CircleSlash} />
        <StatCard label="Open" value={formatNumber(counts.open)} icon={CircleDot} />
        <StatCard label="Closed" value={formatNumber(counts.closed)} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Trend</CardTitle>
          <CardDescription>Issues opened vs closed per month</CardDescription>
        </CardHeader>
        <CardContent>
          <IssueTrendChart data={trend} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Issue History</h2>
        {issues.length === 0 ? (
          <EmptyState title="No issues" description="This repository has no issues." />
        ) : (
          <IssueTable issues={issues} />
        )}
      </div>
    </div>
  );
}
