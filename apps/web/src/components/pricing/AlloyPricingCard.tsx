"use client";

import React from "react";
import {
  TrendingUp,
  Scale,
  CheckCircle2,
  ShieldCheck,
  Activity,
  AlertCircle,
} from "lucide-react";

export interface AlloyRuleData {
  id: string;
  alloyName: string;
  karatTag: string;
  finenessPurity: string;
  spotPricePerGram: number;
  makingChargePercent: number;
  makingChargeFixedPerGram: number;
  wastagePercent: number;
  calculatedRetailPerGram: number;
  status: "LOCKED" | "ACTIVE" | "PENDING_FIX";
  volatilityIndexPercent: number;
  hedgingCoverPercent: number;
  targetTerminalsCount: number;
  lastUpdated: string;
}

interface AlloyPricingCardProps {
  alloy: AlloyRuleData;
  isSelected?: boolean;
  onSelect?: (alloy: AlloyRuleData) => void;
}

export function AlloyPricingCard({
  alloy,
  isSelected = false,
  onSelect,
}: AlloyPricingCardProps) {
  const isLocked = alloy.status === "LOCKED";

  return (
    <div
      onClick={() => onSelect?.(alloy)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-colors duration-150 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated ring-1 ring-gold border border-gold"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-gold text-obsidian text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded shadow-xs">
          Selected
        </div>
      )}

      {/* Top Header: Alloy Name & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="flex items-center space-x-1.5 min-w-0">
            <Scale
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected ? "text-gold" : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors truncate ${
                isSelected
                  ? "text-gold"
                  : "text-foreground group-hover:text-gold"
              }`}
              title={alloy.alloyName}
            >
              {alloy.alloyName}
            </span>
          </div>
          <div
            className="text-[11px] text-muted-foreground font-medium truncate mt-0.5"
            title={alloy.finenessPurity}
          >
            {alloy.finenessPurity}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isLocked
              ? "bg-status-emerald/10 text-status-emerald border border-status-emerald/30"
              : "bg-status-amber/10 text-status-amber border border-status-amber/30"
          }`}
        >
          {isLocked ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>LOCKED</span>
            </>
          ) : (
            <>
              <Activity className="w-2.5 h-2.5" />
              <span>ACTIVE</span>
            </>
          )}
        </span>
      </div>

      {/* Price Grid */}
      <div className="my-2.5 py-2 border-y border-surface-border/60 space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[10px]">
            Spot Base Fix:
          </span>
          <span className="text-foreground font-bold tabular-nums">
            ₹ {alloy.spotPricePerGram.toFixed(2)} / g
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[10px]">
            Making Charge:
          </span>
          <span className="text-gold font-semibold tabular-nums">
            {alloy.makingChargePercent > 0
              ? `${alloy.makingChargePercent.toFixed(1)}% Base`
              : `₹ ${alloy.makingChargeFixedPerGram.toFixed(2)}/g`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[10px]">
            Wastage Tolerance:
          </span>
          <span className="text-foreground font-medium tabular-nums">
            {alloy.wastagePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Footer: Consumer Retail Rate */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-muted-foreground text-[9px] uppercase">
          Retail Benchmark:
        </span>
        <span className="text-status-emerald font-bold text-xs tabular-nums">
          ₹ {alloy.calculatedRetailPerGram.toFixed(2)} / g
        </span>
      </div>
    </div>
  );
}
