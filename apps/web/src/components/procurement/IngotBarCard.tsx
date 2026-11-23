"use client";

import React from "react";
import { Boxes, CheckCircle2, ShieldCheck } from "lucide-react";

export interface IngotBarItem {
  id: string;
  barCode: string;
  materialType: string;
  fineness: string;
  grossWeightGrams: number;
  invoiceWeightGrams: number;
  varianceGrams: number;
  variancePercent: number;
  toleranceStatus: "TOLERANCE_OK" | "WARNING" | "OVER_TOLERANCE";
  status: "QUARANTINED" | "ASSAY_VERIFIED" | "IN_TRANSIT";
  containmentPath: string;
  lastUpdated: string;
}

interface IngotBarCardProps {
  ingot: IngotBarItem;
  isSelected?: boolean;
  onSelect?: (ingot: IngotBarItem) => void;
}

export function IngotBarCard({
  ingot,
  isSelected = false,
  onSelect,
}: IngotBarCardProps) {
  const {
    barCode,
    materialType,
    grossWeightGrams,
    varianceGrams,
    variancePercent,
    toleranceStatus,
    status,
  } = ingot;

  return (
    <div
      onClick={() => onSelect?.(ingot)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-colors duration-150 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold rounded-l-xl" />
      )}

      {/* Top Header: Bar Code & Tolerance Pill */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <span
            className={`font-mono text-xs font-bold transition-colors ${
              isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
            }`}
          >
            {barCode}
          </span>
          <div className="text-[10px] font-mono uppercase text-muted-foreground mt-0.5">
            {materialType}
          </div>
        </div>

        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
            toleranceStatus === "TOLERANCE_OK"
              ? "bg-status-emerald/10 text-status-emerald border border-status-emerald/30"
              : "bg-status-amber/10 text-status-amber border border-status-amber/30"
          }`}
        >
          {toleranceStatus === "TOLERANCE_OK"
            ? "Tolerance OK"
            : "Variance Alert"}
        </span>
      </div>

      {/* Center Gravimetric Weight Box */}
      <div className="my-3 py-2 px-2.5 bg-surface-elevated border border-surface-border/60 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-foreground tabular-nums">
              {grossWeightGrams.toFixed(3)} g
            </div>
            <div className="text-[10px] font-mono text-status-emerald font-medium">
              {varianceGrams >= 0
                ? `+${varianceGrams.toFixed(3)}g`
                : `${varianceGrams.toFixed(3)}g`}{" "}
              (
              {variancePercent >= 0
                ? `+${variancePercent.toFixed(3)}%`
                : `${variancePercent.toFixed(3)}%`}
              )
            </div>
          </div>
        </div>
        <CheckCircle2 className="w-4 h-4 text-status-emerald" />
      </div>

      {/* Bottom Purity Progress Bar */}
      <div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>Purity Assay</span>
          <span className="text-gold font-semibold">100.0% Pure (24K)</span>
        </div>
        <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden border border-surface-border/50">
          <div className="bg-gold h-full rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}
