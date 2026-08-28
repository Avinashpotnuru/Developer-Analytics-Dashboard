"use client";

import * as React from "react";
import { GitBranch } from "lucide-react";

import { useGitHubContext } from "@/components/github/github-context";
import { useRepositories } from "@/lib/github/queries";

export function RepoSelector() {
  const { username, selectedRepo, setSelectedRepo } = useGitHubContext();
  const { data: repos, isLoading } = useRepositories(username, {
    perPage: 100,
    sort: "updated",
    type: "owner",
  });

  const fullName = selectedRepo
    ? `${selectedRepo.owner}/${selectedRepo.repo}`
    : "";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) {
      setSelectedRepo(null);
      return;
    }
    const index = value.indexOf("/");
    setSelectedRepo({
      owner: value.slice(0, index),
      repo: value.slice(index + 1),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <GitBranch className="size-4 text-muted-foreground" />
      <select
        value={fullName}
        onChange={handleChange}
        disabled={isLoading || !repos?.length}
        aria-label="Select repository"
        className="focus-visible:ring-ring h-9 w-56 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
      >
        <option value="">
          {isLoading ? "Loading repositories…" : "Select a repository"}
        </option>
        {repos?.map((repo) => (
          <option key={repo.id} value={repo.fullName}>
            {repo.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}
