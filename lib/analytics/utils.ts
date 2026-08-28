import type { Commit, Repository } from "@/lib/types";

export function dedupeRepositories(repositories: Repository[]): Repository[] {
  const seen = new Set<string>();
  const result: Repository[] = [];
  for (const repo of repositories) {
    if (seen.has(repo.fullName)) continue;
    seen.add(repo.fullName);
    result.push(repo);
  }
  return result;
}

export function dedupeCommits(commits: Commit[]): Commit[] {
  const seen = new Set<string>();
  const result: Commit[] = [];
  for (const commit of commits) {
    if (seen.has(commit.sha)) continue;
    seen.add(commit.sha);
    result.push(commit);
  }
  return result;
}
