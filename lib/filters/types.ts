export type DateRangeKey = "7d" | "30d" | "90d" | "6m" | "12m" | "custom";

export interface DateRangeFilter {
  key: DateRangeKey;
  /** Inclusive start date (YYYY-MM-DD). Used when key is "custom". */
  from?: string;
  /** Inclusive end date (YYYY-MM-DD). Used when key is "custom". */
  to?: string;
}

export type RepositoryFilterMode = "all" | "single";

export interface RepositoryFilter {
  mode: RepositoryFilterMode;
  /** Full name "owner/repo". Required when mode is "single". */
  repo?: string;
}

export interface DashboardFilters {
  dateRange: DateRangeFilter;
  repository: RepositoryFilter;
}

export const DATE_RANGE_KEYS: DateRangeKey[] = [
  "7d",
  "30d",
  "90d",
  "6m",
  "12m",
  "custom",
];

export const DATE_RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "6m", label: "Last 6 months" },
  { key: "12m", label: "Last 12 months" },
  { key: "custom", label: "Custom range" },
];

export const DEFAULT_DATE_RANGE: DateRangeFilter = { key: "12m" };

export function isValidDateRangeKey(value: string | null): value is DateRangeKey {
  return value !== null && (DATE_RANGE_KEYS as string[]).includes(value);
}
