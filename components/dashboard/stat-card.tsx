import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendIndicator } from "@/components/shared/trend-indicator";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  featured?: boolean;
  spark?: number[];
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  featured = false,
  spark,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "card-interactive",
        featured && "border-brand/30 bg-brand/[0.03]",
      )}
    >
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p
              className={cn(
                "font-semibold tracking-tight tabular-nums",
                featured ? "text-4xl" : "text-2xl",
              )}
            >
              {value}
            </p>
            {change !== undefined ? <TrendIndicator value={change} /> : null}
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              featured
                ? "bg-brand/10 text-brand"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
        {spark && spark.length > 0 ? (
          <Sparkline
            data={spark}
            positive={(change ?? 0) >= 0}
            className={featured ? "mt-1" : undefined}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
