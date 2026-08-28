import { githubFetch, type GitHubResult } from "./client";
import { transformCommit } from "./transform";
import type { Commit } from "@/lib/types";
import type { GitHubCommit } from "./types";

export interface ListQuery {
  page?: number;
  perPage?: number;
}

export async function getCommits(
  owner: string,
  repo: string,
  query: ListQuery = {},
): Promise<GitHubResult<Commit[]>> {
  const fullName = `${owner}/${repo}`;
  const { data, rateLimit } = await githubFetch<GitHubCommit[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`,
    {
      searchParams: {
        per_page: query.perPage ?? 100,
        page: query.page ?? 1,
      },
    },
  );
  return {
    data: data.map((commit) => transformCommit(commit, fullName)),
    rateLimit,
  };
}
