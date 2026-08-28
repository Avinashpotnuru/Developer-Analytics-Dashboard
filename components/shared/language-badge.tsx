import { cn } from "@/lib/utils";
import { LANGUAGE_COLORS } from "@/lib/format";
import type { ProgrammingLanguage } from "@/lib/types";

export function LanguageBadge({
  language,
  className,
}: {
  language: ProgrammingLanguage;
  className?: string;
}) {
  const color = LANGUAGE_COLORS[language];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {language}
    </span>
  );
}
