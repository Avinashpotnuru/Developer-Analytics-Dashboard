import type { DateRangeFilter } from "./types";

export interface ResolvedRange {
  from: Date;
  to: Date;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function parseDateSafe(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function resolveDateRange(filter: DateRangeFilter): ResolvedRange {
  const now = new Date();
  const to = endOfDay(now);
  let from: Date;

  switch (filter.key) {
    case "7d":
      from = startOfDay(addDays(now, -6));
      break;
    case "30d":
      from = startOfDay(addDays(now, -29));
      break;
    case "90d":
      from = startOfDay(addDays(now, -89));
      break;
    case "6m":
      from = startOfDay(addMonths(now, -6));
      break;
    case "12m":
      from = startOfDay(addMonths(now, -12));
      break;
    case "custom": {
      const customFrom = parseDateSafe(filter.from);
      const customTo = parseDateSafe(filter.to);
      from = customFrom ? startOfDay(customFrom) : startOfDay(addMonths(now, -12));
      if (customTo) {
        to.setTime(endOfDay(customTo).getTime());
      }
      break;
    }
    default:
      from = startOfDay(addMonths(now, -12));
  }

  return { from, to };
}

export function isWithinRange(range: ResolvedRange, iso: string | undefined | null): boolean {
  const date = parseDateSafe(iso);
  if (!date) return false;
  const time = date.getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
}

export function formatRangeLabel(filter: DateRangeFilter): string {
  const labels: Record<DateRangeFilter["key"], string> = {
    "7d": "last 7 days",
    "30d": "last 30 days",
    "90d": "last 90 days",
    "6m": "last 6 months",
    "12m": "last 12 months",
    custom: "custom range",
  };
  return labels[filter.key];
}
