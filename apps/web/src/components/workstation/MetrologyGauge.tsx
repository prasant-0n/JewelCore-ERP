import * as React from "react";
import { cn } from "@/lib/utils";

interface MetrologyGaugeProps {
  label: string;
  currentValue: number;
  maxValue: number;
  unit?: string;
  decimals?: number;
  toleranceDelta?: number;
  status?: "normal" | "passing" | "warning" | "failing";
  className?: string;
  secondaryLabel?: string;
  secondaryValue?: string | number;
}

export function MetrologyGauge({
  label,
  currentValue,
  maxValue,
  unit = "g",
  decimals = 4,
  toleranceDelta,
  status = "normal",
  className,
  secondaryLabel,
  secondaryValue,
}: MetrologyGaugeProps) {
  const percentage = Math.min(
    Math.max((currentValue / (maxValue || 1)) * 100, 0),
    100,
  );

  const getBarColor = () => {
    if (status === "passing") return "bg-status-emerald";
    if (status === "failing") return "bg-status-rose";
    if (status === "warning") return "bg-status-amber";
    return "bg-gold";
  };

  return (
    <div
      className={cn(
        "space-y-1.5 p-3 rounded-lg bg-surface-elevated border border-surface-border",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {secondaryLabel && (
            <span className="text-[11px] text-muted-foreground font-mono">
              {secondaryLabel}:{" "}
              <span className="text-foreground">{secondaryValue}</span>
            </span>
          )}
          <span className="font-mono font-semibold tabular-nums text-foreground whitespace-nowrap">
            {currentValue.toFixed(decimals)}{" "}
            <span className="text-[10px] text-muted-foreground font-mono font-normal">
              {unit}
            </span>
          </span>
        </div>
      </div>

      <div className="relative h-2 w-full rounded-full bg-surface overflow-hidden border border-surface-border">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            getBarColor(),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-0.5">
        <span>0.0000 {unit}</span>
        {toleranceDelta !== undefined && (
          <span
            className={cn(
              "px-1 py-0.2 rounded font-semibold",
              Math.abs(toleranceDelta) <= 0.002
                ? "text-status-emerald"
                : "text-status-rose",
            )}
          >
            Δ{" "}
            {toleranceDelta > 0
              ? `+${toleranceDelta.toFixed(decimals)}`
              : toleranceDelta.toFixed(decimals)}{" "}
            {unit}
          </span>
        )}
        <span>
          {maxValue.toFixed(decimals)} {unit}
        </span>
      </div>
    </div>
  );
}
