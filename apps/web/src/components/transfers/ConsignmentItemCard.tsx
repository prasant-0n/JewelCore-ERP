"use client";

import React from "react";
import {
  Truck,
  ShieldCheck,
  Lock,
  Radio,
  CheckCircle2,
  Box,
} from "lucide-react";

export interface ConsignmentItemData {
  id: string;
  transferOrderId?: string;
  transferManifestId?: string;
  itemCode: string;
  trayDescription: string;
  category: string;
  pieceCount: number;
  grossWeightGrams: number;
  netGoldGrams: number;
  specieValuationInr: number;
  electronicSealId: string;
  status: "GEOFENCE_LOCKED" | "EN_ROUTE" | "DE_SEALED" | "TAMPER_ALERT";
  securityTier: string;
}

interface ConsignmentItemCardProps {
  item: ConsignmentItemData;
  isSelected?: boolean;
  onSelect?: (item: ConsignmentItemData) => void;
}

export function ConsignmentItemCard({
  item,
  isSelected = false,
  onSelect,
}: ConsignmentItemCardProps) {
  const isLocked =
    item.status === "GEOFENCE_LOCKED" || item.status === "EN_ROUTE";

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-colors duration-150 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold border-l-4 border-l-gold"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {/* Top Header: Code & Seal Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="flex items-center space-x-1.5 min-w-0">
            <Lock
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected
                  ? "text-gold"
                  : "text-status-emerald"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors truncate ${
                isSelected
                  ? "text-gold"
                  : "text-foreground group-hover:text-gold"
              }`}
              title={item.itemCode}
            >
              {item.itemCode}
            </span>
          </div>
          <div
            className="text-[11px] text-muted-foreground font-medium truncate mt-0.5"
            title={item.trayDescription}
          >
            {item.trayDescription}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
            Seal: {item.electronicSealId}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isLocked
              ? "bg-status-emerald/10 text-status-emerald border border-status-emerald/30"
              : "bg-surface-elevated text-muted-foreground border border-surface-border"
          }`}
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>
            {item.status === "GEOFENCE_LOCKED" ? "GEOFENCE LOCKED" : "EN ROUTE"}
          </span>
        </span>
      </div>

      {/* Middle Specs Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[9px] block uppercase">
            Weight / Count
          </span>
          <span className="text-foreground font-semibold tabular-nums">
            {item.grossWeightGrams.toFixed(3)}g Gross
          </span>
          <span className="text-gold text-[10px] block tabular-nums">
            {item.pieceCount} Pieces Sealed
          </span>
        </div>

        <div className="text-right">
          <span className="text-muted-foreground text-[9px] block uppercase">
            Net Au / Tier
          </span>
          <span className="text-status-emerald font-semibold tabular-nums">
            {item.netGoldGrams.toFixed(3)}g Au
          </span>
          <span className="text-muted-foreground text-[10px] block">
            {item.securityTier}
          </span>
        </div>
      </div>

      {/* Footer: Specie Valuation */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-muted-foreground text-[9px] uppercase">
          Specie Cover:
        </span>
        <span className="text-status-emerald font-bold text-xs tabular-nums">
          ₹ {item.specieValuationInr.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
