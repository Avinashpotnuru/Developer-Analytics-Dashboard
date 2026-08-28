import { githubFetch, type GitHubResult } from "./client";
import type { GitHubLanguageMap } from "./types";

export async function getLanguages(
  owner: string,
  repo: string,
): Promise<GitHubResult<Record<string, number>>> {
  const { data, rateLimit } = await githubFetch<GitHubLanguageMap>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
  );
  return { data, rateLimit };
}
