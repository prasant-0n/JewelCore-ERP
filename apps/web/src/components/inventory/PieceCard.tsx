"use client";

import React from "react";
import { Gem, CheckCircle2 } from "lucide-react";

export interface InventoryPieceData {
  id: string;
  serialNumber: string;
  itemName: string;
  category: string;
  metalPurity: string;
  grossWeightGrams: number;
  netGoldGrams: number;
  diamondCarat?: number;
  diamondClarity?: string;
  diamondColor?: string;
  giaCertNumber?: string;
  custodyState: "VAULT" | "DISPLAY" | "TRANSIT" | "QC";
  qualityState: "HALLMARKED" | "INSPECTION_PENDING" | "REJECTED";
  approvalState: "APPROVED" | "PENDING_APPROVAL" | "REJECTED";
  commercialState:
    "AVAILABLE_FOR_SALE" | "MEMO_LOANED" | "SOLD" | "QUARANTINED";
  priceInr: number;
  currentLocation: string;
  epcRfidTag: string;
  provenance: Array<{
    stage: string;
    timestamp: string;
    actor: string;
    detail: string;
  }>;
}

interface PieceCardProps {
  piece: InventoryPieceData;
  isSelected?: boolean;
  onSelect?: (piece: InventoryPieceData) => void;
}

export function PieceCard({
  piece,
  isSelected = false,
  onSelect,
}: PieceCardProps) {
  const {
    serialNumber,
    itemName,
    metalPurity,
    grossWeightGrams,
    netGoldGrams,
    diamondCarat,
    custodyState,
    qualityState,
  } = piece;

  return (
    <div
      onClick={() => onSelect?.(piece)}
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

      {/* Top Header: Serial & Custody State Pill */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <span
            className={`font-mono text-xs font-bold transition-colors ${
              isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
            }`}
          >
            {serialNumber}
          </span>
          <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px] mt-0.5">
            {itemName}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 ${
            custodyState === "VAULT"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
              : custodyState === "DISPLAY"
                ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30"
                : custodyState === "TRANSIT"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          <span
            className={`w-1 h-1 rounded-full ${
              custodyState === "VAULT"
                ? "bg-emerald-500"
                : custodyState === "DISPLAY"
                  ? "bg-cyan-500"
                  : custodyState === "TRANSIT"
                    ? "bg-blue-500"
                    : "bg-amber-500"
            }`}
          />
          {custodyState}
        </span>
      </div>

      {/* Center Metrology & Stone Reading Box */}
      <div className="my-3 py-2 px-2.5 bg-surface-elevated border border-surface-border/60 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Gem className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-foreground tabular-nums">
              {grossWeightGrams.toFixed(3)} g Gross
            </div>
            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 font-medium">
              <span>Au: {netGoldGrams.toFixed(3)}g</span>
              {diamondCarat && (
                <>
                  <span>•</span>
                  <span className="text-gold font-semibold">
                    {diamondCarat} ct
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Bottom Purity / Hallmarking Progress */}
      <div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>{metalPurity}</span>
          <span className="text-gold font-semibold">
            {qualityState === "HALLMARKED"
              ? "100% Purity Hallmarked"
              : "QC Pending"}
          </span>
        </div>
        <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden border border-surface-border/50">
          <div
            className={`h-full rounded-full ${
              qualityState === "HALLMARKED"
                ? "bg-emerald-500 w-full"
                : "bg-amber-500 w-1/2"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
