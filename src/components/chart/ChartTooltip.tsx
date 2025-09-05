import React from "react";
import { cn } from "@/lib/utils";

type Row = { label: string; value: string | number };

export function ChartTooltip({
  title,
  rows,
  className,
}: {
  title?: string;
  rows: Row[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md px-3 py-2 min-w-[220px] max-w-[320px]",
        "bg-popover/90 text-popover-foreground",
        "border border-border/60 shadow-lg shadow-black/20",
        "backdrop-blur-sm",
        className
      )}
      role="tooltip"
    >
      {title ? (
        <div className="text-xs mb-1 text-muted-foreground">{title}</div>
      ) : null}
      <div className="space-y-0.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-medium tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartTooltip;

