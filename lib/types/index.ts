export type RepositoryVisibility = "public" | "private";

export type ProgrammingLanguage = string;

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  visibility: RepositoryVisibility;
  updatedAt: string;
  topics: string[];
  url: string;
}

export type PullRequestState = "open" | "merged" | "closed";

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: PullRequestState;
  author: string;
  repository: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  comments: number;
  additions: number;
  deletions: number;
  branch: string;
}

export type IssueState = "open" | "closed";

export interface Issue {
  id: string;
  number: number;
  title: string;
  state: IssueState;
  author: string;
  repository: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  comments: number;
  labels: string[];
}

export interface Commit {
  id: string;
  sha: string;
  message: string;
  author: string;
  repository: string;
  date: string;
  additions: number;
  deletions: number;
}

export type ActivityType =
  | "commit"
  | "pull_request"
  | "issue"
  | "repository_created";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  repository: string;
  description: string;
  date: string;
}

export interface DeveloperProfile {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  company: string | null;
  location: string;
  website: string;
  email: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  joinedAt: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  spark?: number[];
}

export interface CommitActivityPoint {
  week: string;
  commits: number;
  /** ISO start date of the week, used for range filtering. */
  weekStart?: string;
}

export interface LanguageShare {
  language: string;
  percentage: number;
}

export interface PrStatusBreakdown {
  open: number;
  merged: number;
  closed: number;
}

export interface IssueTrendPoint {
  month: string;
  opened: number;
  closed: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface AnalyticsData {
  kpis: KpiMetric[];
  commitActivity: CommitActivityPoint[];
  languageDistribution: LanguageShare[];
  pullRequestStatus: PrStatusBreakdown;
  issueTrend: IssueTrendPoint[];
  contribution: ContributionDay[];
}
