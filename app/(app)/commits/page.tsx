import { GitCommitHorizontal, Minus, Plus, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CommitActivityChart } from "@/components/charts/commit-activity-chart";
import { CommitTable } from "@/components/commits/commit-table";
import { formatCompact, formatNumber } from "@/lib/format";
import { mockAnalytics, mockCommits } from "@/lib/mock-data";

export default function CommitsPage() {
  const totalCommits = mockCommits.length;
  const totalAdditions = mockCommits.reduce(
    (sum, commit) => sum + commit.additions,
    0,
  );
  const totalDeletions = mockCommits.reduce(
    (sum, commit) => sum + commit.deletions,
    0,
  );
  const contributors = new Set(mockCommits.map((commit) => commit.author))
    .size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commits"
        description="Commit history and statistics across your repositories."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Commits"
          value={formatNumber(totalCommits)}
          icon={GitCommitHorizontal}
        />
        <StatCard
          label="Additions"
          value={formatCompact(totalAdditions)}
          icon={Plus}
        />
        <StatCard
          label="Deletions"
          value={formatCompact(totalDeletions)}
          icon={Minus}
        />
        <StatCard
          label="Contributors"
          value={formatNumber(contributors)}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commit Activity</CardTitle>
          <CardDescription>Weekly commits over the last 12 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <CommitActivityChart data={mockAnalytics.commitActivity} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Commit History</h2>
        <CommitTable commits={mockCommits} />
      </div>
    </div>
  );
}
