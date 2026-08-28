"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CommitActivityPoint } from "@/lib/types";

export const DATE_RANGE_PRESETS = [
  { value: "7d", label: "Last 7 days" },
  { value: "4w", label: "Last 4 weeks" },
  { value: "12w", label: "Last 12 weeks" },
  { value: "6m", label: "Last 6 months" },
  { value: "ytd", label: "Year to date" },
  { value: "all", label: "All time" },
] as const;

export type DateRangeValue = (typeof DATE_RANGE_PRESETS)[number]["value"];

const WEEKS_BY_RANGE: Record<DateRangeValue, number> = {
  "7d": 1,
  "4w": 4,
  "12w": 12,
  "6m": 26,
  ytd: Number.POSITIVE_INFINITY,
  all: Number.POSITIVE_INFINITY,
};

export function getCommitRange(
  data: CommitActivityPoint[],
  range: DateRangeValue,
): CommitActivityPoint[] {
  const weeks = WEEKS_BY_RANGE[range] ?? data.length;
  const start = Number.isFinite(weeks)
    ? Math.max(0, data.length - weeks)
    : 0;
  return data.slice(start);
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const current =
    DATE_RANGE_PRESETS.find((preset) => preset.value === value) ??
    DATE_RANGE_PRESETS[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className={className} />
        }
      >
        <CalendarIcon className="size-4" />
        {current.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Date range</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as DateRangeValue)}
        >
          {DATE_RANGE_PRESETS.map((preset) => (
            <DropdownMenuRadioItem key={preset.value} value={preset.value}>
              {preset.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
