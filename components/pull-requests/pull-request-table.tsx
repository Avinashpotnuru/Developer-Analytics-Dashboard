import { GitPullRequest } from "lucide-react";

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
import type { PullRequest } from "@/lib/types";

export function PullRequestTable({
  pullRequests,
}: {
  pullRequests: PullRequest[];
}) {
  if (pullRequests.length === 0) {
    return (
      <EmptyState
        icon={GitPullRequest}
        title="No pull requests found"
        description="Pull requests will appear here once activity is recorded."
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
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pullRequests.map((pullRequest) => (
              <TableRow key={pullRequest.id}>
                <TableCell className="max-w-sm truncate font-medium">
                  {pullRequest.title}
                </TableCell>
                <TableCell>
                  <StateBadge state={pullRequest.state} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {pullRequest.repository}
                </TableCell>
                <TableCell>{pullRequest.author}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(pullRequest.createdAt)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {pullRequest.comments}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
