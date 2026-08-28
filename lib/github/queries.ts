"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Commit,
  CommitActivityPoint,
  ContributionDay,
  DeveloperProfile,
  Issue,
  PullRequest,
  Repository,
} from "@/lib/types";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

interface QueryOptions {
  perPage?: number;
  page?: number;
  sort?: string;
  type?: string;
  state?: string;
}

async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  let url = `/api/github${path}`;
  if (params) {
    const entries = Object.entries(params).filter(
      (entry): entry is [string, string | number] =>
        entry[1] !== undefined && entry[1] !== null && entry[1] !== "",
    );
    if (entries.length > 0) {
      const search = new URLSearchParams(
        entries.map(([key, value]) => [key, String(value)]),
      ).toString();
      url += `?${search}`;
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    let payload: { error?: { code?: string; message?: string } } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      // ignore parse errors
    }
    const error = payload.error;
    throw new ApiError(
      error?.code ?? "server",
      error?.message ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  const body = (await response.json()) as { data: T };
  return body.data;
}

const USER_STALE = 5 * 60 * 1000;
const REPO_STALE = 5 * 60 * 1000;
const ACTIVITY_STALE = 2 * 60 * 1000;

export function useUser(username: string | undefined) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () =>
      apiGet<DeveloperProfile>(`/users/${encodeURIComponent(username ?? "")}`),
    enabled: Boolean(username),
    staleTime: USER_STALE,
  });
}

export function useRepositories(
  username: string | undefined,
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: ["repositories", username, options],
    queryFn: () =>
      apiGet<Repository[]>(
        `/users/${encodeURIComponent(username ?? "")}/repositories`,
        {
          perPage: options.perPage,
          page: options.page,
          sort: options.sort,
          type: options.type,
        },
      ),
    enabled: Boolean(username),
    staleTime: REPO_STALE,
  });
}

export function useCommits(
  owner: string | undefined,
  repo: string | undefined,
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: ["commits", owner, repo, options],
    queryFn: () =>
      apiGet<Commit[]>(
        `/repos/${encodeURIComponent(owner ?? "")}/${encodeURIComponent(repo ?? "")}/commits`,
        { perPage: options.perPage, page: options.page },
      ),
    enabled: Boolean(owner) && Boolean(repo),
    staleTime: ACTIVITY_STALE,
  });
}

export function usePullRequests(
  owner: string | undefined,
  repo: string | undefined,
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: ["pull-requests", owner, repo, options],
    queryFn: () =>
      apiGet<PullRequest[]>(
        `/repos/${encodeURIComponent(owner ?? "")}/${encodeURIComponent(repo ?? "")}/pulls`,
        { perPage: options.perPage, page: options.page, state: options.state },
      ),
    enabled: Boolean(owner) && Boolean(repo),
    staleTime: ACTIVITY_STALE,
  });
}

export function useIssues(
  owner: string | undefined,
  repo: string | undefined,
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: ["issues", owner, repo, options],
    queryFn: () =>
      apiGet<Issue[]>(
        `/repos/${encodeURIComponent(owner ?? "")}/${encodeURIComponent(repo ?? "")}/issues`,
        { perPage: options.perPage, page: options.page, state: options.state },
      ),
    enabled: Boolean(owner) && Boolean(repo),
    staleTime: ACTIVITY_STALE,
  });
}

export function useLanguages(owner: string | undefined, repo: string | undefined) {
  return useQuery({
    queryKey: ["languages", owner, repo],
    queryFn: () =>
      apiGet<Record<string, number>>(
        `/repos/${encodeURIComponent(owner ?? "")}/${encodeURIComponent(repo ?? "")}/languages`,
      ),
    enabled: Boolean(owner) && Boolean(repo),
    staleTime: REPO_STALE,
  });
}

export interface CommitActivityResult {
  weekly: CommitActivityPoint[];
  daily: ContributionDay[];
}

export function useCommitActivity(
  owner: string | undefined,
  repo: string | undefined,
) {
  return useQuery({
    queryKey: ["commit-activity", owner, repo],
    queryFn: () =>
      apiGet<CommitActivityResult>(
        `/repos/${encodeURIComponent(owner ?? "")}/${encodeURIComponent(repo ?? "")}/stats/commit-activity`,
      ),
    enabled: Boolean(owner) && Boolean(repo),
    staleTime: ACTIVITY_STALE,
  });
}
