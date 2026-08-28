import { describe, expect, it } from "vitest";

import { getDeveloperAnalytics } from "./index";
import type { AnalyticsInput } from "./types";
import type { Commit, Issue, PullRequest, Repository } from "@/lib/types";
import type { DateRangeFilter, RepositoryFilter } from "@/lib/filters/types";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

let seq = 0;
function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function makeRepo(stars = 10, forks = 2): Repository {
  return {
    id: uid("repo"),
    name: "repo",
    fullName: "owner/repo",
    description: "",
    language: "TypeScript",
    stars,
    forks,
    openIssues: 0,
    visibility: "public",
    updatedAt: new Date().toISOString(),
    topics: [],
    url: "",
  };
}

function makeCommit(date: string, repository = "owner/repo"): Commit {
  return {
    id: uid("commit"),
    sha: uid("sha"),
    message: "chore: update",
    author: "octocat",
    repository,
    date,
    additions: 0,
    deletions: 0,
  };
}

function makePR(
  state: PullRequest["state"],
  createdAt: string,
  repository = "owner/repo",
): PullRequest {
  return {
    id: uid("pr"),
    number: 1,
    title: "PR",
    state,
    author: "octocat",
    repository,
    createdAt,
    updatedAt: createdAt,
    mergedAt: state === "merged" ? createdAt : null,
    comments: 0,
    additions: 0,
    deletions: 0,
    branch: "main",
  };
}

function makeIssue(
  state: Issue["state"],
  createdAt: string,
  closedAt: string | null = null,
  repository = "owner/repo",
): Issue {
  return {
    id: uid("issue"),
    number: 1,
    title: "Issue",
    state,
    author: "octocat",
    repository,
    createdAt,
    updatedAt: createdAt,
    closedAt,
    comments: 0,
    labels: [],
  };
}

function makeInput(overrides: Partial<AnalyticsInput> = {}): AnalyticsInput {
  return {
    profile: null,
    repositories: [makeRepo()],
    commits: [],
    pullRequests: [],
    issues: [],
    languages: {},
    commitActivity: { weekly: [], daily: [] },
    ...overrides,
  };
}

const RANGE_30: DateRangeFilter = { key: "30d" };
const RANGE_90: DateRangeFilter = { key: "90d" };

describe("lifetime vs date-range metrics", () => {
  it("keeps repository totals constant across date ranges", () => {
    const input = makeInput({ repositories: [makeRepo(42, 7)] });
    const within30 = getDeveloperAnalytics(input, { dateRange: RANGE_30 });
    const within90 = getDeveloperAnalytics(input, { dateRange: RANGE_90 });
    expect(within30.overview.totalRepositories).toBe(1);
    expect(within30.overview.totalStars).toBe(42);
    expect(within30.overview.totalForks).toBe(7);
    expect(within90.overview.totalStars).toBe(42);
    expect(within90.overview.totalForks).toBe(7);
  });

  it("restricts commit counts to the selected window", () => {
    const input = makeInput({
      commits: [makeCommit(daysAgo(5)), makeCommit(daysAgo(60))],
    });
    expect(getDeveloperAnalytics(input, { dateRange: RANGE_30 }).overview.totalCommits).toBe(1);
    expect(getDeveloperAnalytics(input, { dateRange: RANGE_90 }).overview.totalCommits).toBe(2);
  });
});

describe("merge rate after filtering", () => {
  it("recomputes merge rate from in-range pull requests", () => {
    const input = makeInput({
      pullRequests: [
        makePR("merged", daysAgo(5)),
        makePR("open", daysAgo(5)),
        makePR("merged", daysAgo(60)),
      ],
    });
    const result = getDeveloperAnalytics(input, { dateRange: RANGE_30 }).pullRequests;
    expect(result.total).toBe(2);
    expect(result.merged).toBe(1);
    expect(result.mergeRate).toBe(50);
  });
});

describe("issue resolution after filtering", () => {
  it("recomputes resolution rate from in-range issues", () => {
    const input = makeInput({
      issues: [
        makeIssue("closed", daysAgo(5), daysAgo(4)),
        makeIssue("open", daysAgo(5)),
        makeIssue("closed", daysAgo(60), daysAgo(59)),
      ],
    });
    const result = getDeveloperAnalytics(input, { dateRange: RANGE_30 }).issues;
    expect(result.total).toBe(2);
    expect(result.closed).toBe(1);
    expect(result.resolutionRate).toBe(50);
  });
});

describe("empty filter results", () => {
  it("handles empty commits and pull requests without divide-by-zero", () => {
    const input = makeInput({ commits: [], pullRequests: [] });
    const result = getDeveloperAnalytics(input, { dateRange: RANGE_30 });
    expect(result.overview.totalCommits).toBe(0);
    expect(result.pullRequests.total).toBe(0);
    expect(result.pullRequests.mergeRate).toBe(0);
    expect(result.issues.resolutionRate).toBe(0);
  });
});

describe("repository filtering", () => {
  it("scopes analytics to a single repository", () => {
    const input = makeInput({
      commits: [makeCommit(daysAgo(5), "owner/A"), makeCommit(daysAgo(5), "owner/B")],
    });
    const single: RepositoryFilter = { mode: "single", repo: "owner/A" };
    expect(getDeveloperAnalytics(input, { repository: single }).overview.totalCommits).toBe(1);
    const all: RepositoryFilter = { mode: "all" };
    expect(getDeveloperAnalytics(input, { repository: all }).overview.totalCommits).toBe(2);
  });

  it("treats a repository with no pull requests as zero without breaking", () => {
    const input = makeInput({
      commits: [makeCommit(daysAgo(5)), makeCommit(daysAgo(5))],
      pullRequests: [],
    });
    const result = getDeveloperAnalytics(input, { dateRange: RANGE_30 });
    expect(result.pullRequests.total).toBe(0);
    expect(result.pullRequests.mergeRate).toBe(0);
    expect(result.overview.totalCommits).toBe(2);
  });
});

describe("combined filters", () => {
  it("applies date range and repository filter together", () => {
    const input = makeInput({
      commits: [
        makeCommit(daysAgo(5), "owner/A"),
        makeCommit(daysAgo(5), "owner/B"),
        makeCommit(daysAgo(60), "owner/A"),
      ],
    });
    const result = getDeveloperAnalytics(input, {
      dateRange: RANGE_30,
      repository: { mode: "all" },
    });
    expect(result.overview.totalCommits).toBe(2);
  });
});

describe("username changes", () => {
  it("produces different analytics for different underlying data", () => {
    const one = getDeveloperAnalytics(
      makeInput({ commits: [makeCommit(daysAgo(5))] }),
    );
    const two = getDeveloperAnalytics(
      makeInput({ commits: [makeCommit(daysAgo(5)), makeCommit(daysAgo(5))] }),
    );
    expect(one.overview.totalCommits).not.toBe(two.overview.totalCommits);
  });
});
