"use client";

import React from "react";
import type { CompartmentWithOccupancy } from "@jewelcore/shared";
import { Badge } from "@/components/ui/badge";

interface CompartmentCardProps {
  compartment: CompartmentWithOccupancy;
  isSelected?: boolean;
  onSelect?: (compartment: CompartmentWithOccupancy) => void;
}

export function CompartmentCard({
  compartment,
  isSelected = false,
  onSelect,
}: CompartmentCardProps) {
  const {
    code,
    name,
    compartmentNumber,
    maxItemCapacity,
    maxWeightCapacityGrams,
    occupiedItemCount,
    occupancyPercentage,
    status,
    id,
  } = compartment;

  const percentage = occupancyPercentage ?? 0;
  const isVacant = occupiedItemCount === 0;

  let badgeVariant: "emerald" | "amber" | "rose" | "secondary" = "emerald";
  let barColorClass = "bg-status-emerald";
  let statusLabel = "Available";

  if (status === "FULL" || percentage >= 100) {
    badgeVariant = "rose";
    barColorClass = "bg-status-rose";
    statusLabel = "Full";
  } else if (status === "NEAR_CAPACITY" || percentage >= 85) {
    badgeVariant = "amber";
    barColorClass = "bg-status-amber";
    statusLabel = `${percentage}% Alert`;
  } else if (isVacant) {
    badgeVariant = "secondary";
    barColorClass = "bg-muted";
    statusLabel = "Vacant";
  }

  return (
    <div
      data-testid={`compartment-card-${code}`}
      onClick={() => onSelect?.(compartment)}
      className={`group relative p-3 rounded-lg cursor-pointer transition-colors duration-150 select-none ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold border-l-4 border-l-gold"
          : isVacant
            ? "bg-surface/50 border border-dashed border-surface-border hover:border-gold/40 hover:bg-surface"
            : "bg-surface border border-surface-border hover:border-gold/50 hover:bg-surface-elevated"
      }`}
    >

      {/* Top Header Row: Code & Status */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
          <span
            className={`font-mono text-xs font-semibold truncate transition-colors ${
              isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
            }`}
            title={code}
          >
            {code}
          </span>
          {compartmentNumber && (
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              #{compartmentNumber}
            </span>
          )}
        </div>

        <Badge variant={badgeVariant} size="sm" className="shrink-0 text-[10px]">
          {statusLabel}
        </Badge>
      </div>

      {/* Compartment Name / Purpose */}
      <div className="text-[11px] text-muted-foreground truncate mt-1">
        {name}
      </div>

      {/* Occupancy Progress & Count */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1">
          <span>Occupancy:</span>
          <span
            data-testid="occupancy-count"
            className="font-medium text-foreground"
          >
            {occupiedItemCount}{" "}
            {maxItemCapacity ? `/ ${maxItemCapacity} pcs` : "pcs"}
            {percentage > 0 ? ` (${percentage}%)` : ""}
          </span>
        </div>

        {maxItemCapacity && (
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden border border-surface-border/50">
            <div
              data-testid="occupancy-progress-bar"
              style={{ width: `${Math.min(percentage, 100)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
            />
          </div>
        )}
      </div>

      {/* Bottom Sub-info / Metrological Rating */}
      <div className="mt-2.5 pt-2 border-t border-surface-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>
          {maxWeightCapacityGrams
            ? `Max: ${maxWeightCapacityGrams}g`
            : "Standard"}
        </span>
        <a
          href={`/inventory?compartmentId=${id}`}
          data-testid="resident-items-link"
          onClick={(e) => e.stopPropagation()}
          className="text-gold hover:underline transition-colors"
        >
          View Items →
        </a>
      </div>
    </div>
  );
}
