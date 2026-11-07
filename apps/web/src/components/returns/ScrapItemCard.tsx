"use client";

import React from "react";
import { Flame, Scale, CheckCircle2, FlaskConical, Gem } from "lucide-react";

export interface ScrapPieceData {
  id: string;
  itemCode: string;
  customerName?: string;
  customerPan?: string;
  itemDescription?: string;
  description?: string;
  category?: string;
  grossWeightGrams: number;
  stoneWeightDeductionGrams?: number;
  netGoldWeightGrams?: number;
  netGoldGrams?: number;
  extractedStoneCarats?: number;
  assayedPurityPercent?: number;
  assayedFinenessPercent?: number;
  karatString?: string;
  hydrostaticSpecificGravity?: number;
  specificGravity?: number;
  spotGoldRatePerGram?: number;
  meltLossDeductionPercent?: number;
  calculatedValuationInr?: number;
  payoutValueInr?: number;
  status: "VALUATED" | "ASSAY_PASSED" | "STONES_EXTRACTED" | "SMELT_QUEUED" | "REFINED";
  containmentBucket?: string;
  receivedAt?: string;
  alloyClassification?: string;
}

interface ScrapItemCardProps {
  item: ScrapPieceData;
  isSelected?: boolean;
  onSelect?: (item: ScrapPieceData) => void;
}

export function ScrapItemCard({
  item,
  isSelected = false,
  onSelect,
}: ScrapItemCardProps) {
  const isPassed = item.status === "ASSAY_PASSED" || item.status === "VALUATED";
  const desc = item.itemDescription || item.description || "Scrap Gold Lot";
  const netAu = item.netGoldWeightGrams ?? item.netGoldGrams ?? item.grossWeightGrams;
  const purity = item.assayedPurityPercent ?? item.assayedFinenessPercent ?? 91.6;
  const sg = item.hydrostaticSpecificGravity ?? item.specificGravity ?? 17.5;
  const val = item.calculatedValuationInr ?? item.payoutValueInr ?? 0;
  const alloy = item.karatString || item.alloyClassification || "22K Scrap";
  const hasStones = (item.extractedStoneCarats ?? (item.stoneWeightDeductionGrams ? 1 : 0)) > 0;

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

      {/* Top Header: Item Code & Status */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <Flame
              className={`w-3.5 h-3.5 ${
                isSelected ? "text-gold" : "text-amber-700 dark:text-amber-400"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors ${
                isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
              }`}
            >
              {item.itemCode}
            </span>
          </div>
          <div className="text-[11px] text-foreground/80 font-medium truncate max-w-[190px] mt-0.5">
            {desc}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
            {alloy} • {item.containmentBucket || "Vault Bucket"}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isPassed
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
          }`}
        >
          {isPassed ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>ASSAY PASSED</span>
            </>
          ) : (
            <>
              <Gem className="w-2.5 h-2.5" />
              <span>SMELT QUEUED</span>
            </>
          )}
        </span>
      </div>

      {/* Middle Specs Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[9px] block uppercase">Weight / Net Au</span>
          <span className="text-foreground font-semibold tabular-nums">
            {item.grossWeightGrams.toFixed(3)}g Gross
          </span>
          <span className="text-gold text-[10px] block tabular-nums">
            {netAu.toFixed(3)}g Pure Au
          </span>
        </div>

        <div className="text-right">
          <span className="text-muted-foreground text-[9px] block uppercase">Purity / SG</span>
          <span className="text-emerald-500 font-semibold tabular-nums">
            {purity.toFixed(2)}% Au
          </span>
          <span className="text-muted-foreground text-[10px] block tabular-nums">
            SG {sg.toFixed(2)} g/cm³
          </span>
        </div>
      </div>

      {/* Footer: Valuation */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-muted-foreground text-[9px] uppercase">Assayed Payout:</span>
        <span className="text-emerald-500 font-bold text-xs tabular-nums">
          ₹ {val.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
