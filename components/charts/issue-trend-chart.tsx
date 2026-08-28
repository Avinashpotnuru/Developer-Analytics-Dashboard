"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { ChartTooltip } from "@/components/shared/chart-tooltip";
import type { IssueTrendPoint } from "@/lib/types";

const OPENED_COLOR = "var(--chart-1)";
const CLOSED_COLOR = "var(--chart-4)";

interface IssueTrendChartProps {
  data: IssueTrendPoint[];
  className?: string;
}

export function IssueTrendChart({ data, className }: IssueTrendChartProps) {
  return (
    <div
      className={cn("text-muted-foreground", className)}
      style={{ height: 300 }}
      role="img"
      aria-label="Issues opened versus closed per month"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="issuesOpened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={OPENED_COLOR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={OPENED_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="issuesClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CLOSED_COLOR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CLOSED_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="currentColor"
            strokeOpacity={0.12}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, name) =>
                  `${value} ${name === "opened" ? "opened" : "closed"}`
                }
              />
            }
            cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
          />
          <Area
            type="monotone"
            dataKey="opened"
            name="opened"
            stroke={OPENED_COLOR}
            strokeWidth={2}
            fill="url(#issuesOpened)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="closed"
            name="closed"
            stroke={CLOSED_COLOR}
            strokeWidth={2}
            fill="url(#issuesClosed)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
