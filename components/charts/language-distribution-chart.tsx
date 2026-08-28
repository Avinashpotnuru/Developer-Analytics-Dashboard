"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/lib/utils";
import { LANGUAGE_COLORS } from "@/lib/format";
import { ChartTooltip } from "@/components/shared/chart-tooltip";
import type { LanguageShare } from "@/lib/types";

interface LanguageDistributionChartProps {
  data: LanguageShare[];
  className?: string;
}

export function LanguageDistributionChart({
  data,
  className,
}: LanguageDistributionChartProps) {
  const top = data.reduce(
    (best, current) => (current.percentage > best.percentage ? current : best),
    data[0],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-center",
        className,
      )}
      role="img"
      aria-label="Language distribution"
    >
      <div className="relative mx-auto h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="language"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.language}
                  fill={LANGUAGE_COLORS[entry.language]}
                />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltip formatter={(value) => `${value}%`} />}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">
            {top.percentage}%
          </span>
          <span className="text-xs text-muted-foreground">{top.language}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((entry) => (
          <li
            key={entry.language}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLORS[entry.language] }}
                aria-hidden
              />
              {entry.language}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {entry.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
