"use client";

import React from "react";
import { Truck, ShieldCheck, Lock, Radio, CheckCircle2, Box } from "lucide-react";

export interface ConsignmentItemData {
  id: string;
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
  const isLocked = item.status === "GEOFENCE_LOCKED" || item.status === "EN_ROUTE";

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

      {/* Top Header: Code & Seal Status */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <Lock
              className={`w-3.5 h-3.5 ${
                isSelected ? "text-gold" : "text-emerald-400"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors ${
                isSelected ? "text-gold" : "text-slate-100 group-hover:text-gold"
              }`}
            >
              {item.itemCode}
            </span>
          </div>
          <div className="text-[11px] text-platinum/80 font-medium truncate max-w-[190px] mt-0.5">
            {item.trayDescription}
          </div>
          <div className="text-[10px] font-mono text-platinum/60 mt-0.5">
            Seal: {item.electronicSealId}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isLocked
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-surface-border text-platinum/70 border border-surface-border"
          }`}
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>{item.status === "GEOFENCE_LOCKED" ? "GEOFENCE LOCKED" : "EN ROUTE"}</span>
        </span>
      </div>

      {/* Middle Specs Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-platinum/60 text-[9px] block uppercase">Weight / Count</span>
          <span className="text-slate-200 font-semibold tabular-nums">
            {item.grossWeightGrams.toFixed(3)}g Gross
          </span>
          <span className="text-gold text-[10px] block tabular-nums">
            {item.pieceCount} Pieces Sealed
          </span>
        </div>

        <div className="text-right">
          <span className="text-platinum/60 text-[9px] block uppercase">Net Au / Tier</span>
          <span className="text-emerald-400 font-semibold tabular-nums">
            {item.netGoldGrams.toFixed(3)}g Au
          </span>
          <span className="text-platinum/60 text-[10px] block">
            {item.securityTier}
          </span>
        </div>
      </div>

      {/* Footer: Specie Valuation */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-platinum/60 text-[9px] uppercase">Specie Cover:</span>
        <span className="text-emerald-400 font-bold text-xs tabular-nums">
          ₹ {item.specieValuationInr.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
