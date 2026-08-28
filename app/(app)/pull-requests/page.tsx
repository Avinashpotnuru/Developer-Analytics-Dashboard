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
import { formatNumber } from "@/lib/format";
import { mockPullRequests } from "@/lib/mock-data";
import type { PullRequestState } from "@/lib/types";

export default function PullRequestsPage() {
  const counts = mockPullRequests.reduce(
    (acc, pullRequest) => {
      acc[pullRequest.state] += 1;
      return acc;
    },
    { open: 0, merged: 0, closed: 0 } as Record<PullRequestState, number>,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pull Requests"
        description="Track and analyze pull request activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total PRs"
          value={formatNumber(mockPullRequests.length)}
          icon={GitPullRequest}
        />
        <StatCard
          label="Open"
          value={formatNumber(counts.open)}
          icon={CircleDot}
        />
        <StatCard
          label="Merged"
          value={formatNumber(counts.merged)}
          icon={GitMerge}
        />
        <StatCard
          label="Closed"
          value={formatNumber(counts.closed)}
          icon={GitPullRequestClosed}
        />
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
        <PullRequestTable pullRequests={mockPullRequests} />
      </div>
    </div>
  );
}
