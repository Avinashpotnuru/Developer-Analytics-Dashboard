import type { AnalyticsInput, DeveloperAnalytics } from "./types";
import { applyDateRange, applyRepositoryFilter } from "@/lib/filters";
import type { DateRangeFilter, RepositoryFilter } from "@/lib/filters";
import { calculateOverview } from "./overview";
import { calculateCommitAnalytics } from "./commits";
import { calculateRepositoryAnalytics } from "./repositories";
import { calculatePullRequestAnalytics } from "./pull-requests";
import { calculateIssueAnalytics } from "./issues";
import { calculateLanguageDistribution } from "./languages";

export * from "./types";
export * from "./date";
export { calculateOverview } from "./overview";
export {
  calculateCommitAnalytics,
  calculateCommitTrend,
  calculateMostActiveCommitRepository,
} from "./commits";
export {
  calculateRepositoryAnalytics,
  calculateRepositoryActivity,
} from "./repositories";
export { calculatePullRequestAnalytics, calculateMergeRate } from "./pull-requests";
export {
  calculateIssueAnalytics,
  calculateIssueResolutionRate,
  calculateIssueTrend,
} from "./issues";
export { calculateLanguageDistribution } from "./languages";
export { dedupeCommits, dedupeRepositories } from "./utils";

export interface AnalyticsOptions {
  /** Restrict date-based metrics to a time window. */
  dateRange?: DateRangeFilter;
  /** Restrict metrics to a single repository. */
  repository?: RepositoryFilter;
}

export function getDeveloperAnalytics(
  input: AnalyticsInput,
  options: AnalyticsOptions = {},
): DeveloperAnalytics {
  const scoped = applyRepositoryFilter(
    {
      commits: input.commits,
      pullRequests: input.pullRequests,
      issues: input.issues,
      commitActivity: input.commitActivity,
    },
    options.repository,
  );
  const ranged = applyDateRange(scoped, options.dateRange);

  return {
    overview: calculateOverview({
      ...input,
      commits: ranged.commits,
      pullRequests: ranged.pullRequests,
      issues: ranged.issues,
    }),
    commits: calculateCommitAnalytics({
      ...input,
      commits: ranged.commits,
      commitActivity: ranged.commitActivity,
    }),
    repositories: calculateRepositoryAnalytics(input),
    pullRequests: calculatePullRequestAnalytics({
      ...input,
      pullRequests: ranged.pullRequests,
    }),
    issues: calculateIssueAnalytics({ ...input, issues: ranged.issues }),
    languages: calculateLanguageDistribution(input.languages),
  };
}
