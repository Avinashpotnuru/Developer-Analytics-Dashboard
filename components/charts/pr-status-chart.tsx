"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/lib/utils";
import { ChartTooltip } from "@/components/shared/chart-tooltip";
import type { PrStatusBreakdown } from "@/lib/types";

const STATUS_COLORS: Record<keyof PrStatusBreakdown, string> = {
  open: "var(--chart-4)",
  merged: "var(--chart-3)",
  closed: "var(--muted-foreground)",
};

const STATUS_LABELS: Record<keyof PrStatusBreakdown, string> = {
  open: "Open",
  merged: "Merged",
  closed: "Closed",
};

interface PrStatusChartProps {
  data: PrStatusBreakdown;
  className?: string;
}

export function PrStatusChart({ data, className }: PrStatusChartProps) {
  const chartData = (Object.keys(STATUS_LABELS) as (keyof PrStatusBreakdown)[]).map(
    (key) => ({
      name: STATUS_LABELS[key],
      value: data[key],
      color: STATUS_COLORS[key],
    }),
  );
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-center",
        className,
      )}
      role="img"
      aria-label="Pull request status distribution"
    >
      <div className="relative mx-auto h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip formatter={(value) => `${value} PRs`} />
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {chartData.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
