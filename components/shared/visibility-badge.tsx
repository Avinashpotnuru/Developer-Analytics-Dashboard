import { Globe, Lock, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { RepositoryVisibility } from "@/lib/types";

const VARIANTS: Record<
  RepositoryVisibility,
  { label: string; icon: LucideIcon; className: string }
> = {
  public: {
    label: "Public",
    icon: Globe,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  private: {
    label: "Private",
    icon: Lock,
    className:
      "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

export function VisibilityBadge({
  visibility,
  className,
}: {
  visibility: RepositoryVisibility;
  className?: string;
}) {
  const { label, icon: Icon, className: variantClass } = VARIANTS[visibility];
  return (
    <Badge variant="outline" className={cn(variantClass, className)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
