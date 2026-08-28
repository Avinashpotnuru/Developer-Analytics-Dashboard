import { cn } from "@/lib/utils";
import { getLanguageColor } from "@/lib/format";

export function LanguageBadge({
  language,
  className,
}: {
  language: string;
  className?: string;
}) {
  const color = getLanguageColor(language);
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
