"use client";

import * as React from "react";

import { useGitHubContext } from "@/components/github/github-context";
import {
  useCommits,
  useCommitActivity,
  useIssues,
  useLanguages,
  usePullRequests,
  useRepositories,
  useUser,
} from "@/lib/github/queries";
import {
  getDeveloperAnalytics,
  type DeveloperAnalytics,
} from "./index";

export interface DeveloperAnalyticsResult {
  analytics: DeveloperAnalytics | null;
  profile: import("@/lib/types").DeveloperProfile | null;
  repositories: import("@/lib/types").Repository[] | undefined;
  commits: import("@/lib/types").Commit[] | undefined;
  pullRequests: import("@/lib/types").PullRequest[] | undefined;
  issues: import("@/lib/types").Issue[] | undefined;
  languages: Record<string, number> | undefined;
  commitActivity:
    | { weekly: import("@/lib/types").CommitActivityPoint[]; daily: import("@/lib/types").ContributionDay[] }
    | undefined;
  isLoading: boolean;
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
  const { username, selectedRepo, setSelectedRepo } = useGitHubContext();
  const owner = selectedRepo?.owner;
  const repo = selectedRepo?.repo;

  const user = useUser(username);
  const repos = useRepositories(username, {
    perPage: 100,
    sort: "updated",
    type: "owner",
  });
  const commits = useCommits(owner, repo, { perPage: 100 });
  const pulls = usePullRequests(owner, repo, { perPage: 100 });
  const issues = useIssues(owner, repo, { perPage: 100 });
  const languages = useLanguages(owner, repo);
  const activity = useCommitActivity(owner, repo);

  React.useEffect(() => {
    if (!selectedRepo && repos.data && repos.data.length > 0) {
      const [repoOwner, ...rest] = repos.data[0].fullName.split("/");
      setSelectedRepo({ owner: repoOwner, repo: rest.join("/") });
    }
  }, [selectedRepo, repos.data, setSelectedRepo]);

  const analytics = React.useMemo<DeveloperAnalytics | null>(() => {
    if (!repos.data) return null;
    return getDeveloperAnalytics({
      profile: user.data ?? null,
      repositories: repos.data,
      commits: commits.data ?? [],
      pullRequests: pulls.data ?? [],
      issues: issues.data ?? [],
      languages: languages.data ?? {},
      commitActivity: activity.data ?? { weekly: [], daily: [] },
    });
  }, [user.data, repos.data, commits.data, pulls.data, issues.data, languages.data, activity.data]);

  const isLoading =
    user.isLoading ||
    repos.isLoading ||
    (Boolean(selectedRepo) &&
      (commits.isLoading ||
        pulls.isLoading ||
        issues.isLoading ||
        languages.isLoading ||
        activity.isLoading));

  const error: Error | null = user.error ?? repos.error ?? null;

  const sectionErrors = {
    commits: commits.error,
    pulls: pulls.error,
    issues: issues.error,
    languages: languages.error,
    activity: activity.error,
  };

  const refetch = () => {
    void user.refetch();
    void repos.refetch();
    void commits.refetch();
    void pulls.refetch();
    void issues.refetch();
    void languages.refetch();
    void activity.refetch();
  };

  return {
    analytics,
    profile: user.data ?? null,
    repositories: repos.data,
    commits: commits.data,
    pullRequests: pulls.data,
    issues: issues.data,
    languages: languages.data,
    commitActivity: activity.data,
    isLoading,
    isError: Boolean(error),
    error,
    sectionErrors,
    refetch,
  };
}
