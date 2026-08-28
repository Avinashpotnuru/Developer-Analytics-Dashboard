"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { cn } from "@/lib/utils";
import { ChartTooltip } from "@/components/shared/chart-tooltip";
import type { CommitActivityPoint } from "@/lib/types";

const SERIES_COLOR = "var(--chart-1)";

interface CommitActivityChartProps {
  data: CommitActivityPoint[];
  className?: string;
}

export function CommitActivityChart({
  data,
  className,
}: CommitActivityChartProps) {
  return (
    <div
      className={cn("tabular-nums text-muted-foreground", className)}
      style={{ height: 300 }}
      role="img"
      aria-label="Commit activity over time"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="currentColor"
            strokeOpacity={0.1}
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickMargin={8}
            minTickGap={16}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            content={<ChartTooltip formatter={(value) => `${value} commits`} />}
            cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            fill="url(#commitGradient)"
            activeDot={{ r: 4, strokeWidth: 0, fill: SERIES_COLOR }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
