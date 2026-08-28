import { githubFetch, type GitHubResult } from "./client";
import { transformProfile, transformRepository } from "./transform";
import type { DeveloperProfile, Repository } from "@/lib/types";
import type { GitHubRepo, GitHubUser } from "./types";

export interface RepositoryQuery {
  page?: number;
  perPage?: number;
  sort?: "created" | "updated" | "pushed" | "full_name";
  type?: "all" | "owner" | "member";
}

export async function getUser(
  username: string,
): Promise<GitHubResult<DeveloperProfile>> {
  const { data, rateLimit } = await githubFetch<GitHubUser>(
    `/users/${encodeURIComponent(username)}`,
  );
  return { data: transformProfile(data), rateLimit };
}

export async function getUserRepositories(
  username: string,
  query: RepositoryQuery = {},
): Promise<GitHubResult<Repository[]>> {
  const { data, rateLimit } = await githubFetch<GitHubRepo[]>(
    `/users/${encodeURIComponent(username)}/repos`,
    {
      searchParams: {
        per_page: query.perPage ?? 30,
        page: query.page ?? 1,
        sort: query.sort ?? "updated",
        type: query.type ?? "owner",
      },
    },
  );
  return {
    data: data.map((repo) => transformRepository(repo)),
    rateLimit,
  };
}
