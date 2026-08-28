import type { IssueTrendPoint } from "@/lib/types";
import type { AnalyticsInput, IssueAnalytics } from "./types";
import { formatMonthLabel, monthKey, toDate } from "./date";

export function calculateIssueResolutionRate(
  closed: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return Number(((closed / total) * 100).toFixed(1));
}

export function calculateIssueAnalytics(input: AnalyticsInput): IssueAnalytics {
  // IMPORTANT: the input issues must NOT include pull requests. The GitHub
  // service layer already filters pull requests out of the issues payload, so
  // we never double-count a PR as an issue here.
  const issues = input.issues;
  const total = issues.length;
  let open = 0;
  let closed = 0;

  for (const issue of issues) {
    if (issue.state === "closed") closed += 1;
    else if (issue.state === "open") open += 1;
  }

  return {
    total,
    open,
    closed,
    resolutionRate: calculateIssueResolutionRate(closed, total),
  };
}

export function calculateIssueTrend(issues: AnalyticsInput["issues"]): IssueTrendPoint[] {
  const buckets = new Map<string, { opened: number; closed: number }>();

  for (const issue of issues) {
    let openedKey: string;
    try {
      openedKey = monthKey(toDate(issue.createdAt));
    } catch {
      continue;
    }
    const opened = buckets.get(openedKey) ?? { opened: 0, closed: 0 };
    opened.opened += 1;
    buckets.set(openedKey, opened);

    if (issue.state === "closed" && issue.closedAt) {
      try {
        const closedKey = monthKey(toDate(issue.closedAt));
        const closed = buckets.get(closedKey) ?? { opened: 0, closed: 0 };
        closed.closed += 1;
        buckets.set(closedKey, closed);
      } catch {
        // ignore invalid close dates
      }
    }
  }

  const labels: string[] = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    labels.push(monthKey(date));
  }

  return labels.map((label) => ({
    month: formatMonthLabel(label),
    opened: buckets.get(label)?.opened ?? 0,
    closed: buckets.get(label)?.closed ?? 0,
  }));
}
