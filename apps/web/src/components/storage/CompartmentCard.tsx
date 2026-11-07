"use client";

import React from "react";
import type { CompartmentWithOccupancy } from "@jewelcore/shared";

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

  // Determine status chip styling
  let badgeClasses = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  let barColorClass = "bg-emerald-400";
  let statusLabel = "Available";

  if (status === "FULL" || percentage >= 100) {
    badgeClasses = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    barColorClass = "bg-rose-400";
    statusLabel = "Full";
  } else if (status === "NEAR_CAPACITY" || percentage >= 85) {
    badgeClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    barColorClass = "bg-amber-400";
    statusLabel = `${percentage}% Alert`;
  } else if (isVacant) {
    badgeClasses = "bg-slate-800 text-slate-400 border border-slate-700";
    barColorClass = "bg-slate-600";
    statusLabel = "Vacant";
  }

  return (
    <div
      data-testid={`compartment-card-${code}`}
      onClick={() => onSelect?.(compartment)}
      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 select-none ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.18)]"
          : isVacant
          ? "bg-obsidian-deep/60 border border-dashed border-surface-border hover:border-gold/40 hover:bg-surface-card"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/70"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-gold text-obsidian text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
          Selected
        </div>
      )}

      {/* Top Header Row: Code & Status */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center space-x-1.5 truncate">
          <span
            className={`font-mono text-xs font-semibold truncate transition-colors ${
              isSelected ? "text-gold" : "text-slate-100 group-hover:text-gold"
            }`}
          >
            {code}
          </span>
          {compartmentNumber && (
            <span className="text-[10px] text-platinum/50 font-mono">
              #{compartmentNumber}
            </span>
          )}
        </div>

        <span
          data-testid="status-chip"
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${badgeClasses}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Compartment Name / Purpose */}
      <div className="text-[11px] text-platinum/70 truncate mt-1">
        {name}
      </div>

      {/* Occupancy Progress & Count */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-platinum/80 mb-1">
          <span className="text-platinum/60">Occupancy:</span>
          <span data-testid="occupancy-count" className="font-medium text-slate-200">
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
      <div className="mt-2.5 pt-2 border-t border-surface-border/50 flex items-center justify-between text-[10px] font-mono text-platinum/50">
        <span>
          {maxWeightCapacityGrams ? `Max: ${maxWeightCapacityGrams}g` : "Standard"}
        </span>
        <a
          href={`/inventory?compartmentId=${id}`}
          data-testid="resident-items-link"
          onClick={(e) => e.stopPropagation()}
          className="text-gold/80 hover:text-gold hover:underline transition-colors"
        >
          View Items →
        </a>
      </div>
    </div>
  );
}
