import { CircleDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StateBadge } from "@/components/shared/state-badge";
import { formatDate } from "@/lib/format";
import type { Issue } from "@/lib/types";

export function IssueTable({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <EmptyState
        icon={CircleDot}
        title="No issues found"
        description="Issues will appear here once activity is recorded."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Labels</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="max-w-sm truncate font-medium">
                  {issue.title}
                </TableCell>
                <TableCell>
                  <StateBadge state={issue.state} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {issue.repository}
                </TableCell>
                <TableCell>{issue.author}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {issue.comments}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(issue.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
