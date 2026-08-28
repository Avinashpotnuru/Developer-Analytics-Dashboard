"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  positive?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  positive = true,
  className,
}: SparklineProps) {
  const id = useId().replace(/:/g, "");
  const color = positive
    ? "var(--brand)"
    : "oklch(0.7 0.17 22)";

  const points = data.map((value, index) => ({ index, value }));

  return (
    <div className={cn("h-10 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            fill={`url(#spark-${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
