import { describe, expect, it } from "vitest";
import {
  calculateCommitTrend,
  calculateIssueResolutionRate,
  calculateIssueTrend,
  calculateLanguageDistribution,
  calculateMergeRate,
  calculateRepositoryActivity,
  calculateRepositoryAnalytics,
  getDeveloperAnalytics,
} from "@/lib/analytics";
import type {
  Commit,
  DeveloperProfile,
  Issue,
  PullRequest,
  Repository,
} from "@/lib/types";

function makeRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: overrides.id ?? "1",
    name: overrides.name ?? "repo",
    fullName: overrides.fullName ?? "owner/repo",
    description: overrides.description ?? "",
    language: overrides.language ?? "TypeScript",
    stars: overrides.stars ?? 0,
    forks: overrides.forks ?? 0,
    openIssues: overrides.openIssues ?? 0,
    visibility: overrides.visibility ?? "public",
    updatedAt: overrides.updatedAt ?? "2024-01-01T00:00:00Z",
    topics: overrides.topics ?? [],
    url: overrides.url ?? "https://github.com/owner/repo",
  };
}

function makeCommit(overrides: Partial<Commit> = {}): Commit {
  return {
    id: overrides.id ?? "c1",
    sha: overrides.sha ?? "sha1",
    message: overrides.message ?? "commit",
    author: overrides.author ?? "alice",
    repository: overrides.repository ?? "owner/repo",
    date: overrides.date ?? "2024-01-01T10:00:00Z",
    additions: overrides.additions ?? 0,
    deletions: overrides.deletions ?? 0,
  };
}

function makePullRequest(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    id: overrides.id ?? "p1",
    number: overrides.number ?? 1,
    title: overrides.title ?? "PR",
    state: overrides.state ?? "open",
    author: overrides.author ?? "alice",
    repository: overrides.repository ?? "owner/repo",
    createdAt: overrides.createdAt ?? "2024-01-01T00:00:00Z",
    updatedAt: overrides.updatedAt ?? "2024-01-01T00:00:00Z",
    mergedAt: overrides.mergedAt ?? null,
    comments: overrides.comments ?? 0,
    additions: overrides.additions ?? 0,
    deletions: overrides.deletions ?? 0,
    branch: overrides.branch ?? "main",
  };
}

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: overrides.id ?? "i1",
    number: overrides.number ?? 1,
    title: overrides.title ?? "Issue",
    state: overrides.state ?? "open",
    author: overrides.author ?? "alice",
    repository: overrides.repository ?? "owner/repo",
    createdAt: overrides.createdAt ?? "2024-01-01T00:00:00Z",
    updatedAt: overrides.updatedAt ?? "2024-01-01T00:00:00Z",
    closedAt: overrides.closedAt ?? null,
    comments: overrides.comments ?? 0,
    labels: overrides.labels ?? [],
  };
}

const profile: DeveloperProfile = {
  username: "octocat",
  name: "The Octocat",
  bio: "",
  avatarUrl: "https://example.com/a.png",
  company: null,
  location: "",
  website: "",
  email: null,
  followers: 0,
  following: 0,
  publicRepos: 0,
  totalStars: 0,
  joinedAt: "2020-01-01T00:00:00Z",
};

describe("calculateMergeRate", () => {
  it("returns 0 when there are no pull requests", () => {
    expect(calculateMergeRate(0, 0)).toBe(0);
    expect(calculateMergeRate(0, 5)).toBe(0);
  });

  it("computes merged / total * 100", () => {
    expect(calculateMergeRate(5, 10)).toBe(50);
    expect(calculateMergeRate(10, 10)).toBe(100);
  });
});

describe("calculateIssueResolutionRate", () => {
  it("returns 0 when there are no issues", () => {
    expect(calculateIssueResolutionRate(0, 0)).toBe(0);
  });

  it("computes closed / total * 100", () => {
    expect(calculateIssueResolutionRate(1, 2)).toBe(50);
    expect(calculateIssueResolutionRate(3, 3)).toBe(100);
  });
});

describe("calculateLanguageDistribution", () => {
  it("aggregates bytes into sorted percentages", () => {
    const result = calculateLanguageDistribution({
      TypeScript: 100,
      JavaScript: 50,
      CSS: 25,
    });
    expect(result.totalBytes).toBe(175);
    expect(result.distribution[0]).toMatchObject({
      language: "TypeScript",
      bytes: 100,
      percentage: 57.1,
    });
    expect(result.topLanguages).toEqual(["TypeScript", "JavaScript", "CSS"]);
  });

  it("handles empty language data", () => {
    const result = calculateLanguageDistribution({});
    expect(result.totalBytes).toBe(0);
    expect(result.distribution).toEqual([]);
    expect(result.topLanguages).toEqual([]);
  });

  it("filters out zero-byte languages", () => {
    const result = calculateLanguageDistribution({ TypeScript: 100, Empty: 0 });
    expect(result.distribution).toHaveLength(1);
  });
});

describe("calculateCommitTrend", () => {
  it("groups commits by week and month", () => {
    const commits = [
      makeCommit({ date: "2024-01-01T10:00:00Z" }),
      makeCommit({ date: "2024-01-02T10:00:00Z" }),
      makeCommit({ date: "2024-01-08T10:00:00Z" }),
    ];
    const { byWeek, byMonth } = calculateCommitTrend(commits);
    expect(byWeek).toHaveLength(2);
    expect(byWeek[0].commits).toBe(2);
    expect(byWeek[1].commits).toBe(1);
    expect(byMonth).toHaveLength(1);
    expect(byMonth[0].commits).toBe(3);
  });

  it("returns empty buckets for no commits", () => {
    const { byWeek, byMonth } = calculateCommitTrend([]);
    expect(byWeek).toEqual([]);
    expect(byMonth).toEqual([]);
  });

  it("ignores commits with invalid dates", () => {
    const commits = [
      makeCommit({ date: "not-a-date" }),
      makeCommit({ date: "2024-01-01T10:00:00Z" }),
    ];
    const { byMonth } = calculateCommitTrend(commits);
    expect(byMonth[0].commits).toBe(1);
  });
});

describe("calculateRepositoryActivity", () => {
  it("uses the documented heuristic (stars + forks*2 + openIssues)", () => {
    const repo = makeRepository({ stars: 10, forks: 5, openIssues: 2 });
    expect(calculateRepositoryActivity(repo)).toBe(10 + 10 + 2);
  });
});

describe("calculateRepositoryAnalytics", () => {
  it("identifies most starred / forked / active repositories", () => {
    const repos = [
      makeRepository({ fullName: "a/a", stars: 10, forks: 5, openIssues: 2 }),
      makeRepository({ fullName: "b/b", stars: 20, forks: 1, openIssues: 0 }),
    ];
    const result = calculateRepositoryAnalytics({
      profile,
      repositories: repos,
      commits: [],
      pullRequests: [],
      issues: [],
      languages: {},
      commitActivity: { weekly: [], daily: [] },
    });
    expect(result.mostStarredRepository?.fullName).toBe("b/b");
    expect(result.mostForkedRepository?.fullName).toBe("a/a");
    expect(result.mostActiveRepository?.fullName).toBe("a/a");
    expect(result.totalStars).toBe(30);
    expect(result.averageStarsPerRepository).toBe(15);
  });

  it("returns nulls when there are no repositories", () => {
    const result = calculateRepositoryAnalytics({
      profile,
      repositories: [],
      commits: [],
      pullRequests: [],
      issues: [],
      languages: {},
      commitActivity: { weekly: [], daily: [] },
    });
    expect(result.mostStarredRepository).toBeNull();
    expect(result.mostForkedRepository).toBeNull();
    expect(result.mostActiveRepository).toBeNull();
    expect(result.totalRepositories).toBe(0);
  });

  it("dedupes repositories by full name", () => {
    const repos = [
      makeRepository({ fullName: "a/a", stars: 10 }),
      makeRepository({ id: "2", fullName: "a/a", stars: 99 }),
    ];
    const result = calculateRepositoryAnalytics({
      profile,
      repositories: repos,
      commits: [],
      pullRequests: [],
      issues: [],
      languages: {},
      commitActivity: { weekly: [], daily: [] },
    });
    expect(result.totalRepositories).toBe(1);
    expect(result.totalStars).toBe(10);
  });
});

describe("calculateIssueTrend", () => {
  function monthsAgoIso(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString();
  }

  it("does not count pull requests as issues", () => {
    const issues = [
      makeIssue({ state: "open", createdAt: monthsAgoIso(3) }),
      makeIssue({ state: "closed", createdAt: monthsAgoIso(2), closedAt: monthsAgoIso(1) }),
    ];
    const trend = calculateIssueTrend(issues);
    const totalOpened = trend.reduce((sum, point) => sum + point.opened, 0);
    const totalClosed = trend.reduce((sum, point) => sum + point.closed, 0);
    expect(totalOpened).toBe(2);
    expect(totalClosed).toBe(1);
  });

  it("returns a fixed number of monthly buckets", () => {
    expect(calculateIssueTrend([])).toHaveLength(6);
  });
});

describe("getDeveloperAnalytics", () => {
  it("computes the full analytics object from normal data", () => {
    const result = getDeveloperAnalytics({
      profile,
      repositories: [makeRepository({ stars: 10 }), makeRepository({ fullName: "o/b", stars: 20 })],
      commits: [makeCommit(), makeCommit({ id: "c2", sha: "sha2" }), makeCommit({ id: "c3", sha: "sha3" })],
      pullRequests: [
        makePullRequest({ state: "merged" }),
        makePullRequest({ id: "p2", state: "merged" }),
        makePullRequest({ id: "p3", state: "open" }),
        makePullRequest({ id: "p4", state: "closed" }),
      ],
      issues: [makeIssue({ state: "open" }), makeIssue({ id: "i2", state: "closed", closedAt: "2024-01-05T00:00:00Z" })],
      languages: { TypeScript: 100, JavaScript: 50 },
      commitActivity: { weekly: [], daily: [] },
    });

    expect(result.overview.totalRepositories).toBe(2);
    expect(result.overview.totalStars).toBe(30);
    expect(result.overview.totalCommits).toBe(3);
    expect(result.pullRequests.total).toBe(4);
    expect(result.pullRequests.merged).toBe(2);
    expect(result.pullRequests.mergeRate).toBe(50);
    expect(result.issues.total).toBe(2);
    expect(result.issues.resolutionRate).toBe(50);
    expect(result.languages.topLanguages[0]).toBe("TypeScript");
  });

  it("handles completely empty input without crashing", () => {
    const result = getDeveloperAnalytics({
      profile: null,
      repositories: [],
      commits: [],
      pullRequests: [],
      issues: [],
      languages: {},
      commitActivity: { weekly: [], daily: [] },
    });
    expect(result.overview.totalStars).toBe(0);
    expect(result.commits.totalCommits).toBe(0);
    expect(result.commits.mostActiveRepository).toBeNull();
    expect(result.pullRequests.mergeRate).toBe(0);
    expect(result.issues.resolutionRate).toBe(0);
    expect(result.languages.distribution).toEqual([]);
    expect(result.repositories.mostStarredRepository).toBeNull();
  });

  it("dedupes duplicate commits", () => {
    const result = getDeveloperAnalytics({
      profile,
      repositories: [makeRepository()],
      commits: [makeCommit(), makeCommit()],
      pullRequests: [],
      issues: [],
      languages: {},
      commitActivity: { weekly: [], daily: [] },
    });
    expect(result.overview.totalCommits).toBe(1);
  });
});
