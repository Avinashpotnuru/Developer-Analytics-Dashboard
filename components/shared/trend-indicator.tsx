import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPercentage } from "@/lib/format";

interface TrendIndicatorProps {
  value: number;
  className?: string;
}

export function TrendIndicator({ value, className }: TrendIndicatorProps) {
  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
        className,
      )}
      title={`${isPositive ? "Increased" : "Decreased"} by ${formatPercentage(value)}`}
    >
      <Icon className="size-3.5" />
      {formatPercentage(value)}
    </span>
  );
}
