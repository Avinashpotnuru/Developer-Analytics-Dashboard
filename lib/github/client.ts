import { GitHubError, type GitHubErrorCode, type RateLimitInfo } from "./errors";
import type { GitHubLanguageMap } from "./types";

const GITHUB_API = "https://api.github.com";

export interface GitHubResult<T> {
  data: T;
  rateLimit: RateLimitInfo | null;
}

interface GithubFetchOptions {
  searchParams?: Record<string, string | number | undefined>;
  init?: RequestInit;
}

function parseRateLimit(res: Response): RateLimitInfo | null {
  const limit = res.headers.get("x-ratelimit-limit");
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  const resource = res.headers.get("x-ratelimit-resource");
  if (limit === null || remaining === null || reset === null) {
    return null;
  }
  return {
    limit: Number(limit),
    remaining: Number(remaining),
    reset: Number(reset),
    resource: resource ?? "core",
  };
}

function classify(status: number, rateLimit: RateLimitInfo | null): GitHubErrorCode {
  switch (status) {
    case 401:
      return "auth";
    case 403:
      return rateLimit && rateLimit.remaining <= 0 ? "rate_limit" : "forbidden";
    case 404:
      return "not_found";
    case 422:
      return "validation";
    case 500:
    case 502:
    case 503:
    case 504:
      return "server";
    default:
      return "server";
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message ?? body.error ?? res.statusText;
  } catch {
    return res.statusText || "GitHub request failed";
  }
}

export async function githubFetch<T>(
  path: string,
  options: GithubFetchOptions = {},
): Promise<GitHubResult<T>> {
  const url = new URL(`${GITHUB_API}${path}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = new Headers(options.init?.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("User-Agent", "DeveloperAnalyticsDashboard");
  headers.set("X-GitHub-Api-Version", "2022-11-28");

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options.init, headers });
  } catch {
    throw new GitHubError(
      "network",
      "Unable to reach GitHub. Check your network connection and try again.",
      0,
      null,
    );
  }

  const rateLimit = parseRateLimit(res);

  if (!res.ok) {
    const message = await readErrorMessage(res);
    const code = classify(res.status, rateLimit);
    throw new GitHubError(code, message, res.status, rateLimit);
  }

  const data = (await res.json()) as T;
  return { data, rateLimit };
}

export type { GitHubLanguageMap };
