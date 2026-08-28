"use client";

import * as React from "react";
import { useQueries } from "@tanstack/react-query";

import {
  useCommits,
  useCommitActivity,
  useIssues,
  useLanguages,
  usePullRequests,
  useRepositories,
  useUser,
  apiGet,
} from "@/lib/github/queries";
import {
  aggregateLanguages,
  combineCommitActivity,
  filterCommitsByRange,
  filterCommitActivityByRange,
  filterIssuesByRange,
  filterPullRequestsByRange,
  resolveDateRange,
} from "@/lib/filters";
import { useGitHubContext, repoFullName } from "@/components/github/github-context";
import {
  getDeveloperAnalytics,
  type AnalyticsOptions,
  type DeveloperAnalytics,
} from "./index";
import type {
  Commit,
  CommitActivityPoint,
  ContributionDay,
  DeveloperProfile,
  Issue,
  PullRequest,
  Repository,
} from "@/lib/types";

const MAX_AGGREGATE_REPOS = 30;

interface RepoBundle {
  commits: Commit[];
  pulls: PullRequest[];
  issues: Issue[];
  languages: Record<string, number>;
  activity: { weekly: CommitActivityPoint[]; daily: ContributionDay[] };
}

async function safeApiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiGet<T>(path);
  } catch {
    return fallback;
  }
}

async function fetchRepoBundle(owner: string, repo: string): Promise<RepoBundle> {
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const [commits, pulls, issues, languages, activity] = await Promise.all([
    safeApiGet<Commit[]>(`${base}/commits?per_page=100`, []),
    safeApiGet<PullRequest[]>(`${base}/pulls?per_page=100`, []),
    safeApiGet<Issue[]>(`${base}/issues?per_page=100`, []),
    safeApiGet<Record<string, number>>(`${base}/languages`, {}),
    safeApiGet<{ weekly: CommitActivityPoint[]; daily: ContributionDay[] }>(
      `${base}/stats/commit-activity`,
      { weekly: [], daily: [] },
    ),
  ]);
  return { commits, pulls, issues, languages, activity };
}

export interface DeveloperAnalyticsResult {
  analytics: DeveloperAnalytics | null;
  profile: DeveloperProfile | null;
  repositories: Repository[] | undefined;
  commits: Commit[] | undefined;
  pullRequests: PullRequest[] | undefined;
  issues: Issue[] | undefined;
  languages: Record<string, number> | undefined;
  commitActivity:
    | { weekly: CommitActivityPoint[]; daily: ContributionDay[] }
    | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  error: Error | null;
  sectionErrors: {
    commits?: Error | null;
    pulls?: Error | null;
    issues?: Error | null;
    languages?: Error | null;
    activity?: Error | null;
  };
  refetch: () => void;
}

export function useDeveloperAnalytics(): DeveloperAnalyticsResult {
  const {
    username,
    selectedRepo,
    repositoryMode,
    dateRange,
    setSelectedRepo,
  } = useGitHubContext();
  const owner = selectedRepo?.owner;
  const repo = selectedRepo?.repo;

  const user = useUser(username);
  const repos = useRepositories(username, {
    perPage: 100,
    sort: "updated",
    type: "owner",
  });

  const usingAll = repositoryMode === "all";

  const singleCommits = useCommits(owner, repo, { perPage: 100 });
  const singlePulls = usePullRequests(owner, repo, { perPage: 100 });
  const singleIssues = useIssues(owner, repo, { perPage: 100 });
  const singleLanguages = useLanguages(owner, repo);
  const singleActivity = useCommitActivity(owner, repo);

  const reposToAggregate = React.useMemo(
    () =>
      usingAll && repos.data
        ? repos.data.slice(0, MAX_AGGREGATE_REPOS)
        : [],
    [usingAll, repos.data],
  );

  const bundleQueries = useQueries({
    queries: reposToAggregate.map((item) => {
      const [owner, ...rest] = item.fullName.split("/");
      const repo = rest.join("/");
      return {
        queryKey: ["github", "bundle", owner, repo],
        queryFn: () => fetchRepoBundle(owner, repo),
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      };
    }),
  });

  React.useEffect(() => {
    if (
      repositoryMode === "single" &&
      !selectedRepo &&
      repos.data &&
      repos.data.length > 0
    ) {
      const [repoOwner, ...rest] = repos.data[0].fullName.split("/");
      setSelectedRepo({ owner: repoOwner, repo: rest.join("/") });
    }
  }, [repositoryMode, selectedRepo, repos.data, setSelectedRepo]);

  const bundleError =
    bundleQueries.find((query) => query.error)?.error ?? null;

  const commitsData = React.useMemo(
    () =>
      usingAll
        ? bundleQueries.flatMap((query) => query.data?.commits ?? [])
        : singleCommits.data ?? [],
    [usingAll, bundleQueries, singleCommits.data],
  );
  const pullsData = React.useMemo(
    () =>
      usingAll
        ? bundleQueries.flatMap((query) => query.data?.pulls ?? [])
        : singlePulls.data ?? [],
    [usingAll, bundleQueries, singlePulls.data],
  );
  const issuesData = React.useMemo(
    () =>
      usingAll
        ? bundleQueries.flatMap((query) => query.data?.issues ?? [])
        : singleIssues.data ?? [],
    [usingAll, bundleQueries, singleIssues.data],
  );
  const languagesData = React.useMemo(
    () =>
      usingAll
        ? aggregateLanguages(
            bundleQueries.map((query) => query.data?.languages ?? {}),
          )
        : singleLanguages.data ?? {},
    [usingAll, bundleQueries, singleLanguages.data],
  );
  const activityData = React.useMemo(
    () =>
      usingAll
        ? combineCommitActivity(
            bundleQueries.map(
              (query) => query.data?.activity ?? { weekly: [], daily: [] },
            ),
          )
        : singleActivity.data ?? { weekly: [], daily: [] },
    [usingAll, bundleQueries, singleActivity.data],
  );

  const repositoriesData = React.useMemo(
    () => repos.data ?? [],
    [repos.data],
  );

  const range = React.useMemo(() => resolveDateRange(dateRange), [dateRange]);

  const filteredCommits = React.useMemo(
    () => filterCommitsByRange(commitsData, range),
    [commitsData, range],
  );
  const filteredPulls = React.useMemo(
    () => filterPullRequestsByRange(pullsData, range),
    [pullsData, range],
  );
  const filteredIssues = React.useMemo(
    () => filterIssuesByRange(issuesData, range),
    [issuesData, range],
  );
  const filteredActivity = React.useMemo(
    () => filterCommitActivityByRange(activityData, range),
    [activityData, range],
  );

  const options = React.useMemo<AnalyticsOptions>(() => {
    const repository =
      repositoryMode === "single" && selectedRepo
        ? { mode: "single" as const, repo: repoFullName(selectedRepo) ?? undefined }
        : { mode: "all" as const };
    return { dateRange, repository };
  }, [dateRange, repositoryMode, selectedRepo]);

  const analytics = React.useMemo<DeveloperAnalytics | null>(() => {
    if (!repositoriesData || repositoriesData.length === 0) return null;
    return getDeveloperAnalytics(
      {
        profile: user.data ?? null,
        repositories: repositoriesData,
        commits: filteredCommits,
        pullRequests: filteredPulls,
        issues: filteredIssues,
        languages: languagesData,
        commitActivity: filteredActivity,
      },
      options,
    );
  }, [
    repositoriesData,
    user.data,
    filteredCommits,
    filteredPulls,
    filteredIssues,
    languagesData,
    filteredActivity,
    options,
  ]);

  const sectionLoading = usingAll
    ? bundleQueries.some((query) => query.isLoading)
    : Boolean(selectedRepo) &&
      (singleCommits.isLoading ||
        singlePulls.isLoading ||
        singleIssues.isLoading ||
        singleLanguages.isLoading ||
        singleActivity.isLoading);

  const sectionFetching = usingAll
    ? bundleQueries.some((query) => query.isFetching)
    : singleCommits.isFetching ||
      singlePulls.isFetching ||
      singleIssues.isFetching ||
      singleLanguages.isFetching ||
      singleActivity.isFetching;

  const isLoading = user.isLoading || repos.isLoading || sectionLoading;
  const isFetching = user.isFetching || repos.isFetching || sectionFetching;
  const isRefreshing = analytics !== null && isFetching;

  const error: Error | null =
    user.error ?? repos.error ?? (usingAll ? bundleError : null) ?? null;

  const sectionErrors = {
    commits: usingAll ? bundleError : singleCommits.error,
    pulls: usingAll ? bundleError : singlePulls.error,
    issues: usingAll ? bundleError : singleIssues.error,
    languages: usingAll ? bundleError : singleLanguages.error,
    activity: usingAll ? bundleError : singleActivity.error,
  };

  const refetch = React.useCallback(() => {
    void user.refetch();
    void repos.refetch();
    if (usingAll) {
      for (const query of bundleQueries) void query.refetch();
    } else {
      void singleCommits.refetch();
      void singlePulls.refetch();
      void singleIssues.refetch();
      void singleLanguages.refetch();
      void singleActivity.refetch();
    }
  }, [
    user,
    repos,
    usingAll,
    bundleQueries,
    singleCommits,
    singlePulls,
    singleIssues,
    singleLanguages,
    singleActivity,
  ]);

  return {
    analytics,
    profile: user.data ?? null,
    repositories: repos.data,
    commits: filteredCommits,
    pullRequests: filteredPulls,
    issues: filteredIssues,
    languages: languagesData,
    commitActivity: filteredActivity,
    isLoading,
    isRefreshing,
    isError: Boolean(error),
    error,
    sectionErrors,
    refetch,
  };
}
