"use client";

import React, { useState } from "react";
import { ScrapItemCard, ScrapPieceData } from "./ScrapItemCard";
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Scale,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface ScrapBatchGroupData {
  id: string;
  batchNumber: string;
  batchTitle: string;
  sourceTag: string;
  clientOrSource: string;
  status: "XRF_ASSAYED" | "SMELT_QUEUED" | "REFINED" | "QUARANTINED";
  items: ScrapPieceData[];
}

interface ScrapBatchSectionProps {
  batch: ScrapBatchGroupData;
  selectedItemId?: string;
  onSelectItem?: (item: ScrapPieceData, batch: ScrapBatchGroupData) => void;
  defaultExpanded?: boolean;
}

export function ScrapBatchSection({
  batch,
  selectedItemId,
  onSelectItem,
  defaultExpanded = false,
}: ScrapBatchSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const totalGrossWeight = batch.items.reduce(
    (acc, itm) => acc + (itm.grossWeightGrams || 0),
    0,
  );
  const totalValuation = batch.items.reduce(
    (acc, itm) => acc + (itm.calculatedValuationInr ?? itm.payoutValueInr ?? 0),
    0,
  );

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Batch Header Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-surface-elevated/70 hover:bg-surface-elevated border-b border-surface-border flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-gold">
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-foreground font-mono tracking-tight">
                {batch.batchTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                {batch.sourceTag}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{batch.items.length} Items Listed</span>
              <span>•</span>
              <span className="text-foreground font-bold tabular-nums">
                {totalGrossWeight.toFixed(3)} g Gross
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                ₹ {totalValuation.toLocaleString("en-IN")} Valuation
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                XRF Assayed
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            {batch.clientOrSource}
          </span>
        </div>
      </div>

      {/* Expanded Scrap Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              Lot Items for Crucible Smelting ({batch.items.length} Units)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Niton XL5 Multi-Spot Assayed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {batch.items.map((item) => (
              <ScrapItemCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={(itm) => onSelectItem?.(itm, batch)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
