"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface SelectedRepo {
  owner: string;
  repo: string;
}

interface GitHubContextValue {
  username: string;
  setUsername: (username: string) => void;
  selectedRepo: SelectedRepo | null;
  setSelectedRepo: (repo: SelectedRepo | null) => void;
}

const GitHubContext = createContext<GitHubContextValue | null>(null);

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("octocat");
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);

  return (
    <GitHubContext.Provider
      value={{ username, setUsername, selectedRepo, setSelectedRepo }}
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
