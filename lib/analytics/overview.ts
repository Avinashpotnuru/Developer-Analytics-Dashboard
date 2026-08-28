import type { AnalyticsInput, OverviewAnalytics } from "./types";
import { dedupeCommits, dedupeRepositories } from "./utils";

export function calculateOverview(input: AnalyticsInput): OverviewAnalytics {
  const repositories = dedupeRepositories(input.repositories);
  // The repository list is paginated (capped), so the authoritative total
  // comes from the profile when available; otherwise fall back to the list.
  const totalRepositories = input.profile?.publicRepos ?? repositories.length;
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
