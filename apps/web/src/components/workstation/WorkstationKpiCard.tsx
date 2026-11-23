import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface KpiItem {
  id: string;
  title: string;
  value: string | number;
  subValue?: string;
  badge?: {
    text: string;
    variant?: "gold" | "emerald" | "amber" | "rose" | "indigo" | "secondary";
  };
  icon?: React.ReactNode;
}

interface WorkstationKpiCardProps {
  item: KpiItem;
  className?: string;
}

export function WorkstationKpiCard({
  item,
  className,
}: WorkstationKpiCardProps) {
  const valueStr = String(item.value);
  const isLongValue = valueStr.length > 11;
  const isVeryLongValue = valueStr.length > 16;

  return (
    <Card
      className={cn(
        "overflow-hidden hover:border-surface-border/80 transition-colors duration-150",
        className,
      )}
    >
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className="text-xs font-medium text-muted-foreground truncate"
            title={item.title}
          >
            {item.title}
          </span>
          {item.icon && (
            <div className="w-6 h-6 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-center text-muted-foreground shrink-0">
              {item.icon}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-1.5">
          <div
            className={cn(
              "font-mono font-bold tracking-tight text-foreground tabular-nums min-w-0",
              isVeryLongValue
                ? "text-sm sm:text-base lg:text-lg"
                : isLongValue
                  ? "text-base sm:text-lg lg:text-xl"
                  : "text-xl sm:text-2xl",
            )}
            title={valueStr}
          >
            {item.value}
          </div>
          {item.badge && (
            <Badge
              variant={item.badge.variant || "secondary"}
              size="sm"
              className="shrink-0 text-[10px]"
            >
              {item.badge.text}
            </Badge>
          )}
        </div>

        {item.subValue && (
          <p
            className="text-[11px] text-muted-foreground mt-1 truncate font-mono tabular-nums"
            title={item.subValue}
          >
            {item.subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkstationKpiGrid({
  items,
  className,
}: {
  items: KpiItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6",
        className,
      )}
    >
      {items.map((item) => (
        <WorkstationKpiCard key={item.id} item={item} />
      ))}
    </div>
  );
}
