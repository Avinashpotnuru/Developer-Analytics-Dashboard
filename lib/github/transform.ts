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
import type {
  GitHubCommit,
  GitHubCommitActivityWeek,
  GitHubIssue,
  GitHubLanguageMap,
  GitHubPullRequest,
  GitHubRepo,
  GitHubUser,
} from "./types";

function normalizeUrl(value: string): string {
  if (!value) return "";
  return /^https?:\/\//.test(value) ? value : `https://${value}`;
}

function levelFor(count: number): ContributionDay["level"] {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 7) return 2;
  if (count < 12) return 3;
  return 4;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function transformProfile(user: GitHubUser): DeveloperProfile {
  return {
    username: user.login,
    name: user.name ?? user.login,
    bio: user.bio ?? "",
    avatarUrl: user.avatar_url,
    company: user.company,
    location: user.location ?? "",
    website: normalizeUrl(user.blog),
    email: user.email,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    totalStars: 0,
    joinedAt: user.created_at,
  };
}

export function transformRepository(repo: GitHubRepo): Repository {
  return {
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? "",
    language: repo.language ?? "Unknown",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    visibility: repo.private ? "private" : "public",
    updatedAt: repo.updated_at,
    topics: repo.topics ?? [],
    url: repo.html_url,
  };
}

export function transformCommit(
  commit: GitHubCommit,
  repository: string,
): Commit {
  return {
    id: commit.sha,
    sha: commit.sha,
    message: commit.commit.message.split("\n")[0] ?? "",
    author: commit.author?.login ?? commit.commit.author?.name ?? "Unknown",
    repository,
    date: commit.commit.author?.date ?? commit.commit.committer?.date ?? new Date().toISOString(),
    additions: 0,
    deletions: 0,
  };
}

export function transformPullRequest(
  pullRequest: GitHubPullRequest,
  repository: string,
): PullRequest {
  return {
    id: String(pullRequest.id),
    number: pullRequest.number,
    title: pullRequest.title,
    state: pullRequest.merged_at ? "merged" : pullRequest.state,
    author: pullRequest.user?.login ?? "Unknown",
    repository,
    createdAt: pullRequest.created_at,
    updatedAt: pullRequest.updated_at,
    mergedAt: pullRequest.merged_at,
    comments: pullRequest.comments,
    additions: pullRequest.additions,
    deletions: pullRequest.deletions,
    branch: pullRequest.head.ref,
  };
}

export function transformIssue(
  issue: GitHubIssue,
  repository: string,
): Issue {
  return {
    id: String(issue.id),
    number: issue.number,
    title: issue.title,
    state: issue.state,
    author: issue.user?.login ?? "Unknown",
    repository,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    comments: issue.comments,
    labels: issue.labels.map((label) =>
      typeof label === "string" ? label : label.name,
    ),
  };
}

export function transformLanguages(
  map: GitHubLanguageMap,
): LanguageShare[] {
  const entries = Object.entries(map);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0) || 1;
  return entries
    .map(([language, bytes]) => ({
      language,
      percentage: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function transformCommitActivity(weeks: GitHubCommitActivityWeek[]): {
  weekly: CommitActivityPoint[];
  daily: ContributionDay[];
} {
  const weekly: CommitActivityPoint[] = weeks.map((week) => {
    const start = new Date(Number(week.week) * 1000);
    return {
      week: `${MONTHS[start.getMonth()]} ${String(start.getDate()).padStart(2, "0")}`,
      weekStart: start.toISOString().slice(0, 10),
      commits: week.total,
    };
  });

  const daily: ContributionDay[] = [];
  for (const week of weeks) {
    const start = new Date(Number(week.week) * 1000);
    if (Number.isNaN(start.getTime())) continue;
    week.days.forEach((count, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      daily.push({
        date: day.toISOString().slice(0, 10),
        count,
        level: levelFor(count),
      });
    });
  }

  return { weekly, daily };
}

export interface RepositorySummary {
  count: number;
  totalStars: number;
  totalForks: number;
}

export function summarizeRepositories(repos: Repository[]): RepositorySummary {
  return {
    count: repos.length,
    totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
    totalForks: repos.reduce((sum, repo) => sum + repo.forks, 0),
  };
}

export interface PullRequestSummary {
  total: number;
  open: number;
  merged: number;
  closed: number;
}

export function summarizePullRequests(
  pullRequests: PullRequest[],
): PullRequestSummary {
  return {
    total: pullRequests.length,
    open: pullRequests.filter((pr) => pr.state === "open").length,
    merged: pullRequests.filter((pr) => pr.state === "merged").length,
    closed: pullRequests.filter((pr) => pr.state === "closed").length,
  };
}

export interface IssueSummary {
  total: number;
  open: number;
  closed: number;
}

export function summarizeIssues(issues: Issue[]): IssueSummary {
  return {
    total: issues.length,
    open: issues.filter((issue) => issue.state === "open").length,
    closed: issues.filter((issue) => issue.state === "closed").length,
  };
}
