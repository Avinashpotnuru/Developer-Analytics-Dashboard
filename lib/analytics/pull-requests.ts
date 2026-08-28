import type { AnalyticsInput, PullRequestAnalytics } from "./types";

export function calculateMergeRate(merged: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((merged / total) * 100).toFixed(1));
}

export function calculatePullRequestAnalytics(
  input: AnalyticsInput,
): PullRequestAnalytics {
  const pullRequests = input.pullRequests;
  const total = pullRequests.length;
  let open = 0;
  let closed = 0;
  let merged = 0;

  for (const pr of pullRequests) {
    if (pr.state === "merged") merged += 1;
    else if (pr.state === "closed") closed += 1;
    else if (pr.state === "open") open += 1;
  }

  return {
    total,
    open,
    closed,
    merged,
    mergeRate: calculateMergeRate(merged, total),
  };
}
