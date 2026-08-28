import type { AnalyticsInput, DeveloperAnalytics } from "./types";
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

export function getDeveloperAnalytics(input: AnalyticsInput): DeveloperAnalytics {
  return {
    overview: calculateOverview(input),
    commits: calculateCommitAnalytics(input),
    repositories: calculateRepositoryAnalytics(input),
    pullRequests: calculatePullRequestAnalytics(input),
    issues: calculateIssueAnalytics(input),
    languages: calculateLanguageDistribution(input.languages),
  };
}
