import { githubFetch, type GitHubResult } from "./client";
import { GitHubError } from "./errors";
import { transformIssue } from "./transform";
import type { Issue } from "@/lib/types";
import type { GitHubIssue } from "./types";

export interface IssueQuery {
  page?: number;
  perPage?: number;
  state?: "open" | "closed" | "all";
}

export async function getIssues(
  owner: string,
  repo: string,
  query: IssueQuery = {},
): Promise<GitHubResult<Issue[]>> {
  const fullName = `${owner}/${repo}`;
  let result: GitHubResult<GitHubIssue[]>;
  try {
    result = await githubFetch<GitHubIssue[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
      {
        searchParams: {
          per_page: query.perPage ?? 100,
          page: query.page ?? 1,
          state: query.state ?? "all",
        },
      },
    );
  } catch (error) {
    if (error instanceof GitHubError && error.code === "not_found") {
      return { data: [], rateLimit: null };
    }
    throw error;
  }
  const issues = result.data
    .filter((item) => !item.pull_request)
    .map((issue) => transformIssue(issue, fullName));
  return { data: issues, rateLimit: result.rateLimit };
}
