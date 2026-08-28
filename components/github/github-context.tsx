"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import {
  DEFAULT_DATE_RANGE,
  isValidDateRangeKey,
  type DateRangeFilter,
} from "@/lib/filters/types";

export interface SelectedRepo {
  owner: string;
  repo: string;
}

export type RepositoryMode = "all" | "single";

interface GitHubContextValue {
  username: string;
  setUsername: (username: string) => void;
  repositoryMode: RepositoryMode;
  setRepositoryMode: (mode: RepositoryMode) => void;
  selectedRepo: SelectedRepo | null;
  setSelectedRepo: (repo: SelectedRepo | null) => void;
  dateRange: DateRangeFilter;
  setDateRange: (range: DateRangeFilter) => void;
}

const GitHubContext = createContext<GitHubContextValue | null>(null);

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("");
  const [repositoryMode, setRepositoryMode] = useState<RepositoryMode>("single");
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DEFAULT_DATE_RANGE);

  // Sync initial filter state from the URL after mount. Reading window during
  // the initial render caused hydration mismatches whenever the URL carried
  // query params, since the server has no window to read.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setUsername(user);

    const range = params.get("range");
    if (isValidDateRangeKey(range)) {
      if (range === "custom") {
        setDateRange({
          key: "custom",
          from: params.get("from") ?? undefined,
          to: params.get("to") ?? undefined,
        });
      } else {
        setDateRange({ key: range });
      }
    }

    const repo = params.get("repo");
    if (repo === "all") {
      setRepositoryMode("all");
      setSelectedRepo(null);
    } else if (repo && repo.includes("/")) {
      const index = repo.indexOf("/");
      setRepositoryMode("single");
      setSelectedRepo({
        owner: repo.slice(0, index),
        repo: repo.slice(index + 1),
      });
    }
  }, []);

  // Skip persisting on the first commit so the initial URL sync above runs
  // before we overwrite the query string.
  const skipFirstPersist = useRef(true);
  useEffect(() => {
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (username) params.set("user", username);
    else params.delete("user");

    if (dateRange.key === "custom") {
      params.delete("range");
      if (dateRange.from) params.set("from", dateRange.from);
      else params.delete("from");
      if (dateRange.to) params.set("to", dateRange.to);
      else params.delete("to");
    } else {
      params.set("range", dateRange.key);
      params.delete("from");
      params.delete("to");
    }

    if (repositoryMode === "all") {
      params.set("repo", "all");
    } else if (selectedRepo) {
      params.set("repo", `${selectedRepo.owner}/${selectedRepo.repo}`);
    } else {
      params.delete("repo");
    }

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", url);
  }, [username, dateRange, repositoryMode, selectedRepo]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const user = params.get("user");
      if (user) setUsername(user);

      const range = params.get("range");
      if (isValidDateRangeKey(range)) {
        if (range === "custom") {
          setDateRange({
            key: "custom",
            from: params.get("from") ?? undefined,
            to: params.get("to") ?? undefined,
          });
        } else {
          setDateRange({ key: range });
        }
      }

      const repo = params.get("repo");
      if (repo === "all") {
        setRepositoryMode("all");
        setSelectedRepo(null);
      } else if (repo && repo.includes("/")) {
        const index = repo.indexOf("/");
        setRepositoryMode("single");
        setSelectedRepo({
          owner: repo.slice(0, index),
          repo: repo.slice(index + 1),
        });
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <GitHubContext.Provider
      value={{
        username,
        setUsername,
        repositoryMode,
        setRepositoryMode,
        selectedRepo,
        setSelectedRepo,
        dateRange,
        setDateRange,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHubContext(): GitHubContextValue {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error("useGitHubContext must be used within a GitHubProvider");
  }
  return context;
}

export function repoFullName(repo: SelectedRepo | null): string | null {
  if (!repo) return null;
  return `${repo.owner}/${repo.repo}`;
}
