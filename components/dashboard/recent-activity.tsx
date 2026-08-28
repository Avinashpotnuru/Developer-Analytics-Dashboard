import {
  CircleDot,
  FolderPlus,
  GitCommitHorizontal,
  GitPullRequest,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";
import type { ActivityEvent, ActivityType } from "@/lib/types";

const ICONS: Record<ActivityType, LucideIcon> = {
  commit: GitCommitHorizontal,
  pull_request: GitPullRequest,
  issue: CircleDot,
  repository_created: FolderPlus,
};

const TYPE_LABELS: Record<ActivityType, string> = {
  commit: "Commit",
  pull_request: "Pull request",
  issue: "Issue",
  repository_created: "Repository",
};

export function RecentActivity({
  events,
  className,
}: {
  events: ActivityEvent[];
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {events.map((event, index) => {
        const Icon = ICONS[event.type];
        const isLast = index === events.length - 1;
        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </span>
              {!isLast ? <span className="w-px flex-1 bg-border" /> : null}
            </div>
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p className="text-sm">
                <span className="font-medium text-foreground">
                  {TYPE_LABELS[event.type]}
                </span>{" "}
                <span className="text-muted-foreground">
                  {event.description}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.repository} · {formatRelativeDate(event.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
