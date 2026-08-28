import type { Repository } from "@/lib/types";
import type { AnalyticsInput, RepositoryAnalytics } from "./types";
import { dedupeRepositories } from "./utils";

/**
 * Transparent heuristic repository activity score.
 *
 * This is NOT GitHub's official "activity" metric. It is a simple, documented
 * weighted sum so the dashboard can rank a developer's repositories:
 *   stars + forks * 2 + openIssues
 * Forks are weighted higher because they indicate the repository is being
 * reused, and open issues indicate ongoing engagement.
 */
export function calculateRepositoryActivity(repo: Repository): number {
  return repo.stars + repo.forks * 2 + repo.openIssues;
}

export function calculateRepositoryAnalytics(
  input: AnalyticsInput,
): RepositoryAnalytics {
  const repositories = dedupeRepositories(input.repositories);
  const count = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);

  const averageStarsPerRepository = count > 0 ? totalStars / count : 0;
  const averageForksPerRepository = count > 0 ? totalForks / count : 0;

  const sortedByStars = [...repositories].sort((a, b) => b.stars - a.stars);
  const sortedByForks = [...repositories].sort((a, b) => b.forks - a.forks);
  const sortedByActivity = [...repositories].sort(
    (a, b) => calculateRepositoryActivity(b) - calculateRepositoryActivity(a),
  );

  return {
    totalRepositories: count,
    totalStars,
    totalForks,
    averageStarsPerRepository: Number(averageStarsPerRepository.toFixed(2)),
    averageForksPerRepository: Number(averageForksPerRepository.toFixed(2)),
    mostStarredRepository: sortedByStars[0] ?? null,
    mostForkedRepository: sortedByForks[0] ?? null,
    mostActiveRepository: sortedByActivity[0] ?? null,
    repositoriesByActivity: sortedByActivity,
  };
}
