import { GitPullRequestClosed, GitMerge, CircleDot, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { IssueState, PullRequestState } from "@/lib/types";

type AnyState = PullRequestState | IssueState;

const CONFIG: Record<
  AnyState,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  open: {
    label: "Open",
    icon: CircleDot,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  merged: {
    label: "Merged",
    icon: GitMerge,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  closed: {
    label: "Closed",
    icon: GitPullRequestClosed,
    className:
      "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

export function StateBadge({
  state,
  className,
}: {
  state: AnyState;
  className?: string;
}) {
  const { label, icon: Icon, className: variantClass } = CONFIG[state];
  return (
    <Badge variant="outline" className={cn(variantClass, className)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
