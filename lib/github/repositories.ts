import { githubFetch, type GitHubResult } from "./client";
import { transformRepository } from "./transform";
import type { Repository } from "@/lib/types";
import type { GitHubRepo } from "./types";

export async function getRepository(
  owner: string,
  repo: string,
): Promise<GitHubResult<Repository>> {
  const { data, rateLimit } = await githubFetch<GitHubRepo>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
  return { data: transformRepository(data), rateLimit };
}
