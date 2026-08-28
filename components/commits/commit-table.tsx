import { GitCommitHorizontal } from "lucide-react";

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
import { formatDateTime } from "@/lib/format";
import type { Commit } from "@/lib/types";

export function CommitTable({ commits }: { commits: Commit[] }) {
  if (commits.length === 0) {
    return (
      <EmptyState
        icon={GitCommitHorizontal}
        title="No commits found"
        description="Commits will appear here once activity is recorded."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>SHA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commits.map((commit) => (
              <TableRow key={commit.id}>
                <TableCell className="font-medium">{commit.author}</TableCell>
                <TableCell className="text-muted-foreground">
                  {commit.repository}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {commit.message}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(commit.date)}
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {commit.sha.slice(0, 7)}
                  </code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
