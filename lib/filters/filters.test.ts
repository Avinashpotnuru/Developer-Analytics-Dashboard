import { describe, expect, it } from "vitest";

import {
  aggregateLanguages,
  combineCommitActivity,
  filterByRepository,
  filterCommitActivityByRange,
  filterCommitsByRange,
  filterIssuesByRange,
  filterPullRequestsByRange,
  resolveDateRange,
} from "./index";
import type { Commit, Issue, PullRequest } from "@/lib/types";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function makeCommit(date: string, repository = "owner/repo"): Commit {
  return {
    id: `${repository}-${date}`,
    sha: date,
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
    id: `${repository}-${createdAt}`,
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
    id: `${repository}-${createdAt}`,
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

describe("date range resolution", () => {
  it("resolves a 30 day window ending today", () => {
    const range = resolveDateRange({ key: "30d" });
    const now = Date.now();
    expect(range.to.getTime()).toBeGreaterThanOrEqual(now - 5_000);
    expect(range.from.getTime()).toBeLessThanOrEqual(now - 28 * 86_400_000);
  });

  it("falls back to the last 12 months for invalid custom ranges", () => {
    const range = resolveDateRange({ key: "custom" });
    const diffDays = (range.to.getTime() - range.from.getTime()) / 86_400_000;
    expect(diffDays).toBeGreaterThan(350);
  });
});

describe("commit filtering", () => {
  it("keeps only commits inside the range", () => {
    const commits = [makeCommit(daysAgo(2)), makeCommit(daysAgo(45))];
    const range = resolveDateRange({ key: "30d" });
    expect(filterCommitsByRange(commits, range)).toHaveLength(1);
  });
});

describe("pull request filtering", () => {
  it("keeps only pull requests created inside the range", () => {
    const prs = [
      makePR("merged", daysAgo(3)),
      makePR("open", daysAgo(60)),
    ];
    const range = resolveDateRange({ key: "30d" });
    expect(filterPullRequestsByRange(prs, range)).toHaveLength(1);
  });
});

describe("issue filtering", () => {
  it("keeps only issues created inside the range", () => {
    const issues = [
      makeIssue("open", daysAgo(10)),
      makeIssue("closed", daysAgo(120), daysAgo(100)),
    ];
    const range = resolveDateRange({ key: "30d" });
    expect(filterIssuesByRange(issues, range)).toHaveLength(1);
  });
});

describe("repository filtering", () => {
  it("scopes items to a single repository", () => {
    const commits = [
      makeCommit(daysAgo(1), "owner/A"),
      makeCommit(daysAgo(1), "owner/B"),
    ];
    expect(filterByRepository(commits, "owner/A")).toHaveLength(1);
  });
});

describe("language aggregation", () => {
  it("sums bytes across repositories", () => {
    const result = aggregateLanguages([{ TS: 10 }, { TS: 5, JS: 3 }]);
    expect(result).toEqual({ TS: 15, JS: 3 });
  });
});

describe("commit activity combination", () => {
  it("sums weekly and daily counts across repositories", () => {
    const combined = combineCommitActivity([
      {
        weekly: [{ week: "Jan 01", weekStart: "2024-01-01", commits: 3 }],
        daily: [{ date: "2024-01-01", count: 2, level: 1 }],
      },
      {
        weekly: [{ week: "Jan 01", weekStart: "2024-01-01", commits: 5 }],
        daily: [{ date: "2024-01-01", count: 3, level: 2 }],
      },
    ]);
    expect(combined.weekly).toHaveLength(1);
    expect(combined.weekly[0].commits).toBe(8);
    expect(combined.daily).toHaveLength(1);
    expect(combined.daily[0].count).toBe(5);
  });
});

describe("commit activity range filtering", () => {
  it("drops weeks and days outside the range", () => {
    const range = resolveDateRange({ key: "30d" });
    const result = filterCommitActivityByRange(
      {
        weekly: [
          { week: "Recent", weekStart: daysAgo(2).slice(0, 10), commits: 4 },
          { week: "Old", weekStart: daysAgo(60).slice(0, 10), commits: 9 },
        ],
        daily: [
          { date: daysAgo(2).slice(0, 10), count: 4, level: 1 },
          { date: daysAgo(60).slice(0, 10), count: 9, level: 4 },
        ],
      },
      range,
    );
    expect(result.weekly).toHaveLength(1);
    expect(result.daily).toHaveLength(1);
  });
});
