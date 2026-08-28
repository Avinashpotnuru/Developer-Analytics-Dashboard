"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/shared/date-range-picker";
import { mockProfile } from "@/lib/mock-data";

interface DashboardHeaderProps {
  range: DateRangeValue;
  onRangeChange: (range: DateRangeValue) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function DashboardHeader({
  range,
  onRangeChange,
  onRefresh,
  refreshing,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Developer Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          @{mockProfile.username}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DateRangePicker value={range} onChange={onRangeChange} />
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
