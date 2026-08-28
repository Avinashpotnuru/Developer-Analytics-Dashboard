import type {
  Commit,
  CommitActivityPoint,
  ContributionDay,
  Issue,
  PullRequest,
  Repository,
} from "@/lib/types";

import { isWithinRange, resolveDateRange, type ResolvedRange } from "./date-range";
import type { DateRangeFilter, RepositoryFilter } from "./types";

function levelFor(count: number): ContributionDay["level"] {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 7) return 2;
  if (count < 12) return 3;
  return 4;
}

interface RepositoryScoped {
  repository: string;
}

export function filterByRepository<T extends RepositoryScoped>(
  items: T[],
  repoFullName: string,
): T[] {
  return items.filter((item) => item.repository === repoFullName);
}

export function filterCommitsByRange(
  commits: Commit[],
  range: ResolvedRange,
): Commit[] {
  return commits.filter((commit) => isWithinRange(range, commit.date));
}

export function filterPullRequestsByRange(
  pullRequests: PullRequest[],
  range: ResolvedRange,
): PullRequest[] {
  return pullRequests.filter((pr) => isWithinRange(range, pr.createdAt));
}

export function filterIssuesByRange(
  issues: Issue[],
  range: ResolvedRange,
): Issue[] {
  return issues.filter((issue) => isWithinRange(range, issue.createdAt));
}

export function filterCommitActivityByRange(
  activity: { weekly: CommitActivityPoint[]; daily: ContributionDay[] },
  range: ResolvedRange,
): { weekly: CommitActivityPoint[]; daily: ContributionDay[] } {
  const weekly = activity.weekly.filter((point) => {
    const anchor = "weekStart" in point ? point.weekStart : point.week;
    return isWithinRange(range, anchor);
  });
  const daily = activity.daily.filter((day) => isWithinRange(range, day.date));
  return { weekly, daily };
}

export function aggregateLanguages(
  maps: Record<string, number>[],
): Record<string, number> {
  const total: Record<string, number> = {};
  for (const map of maps) {
    for (const [language, bytes] of Object.entries(map)) {
      total[language] = (total[language] ?? 0) + bytes;
    }
  }
  return total;
}

export function combineCommitActivity(
  sources: { weekly: CommitActivityPoint[]; daily: ContributionDay[] }[],
): { weekly: CommitActivityPoint[]; daily: ContributionDay[] } {
  const weekMap = new Map<string, { week: string; weekStart?: string; commits: number }>();
  const dayMap = new Map<string, number>();

  for (const source of sources) {
    for (const point of source.weekly) {
      const key = "weekStart" in point && point.weekStart ? point.weekStart : point.week;
      const existing = weekMap.get(key);
      if (existing) {
        existing.commits += point.commits;
      } else {
        weekMap.set(key, {
          week: point.week,
          ...("weekStart" in point && point.weekStart
            ? { weekStart: point.weekStart }
            : {}),
          commits: point.commits,
        });
      }
    }
    for (const day of source.daily) {
      dayMap.set(day.date, (dayMap.get(day.date) ?? 0) + day.count);
    }
  }

  const weekly = [...weekMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, value]) => ({
      week: value.week,
      ...(value.weekStart ? { weekStart: value.weekStart } : {}),
      commits: value.commits,
    })) as CommitActivityPoint[];

  const daily = [...dayMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, count]) => ({
      date,
      count,
      level: levelFor(count),
    }));

  return { weekly, daily };
}

export interface FilteredAnalyticsInput {
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
  commitActivity: { weekly: CommitActivityPoint[]; daily: ContributionDay[] };
}

export function applyDateRange<T extends FilteredAnalyticsInput>(
  input: T,
  dateRange: DateRangeFilter | undefined,
): T {
  if (!dateRange) return input;
  const range = resolveDateRange(dateRange);
  return {
    ...input,
    commits: filterCommitsByRange(input.commits, range),
    pullRequests: filterPullRequestsByRange(input.pullRequests, range),
    issues: filterIssuesByRange(input.issues, range),
    commitActivity: filterCommitActivityByRange(input.commitActivity, range),
  };
}

export function applyRepositoryFilter<T extends FilteredAnalyticsInput>(
  input: T,
  filter: RepositoryFilter | undefined,
): T {
  if (!filter || filter.mode !== "single" || !filter.repo) return input;
  return {
    ...input,
    commits: filterByRepository(input.commits, filter.repo),
    pullRequests: filterByRepository(input.pullRequests, filter.repo),
    issues: filterByRepository(input.issues, filter.repo),
  };
}

export function resolveRepositoryFilter(
  mode: RepositoryFilter["mode"],
  repo: Repository | null,
): RepositoryFilter {
  if (mode === "all") return { mode: "all" };
  if (repo) return { mode: "single", repo: repo.fullName };
  return { mode: "single" };
}

export * from "./types";
export * from "./date-range";
