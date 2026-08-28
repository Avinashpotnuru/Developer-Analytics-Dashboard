import { githubFetch, type GitHubResult } from "./client";
import { transformLanguages } from "./transform";
import type { LanguageShare } from "@/lib/types";
import type { GitHubLanguageMap } from "./types";

export async function getLanguages(
  owner: string,
  repo: string,
): Promise<GitHubResult<LanguageShare[]>> {
  const { data, rateLimit } = await githubFetch<GitHubLanguageMap>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
  );
  return { data: transformLanguages(data), rateLimit };
}
