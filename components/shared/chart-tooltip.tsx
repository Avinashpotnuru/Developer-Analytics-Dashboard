export type ChartValue = number | string;

export interface ChartTooltipEntry {
  name?: string;
  value?: ChartValue;
  color?: string;
  dataKey?: string | number;
}

export interface ChartTooltipProps {
  active?: boolean;
  label?: ChartValue;
  payload?: ChartTooltipEntry[];
  formatter?: (value: ChartValue, name: string) => string;
}

export function ChartTooltip({
  active,
  label,
  payload,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="min-w-32 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      {label !== undefined && label !== "" ? (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const name = entry.name ?? entry.dataKey ?? "";
          const raw = entry.value ?? 0;
          const display = formatter ? formatter(raw, String(name)) : String(raw);
          return (
            <div
              key={`${name}-${index}`}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {entry.color ? (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden
                  />
                ) : null}
                {name}
              </span>
              <span className="font-medium tabular-nums">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
