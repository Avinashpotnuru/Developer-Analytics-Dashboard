"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";

import { useGitHubContext } from "@/components/github/github-context";
import {
  DATE_RANGE_OPTIONS,
  type DateRangeFilter,
} from "@/lib/filters/types";

const SELECT_CLASS =
  "focus-visible:ring-ring h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50";

export function DateRangeFilter() {
  const { dateRange, setDateRange } = useGitHubContext();

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const key = event.target.value;
    if (key === "custom") {
      setDateRange({ key: "custom", from: dateRange.from, to: dateRange.to });
    } else {
      setDateRange({ key: key as DateRangeFilter["key"] });
    }
  };

  return (
    <div
      role="group"
      aria-label="Date range filter"
      className="flex flex-wrap items-center gap-2"
    >
      <CalendarRange className="size-4 text-muted-foreground" />
      <select
        value={dateRange.key}
        onChange={handleSelect}
        aria-label="Date range"
        className={SELECT_CLASS}
      >
        {DATE_RANGE_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      {dateRange.key === "custom" ? (
        <>
          <input
            type="date"
            value={dateRange.from ?? ""}
            onChange={(event) =>
              setDateRange({ ...dateRange, from: event.target.value })
            }
            aria-label="Start date"
            className={SELECT_CLASS}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.to ?? ""}
            onChange={(event) =>
              setDateRange({ ...dateRange, to: event.target.value })
            }
            aria-label="End date"
            className={SELECT_CLASS}
          />
        </>
      ) : null}
    </div>
  );
}
