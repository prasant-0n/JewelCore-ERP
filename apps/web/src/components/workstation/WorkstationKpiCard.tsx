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

export function WorkstationKpiCard({ item, className }: WorkstationKpiCardProps) {
  return (
    <Card className={cn("overflow-hidden hover:border-surface-border/80 transition-all", className)}>
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground truncate">
            {item.title}
          </span>
          {item.icon && (
            <div className="w-6 h-6 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-center text-muted-foreground shrink-0">
              {item.icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums truncate">
            {item.value}
          </div>
          {item.badge && (
            <Badge
              variant={item.badge.variant || "secondary"}
              size="sm"
              className="shrink-0"
            >
              {item.badge.text}
            </Badge>
          )}
        </div>

        {item.subValue && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate font-mono">
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
        className
      )}
    >
      {items.map((item) => (
        <WorkstationKpiCard key={item.id} item={item} />
      ))}
    </div>
  );
}
