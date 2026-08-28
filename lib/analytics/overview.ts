import type { AnalyticsInput, OverviewAnalytics } from "./types";
import { dedupeCommits, dedupeRepositories } from "./utils";

export function calculateOverview(input: AnalyticsInput): OverviewAnalytics {
  const repositories = dedupeRepositories(input.repositories);
  const totalRepositories = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);
  const totalCommits = dedupeCommits(input.commits).length;
  const totalPullRequests = input.pullRequests.length;
  const totalIssues = input.issues.length;

  return {
    totalRepositories,
    totalStars,
    totalForks,
    totalCommits,
    totalPullRequests,
    totalIssues,
  };
}
