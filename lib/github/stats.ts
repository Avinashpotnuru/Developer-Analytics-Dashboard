import { githubFetch, type GitHubResult } from "./client";
import { transformCommitActivity } from "./transform";
import type { CommitActivityPoint, ContributionDay } from "@/lib/types";
import type { GitHubCommitActivityWeek } from "./types";

export interface CommitActivity {
  weekly: CommitActivityPoint[];
  daily: ContributionDay[];
}

export async function getCommitActivity(
  owner: string,
  repo: string,
): Promise<GitHubResult<CommitActivity>> {
  try {
    const { data, rateLimit } = await githubFetch<GitHubCommitActivityWeek[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`,
    );
    return { data: transformCommitActivity(data), rateLimit };
  } catch {
    // GitHub returns 202 while computing stats; degrade gracefully.
    return {
      data: { weekly: [], daily: [] },
      rateLimit: null,
    };
  }
}
