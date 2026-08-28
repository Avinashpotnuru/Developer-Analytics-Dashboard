import type {
  AnalyticsInput,
  CommitAnalytics,
  CommitMonthBucket,
  CommitTrendBucket,
} from "./types";
import { dedupeCommits } from "./utils";
import {
  formatMonthLabel,
  formatWeekLabel,
  monthKey,
  toDate,
  weekKey,
} from "./date";

export function calculateCommitTrend(commits: AnalyticsInput["commits"]): {
  byWeek: CommitTrendBucket[];
  byMonth: CommitMonthBucket[];
} {
  const weeks = new Map<string, number>();
  const months = new Map<string, number>();

  for (const commit of commits) {
    let date: Date;
    try {
      date = toDate(commit.date);
    } catch {
      continue;
    }
    const week = weekKey(date);
    weeks.set(week, (weeks.get(week) ?? 0) + 1);
    const month = monthKey(date);
    months.set(month, (months.get(month) ?? 0) + 1);
  }

  const byWeek = [...weeks.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, count]) => ({ week: formatWeekLabel(key), commits: count }));

  const byMonth = [...months.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, count]) => ({ month: formatMonthLabel(key), commits: count }));

  return { byWeek, byMonth };
}

export function calculateMostActiveCommitRepository(
  commits: AnalyticsInput["commits"],
): { repository: string; commits: number } | null {
  const counts = new Map<string, number>();
  for (const commit of commits) {
    counts.set(commit.repository, (counts.get(commit.repository) ?? 0) + 1);
  }
  let best: { repository: string; commits: number } | null = null;
  for (const [repository, count] of counts) {
    if (!best || count > best.commits) {
      best = { repository, commits: count };
    }
  }
  return best;
}

export function calculateCommitAnalytics(
  input: AnalyticsInput,
): CommitAnalytics {
  const commits = dedupeCommits(input.commits);
  const { byWeek, byMonth } = calculateCommitTrend(commits);
  const totalCommits = commits.length;
  const weekCount = byWeek.length;
  const averageCommitsPerWeek =
    weekCount > 0 ? totalCommits / weekCount : 0;

  return {
    totalCommits,
    byWeek,
    byMonth,
    averageCommitsPerWeek: Number(averageCommitsPerWeek.toFixed(2)),
    mostActiveRepository: calculateMostActiveCommitRepository(commits),
    activity: input.commitActivity,
  };
}
