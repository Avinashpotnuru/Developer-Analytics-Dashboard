import { githubFetch, type GitHubResult } from "./client";
import { GitHubError } from "./errors";
import type { GitHubLanguageMap } from "./types";

export async function getLanguages(
  owner: string,
  repo: string,
): Promise<GitHubResult<Record<string, number>>> {
  try {
    const { data, rateLimit } = await githubFetch<GitHubLanguageMap>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
    );
    return { data, rateLimit };
  } catch (error) {
    if (error instanceof GitHubError && error.code === "not_found") {
      return { data: {}, rateLimit: null };
    }
    throw error;
  }
}
