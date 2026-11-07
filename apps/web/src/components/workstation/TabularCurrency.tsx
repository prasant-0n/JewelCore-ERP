import * as React from "react";
import { cn } from "@/lib/utils";

interface TabularCurrencyProps {
  amount: number | string | null | undefined;
  currency?: string;
  className?: string;
  decimals?: number;
}

export function TabularCurrency({
  amount,
  currency = "₹",
  className,
  decimals = 0,
}: TabularCurrencyProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (num === null || num === undefined || isNaN(num)) {
    return (
      <span className={cn("font-mono text-muted-foreground", className)}>
        —
      </span>
    );
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  return (
    <span
      className={cn(
        "font-mono tabular-nums tracking-tight font-medium inline-flex items-center",
        className,
      )}
    >
      <span className="text-muted-foreground mr-0.5">{currency}</span>
      <span>{formatted}</span>
    </span>
  );
}
