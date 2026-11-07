"use client";

import React from "react";
import { Microscope, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export interface QcItemData {
  id: string;
  itemCode: string;
  parentPieceSerial: string;
  materialDescription: string;
  grossWeightGrams: number;
  hydrostaticWeightGrams: number;
  specificGravity: number;
  standardGrossWeightGrams: number;
  varianceGrams: number;
  variancePercent: number;
  purityPercent: number;
  finenessString: string;
  elements: { au: number; ag: number; cu: number; pt?: number };
  toleranceStatus: "TOLERANCE_OK" | "WARNING" | "OVER_TOLERANCE";
  status: "UNDER_INSPECTION" | "PASSED" | "QUARANTINED";
  destinationPath: string;
}

interface QcItemCardProps {
  item: QcItemData;
  isSelected?: boolean;
  onSelect?: (item: QcItemData) => void;
}

export function QcItemCard({
  item,
  isSelected = false,
  onSelect,
}: QcItemCardProps) {
  const {
    itemCode,
    parentPieceSerial,
    materialDescription,
    grossWeightGrams,
    varianceGrams,
    variancePercent,
    purityPercent,
    toleranceStatus,
    status,
  } = item;

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold shadow-[0_0_18px_rgba(212,175,55,0.22)]"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-gold text-obsidian text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
          Selected
        </div>
      )}

      {/* Top Header: Code & Tolerance Pill */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-mono text-xs font-bold transition-colors ${
                isSelected ? "text-gold" : "text-slate-100 group-hover:text-gold"
              }`}
            >
              {itemCode}
            </span>
            <span className="text-[10px] font-mono text-platinum/50">
              ({parentPieceSerial})
            </span>
          </div>
          <div className="text-[10px] font-mono uppercase text-platinum/60 mt-0.5">
            {materialDescription}
          </div>
        </div>

        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
            toleranceStatus === "TOLERANCE_OK"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {toleranceStatus === "TOLERANCE_OK" ? "Tolerance OK" : "Variance Alert"}
        </span>
      </div>

      {/* Center Gravimetric Weight Reading Box */}
      <div className="my-3 py-2 px-2.5 bg-obsidian-deep/80 border border-surface-border/60 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Microscope className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-slate-100 tabular-nums">
              {grossWeightGrams.toFixed(3)} g
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              {varianceGrams >= 0 ? `+${varianceGrams.toFixed(3)}g` : `${varianceGrams.toFixed(3)}g`}{" "}
              ({variancePercent >= 0 ? `+${variancePercent.toFixed(3)}%` : `${variancePercent.toFixed(3)}%`})
            </div>
          </div>
        </div>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>

      {/* Bottom Purity Progress Bar */}
      <div>
        <div className="flex justify-between text-[10px] font-mono text-platinum/70 mb-1">
          <span>XRF Fineness</span>
          <span className="text-gold-light font-semibold">
            {purityPercent.toFixed(2)}% Au ({item.finenessString})
          </span>
        </div>
        <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden border border-surface-border/50">
          <div
            style={{ width: `${Math.min(purityPercent, 100)}%` }}
            className="bg-gold h-full rounded-full transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}
