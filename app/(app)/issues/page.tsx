import { CheckCircle2, CircleDot, CircleSlash } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { IssueTrendChart } from "@/components/charts/issue-trend-chart";
import { IssueTable } from "@/components/issues/issue-table";
import { formatNumber } from "@/lib/format";
import { mockAnalytics, mockIssues } from "@/lib/mock-data";
import type { IssueState } from "@/lib/types";

export default function IssuesPage() {
  const counts = mockIssues.reduce(
    (acc, issue) => {
      acc[issue.state] += 1;
      return acc;
    },
    { open: 0, closed: 0 } as Record<IssueState, number>,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issues"
        description="Open and closed issues across your repositories."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Issues"
          value={formatNumber(mockIssues.length)}
          icon={CircleSlash}
        />
        <StatCard
          label="Open"
          value={formatNumber(counts.open)}
          icon={CircleDot}
        />
        <StatCard
          label="Closed"
          value={formatNumber(counts.closed)}
          icon={CheckCircle2}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Trend</CardTitle>
          <CardDescription>Issues opened vs closed per month</CardDescription>
        </CardHeader>
        <CardContent>
          <IssueTrendChart data={mockAnalytics.issueTrend} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Issue History</h2>
        <IssueTable issues={mockIssues} />
      </div>
    </div>
  );
}
