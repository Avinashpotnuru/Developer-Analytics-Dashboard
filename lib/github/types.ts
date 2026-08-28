export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics?: string[];
  visibility?: string;
  owner: GitHubRepoOwner;
}

export interface GitHubCommitAuthor {
  name: string | null;
  email: string | null;
  date: string | null;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: GitHubCommitAuthor | null;
    committer: GitHubCommitAuthor | null;
  };
  author: { login: string; avatar_url: string; html_url: string } | null;
  committer: { login: string; avatar_url: string; html_url: string } | null;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  merged_at: string | null;
  user: { login: string; avatar_url: string; html_url: string } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments: number;
  additions: number;
  deletions: number;
  changed_files: number;
  head: { ref: string; label: string };
  base: { ref: string };
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  user: { login: string; avatar_url: string; html_url: string } | null;
  labels: (GitHubLabel | string)[];
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  pull_request?: { url: string; html_url: string };
  html_url: string;
}

export type GitHubLanguageMap = Record<string, number>;

export interface GitHubCommitActivityWeek {
  week: string;
  total: number;
  days: number[];
}
