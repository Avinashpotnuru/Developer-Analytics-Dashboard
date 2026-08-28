import type {
  Commit,
  CommitActivityPoint,
  ContributionDay,
  DeveloperProfile,
  Issue,
  LanguageShare,
  PullRequest,
  Repository,
} from "@/lib/types";

export interface OverviewAnalytics {
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
}

export interface LanguageBreakdown extends LanguageShare {
  bytes: number;
}

export interface LanguageAnalytics {
  totalBytes: number;
  distribution: LanguageBreakdown[];
  topLanguages: string[];
}

export interface CommitTrendBucket {
  week: string;
  commits: number;
}

export interface CommitMonthBucket {
  month: string;
  commits: number;
}

export interface CommitAnalytics {
  totalCommits: number;
  byWeek: CommitTrendBucket[];
  byMonth: CommitMonthBucket[];
  averageCommitsPerWeek: number;
  mostActiveRepository: { repository: string; commits: number } | null;
  activity: { weekly: CommitActivityPoint[]; daily: ContributionDay[] };
}

export interface RepositoryAnalytics {
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  averageStarsPerRepository: number;
  averageForksPerRepository: number;
  mostStarredRepository: Repository | null;
  mostForkedRepository: Repository | null;
  mostActiveRepository: Repository | null;
  repositoriesByActivity: Repository[];
}

export interface PullRequestAnalytics {
  total: number;
  open: number;
  closed: number;
  merged: number;
  mergeRate: number;
}

export interface IssueAnalytics {
  total: number;
  open: number;
  closed: number;
  resolutionRate: number;
}

export interface DeveloperAnalytics {
  overview: OverviewAnalytics;
  commits: CommitAnalytics;
  repositories: RepositoryAnalytics;
  pullRequests: PullRequestAnalytics;
  issues: IssueAnalytics;
  languages: LanguageAnalytics;
}

export interface CommitActivityData {
  weekly: CommitActivityPoint[];
  daily: ContributionDay[];
}

export interface AnalyticsInput {
  profile: DeveloperProfile | null;
  repositories: Repository[];
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
  languages: Record<string, number>;
  commitActivity: CommitActivityData;
}
