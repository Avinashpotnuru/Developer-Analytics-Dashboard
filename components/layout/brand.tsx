import { LineChart } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-brand-gradient flex size-8 items-center justify-center rounded-xl shadow-sm">
        <LineChart className="size-4 text-white" />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">
        Dev<span className="text-gradient">Analytics</span>
      </span>
    </div>
  );
}
