import type { LanguageAnalytics, LanguageBreakdown } from "./types";

export function calculateLanguageDistribution(
  bytes: Record<string, number>,
): LanguageAnalytics {
  const entries = Object.entries(bytes).filter(([, value]) => value > 0);
  const totalBytes = entries.reduce((sum, [, value]) => sum + value, 0);

  if (totalBytes === 0) {
    return { totalBytes: 0, distribution: [], topLanguages: [] };
  }

  const distribution: LanguageBreakdown[] = entries
    .map(([language, value]) => ({
      language,
      bytes: value,
      percentage: Number(((value / totalBytes) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const topLanguages = distribution.slice(0, 5).map((entry) => entry.language);

  return { totalBytes, distribution, topLanguages };
}
