import { githubFetch, type GitHubResult } from "./client";
import { GitHubError } from "./errors";
import { transformPullRequest } from "./transform";
import type { PullRequest } from "@/lib/types";
import type { GitHubPullRequest } from "./types";

export interface PullRequestQuery {
  page?: number;
  perPage?: number;
  state?: "open" | "closed" | "all";
}

export async function getPullRequests(
  owner: string,
  repo: string,
  query: PullRequestQuery = {},
): Promise<GitHubResult<PullRequest[]>> {
  const fullName = `${owner}/${repo}`;
  try {
    const { data, rateLimit } = await githubFetch<GitHubPullRequest[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
      {
        searchParams: {
          per_page: query.perPage ?? 100,
          page: query.page ?? 1,
          state: query.state ?? "all",
        },
      },
    );
    return {
      data: data.map((pullRequest) => transformPullRequest(pullRequest, fullName)),
      rateLimit,
    };
  } catch (error) {
    if (error instanceof GitHubError && error.code === "not_found") {
      return { data: [], rateLimit: null };
    }
    throw error;
  }
}
