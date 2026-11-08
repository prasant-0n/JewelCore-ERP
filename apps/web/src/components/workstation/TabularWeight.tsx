import * as React from "react";
import { cn } from "@/lib/utils";

interface TabularWeightProps {
  grams: number | string | null | undefined;
  decimals?: number;
  unit?: string;
  className?: string;
  highlightDelta?: boolean;
  delta?: number;
}

export function TabularWeight({
  grams,
  decimals = 4,
  unit = "g",
  className,
  highlightDelta,
  delta,
}: TabularWeightProps) {
  const num = typeof grams === "string" ? parseFloat(grams) : grams;

  if (num === null || num === undefined || isNaN(num)) {
    return (
      <span className={cn("font-mono text-muted-foreground", className)}>
        —
      </span>
    );
  }

  const formatted = num.toFixed(decimals);

  return (
    <span
      className={cn(
        "font-mono tabular-nums tracking-tight font-medium inline-flex items-center gap-1",
        className,
      )}
    >
      <span>{formatted}</span>
      <span className="text-[10px] text-muted-foreground font-sans font-normal lowercase">
        {unit}
      </span>
      {highlightDelta && delta !== undefined && (
        <span
          className={cn(
            "text-[10px] px-1 rounded ml-1",
            Math.abs(delta) <= 0.002
              ? "text-status-emerald bg-status-emeraldBg"
              : "text-status-rose bg-status-roseBg",
          )}
        >
          {delta > 0 ? `+${delta.toFixed(decimals)}` : delta.toFixed(decimals)}
        </span>
      )}
    </span>
  );
}
