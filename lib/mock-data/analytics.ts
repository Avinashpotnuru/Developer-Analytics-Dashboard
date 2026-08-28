import type { AnalyticsData, ContributionDay } from "@/lib/types";

function buildContribution(days: number): ContributionDay[] {
  const result: ContributionDay[] = [];
  const end = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const weekday = d.getDay();
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const weekend = weekday === 0 || weekday === 6 ? 0.4 : 1;
    let count = 0;
    if (r > 0.25) count = Math.round(((r - 0.25) / 0.75) * 14 * weekend);
    if (r > 0.92) count += Math.round(8 * weekend);
    const level: ContributionDay["level"] =
      count === 0 ? 0 : count < 3 ? 1 : count < 7 ? 2 : count < 11 ? 3 : 4;
    result.push({ date: d.toISOString().slice(0, 10), count, level });
  }
  return result;
}

export const mockAnalytics: AnalyticsData = {
  kpis: [
    {
      id: "repositories",
      label: "Repositories",
      value: 64,
      change: 8.2,
      spark: [51, 53, 54, 56, 57, 59, 60, 61, 62, 63, 63, 64],
    },
    {
      id: "stars",
      label: "Stars",
      value: 7321,
      change: 12.4,
      spark: [5200, 5400, 5800, 6100, 6300, 6500, 6700, 6900, 7050, 7180, 7260, 7321],
    },
    {
      id: "forks",
      label: "Forks",
      value: 573,
      change: 5.1,
      spark: [470, 488, 501, 512, 520, 533, 540, 548, 555, 561, 568, 573],
    },
    {
      id: "commits",
      label: "Commits",
      value: 1248,
      change: 18.6,
      spark: [820, 860, 905, 940, 980, 1010, 1055, 1090, 1130, 1175, 1210, 1248],
    },
    {
      id: "pullRequests",
      label: "Pull Requests",
      value: 482,
      change: 9.3,
      spark: [380, 392, 405, 418, 430, 441, 452, 463, 470, 475, 479, 482],
    },
    {
      id: "issues",
      label: "Issues",
      value: 312,
      change: -2.1,
      spark: [340, 338, 335, 333, 330, 328, 325, 322, 320, 318, 315, 312],
    },
  ],
  commitActivity: [
    { week: "Jun 08", commits: 78 },
    { week: "Jun 15", commits: 92 },
    { week: "Jun 22", commits: 85 },
    { week: "Jun 29", commits: 104 },
    { week: "Jul 06", commits: 96 },
    { week: "Jul 13", commits: 112 },
    { week: "Jul 20", commits: 121 },
    { week: "Jul 27", commits: 110 },
    { week: "Aug 03", commits: 134 },
    { week: "Aug 10", commits: 128 },
    { week: "Aug 17", commits: 145 },
    { week: "Aug 24", commits: 161 },
  ],
  languageDistribution: [
    { language: "TypeScript", percentage: 42 },
    { language: "JavaScript", percentage: 16 },
    { language: "CSS", percentage: 9 },
    { language: "HTML", percentage: 5 },
    { language: "Python", percentage: 8 },
    { language: "Go", percentage: 7 },
    { language: "Rust", percentage: 6 },
    { language: "Vue", percentage: 7 },
  ],
  pullRequestStatus: {
    open: 38,
    merged: 402,
    closed: 74,
  },
  issueTrend: [
    { month: "Jan", opened: 28, closed: 24 },
    { month: "Feb", opened: 31, closed: 29 },
    { month: "Mar", opened: 42, closed: 38 },
    { month: "Apr", opened: 37, closed: 41 },
    { month: "May", opened: 45, closed: 40 },
    { month: "Jun", opened: 52, closed: 48 },
    { month: "Jul", opened: 49, closed: 53 },
    { month: "Aug", opened: 58, closed: 55 },
  ],
  contribution: buildContribution(371),
};
