"use client";

import * as React from "react";

import type { ContributionDay } from "@/lib/types";

const SCALE = [
  "var(--border)",
  "color-mix(in oklch, var(--brand) 28%, transparent)",
  "color-mix(in oklch, var(--brand) 52%, transparent)",
  "color-mix(in oklch, var(--brand) 76%, transparent)",
  "var(--brand)",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function buildWeeks(data: ContributionDay[]): (ContributionDay | null)[][] {
  const lead = new Date(data[0].date).getDay();
  const cells: (ContributionDay | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (const day of data) cells.push(day);
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

interface ContributionHeatmapProps {
  data: ContributionDay[];
  className?: string;
}

export function ContributionHeatmap({ data, className }: ContributionHeatmapProps) {
  const weeks = React.useMemo(() => buildWeeks(data), [data]);
  const total = React.useMemo(
    () => data.reduce((sum, day) => sum + day.count, 0),
    [data],
  );

  const weeksWithLabel = React.useMemo(() => {
    return weeks.map((week, i) => {
      const firstDay = week[0];
      const month = firstDay ? new Date(firstDay.date).getMonth() : -1;
      const prev = weeks[i - 1]?.[0];
      const prevMonth = prev ? new Date(prev.date).getMonth() : -1;
      const show = firstDay ? month !== prevMonth : false;
      return { week, show, month };
    });
  }, [weeks]);

  return (
    <div className={className}>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1.5">
          <div className="flex gap-1 pl-7">
            {weeksWithLabel.map(({ show, month }, i) => (
              <div
                key={i}
                className="w-3 text-[10px] leading-none text-muted-foreground"
              >
                {show ? MONTHS[month] : ""}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-1">
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="flex size-3 items-center text-[9px] leading-none text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
            {weeksWithLabel.map(({ week }, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={di}
                      title={`${day.count} commits on ${day.date}`}
                      aria-label={`${day.count} commits on ${day.date}`}
                      className="size-3 rounded-[3px] ring-1 ring-inset ring-black/5 transition-transform hover:scale-125"
                      style={{ backgroundColor: SCALE[day.level] }}
                    />
                  ) : (
                    <div key={di} className="size-3 rounded-[3px]" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>{total.toLocaleString()} contributions in the last year</span>
        <span className="flex items-center gap-1">
          Less
          {SCALE.map((color, i) => (
            <span
              key={i}
              className="size-3 rounded-[3px] ring-1 ring-inset ring-black/5"
              style={{ backgroundColor: color }}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
