"use client";

import React from "react";
import {
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export interface RfidPieceData {
  id: string;
  epcTag: string;
  serialNumber: string;
  itemName: string;
  category: string;
  metalPurity: string;
  grossWeightGrams: number;
  netGoldGrams: number;
  diamondCarat?: number;
  status: "VERIFIED" | "MISSING" | "UNREGISTERED";
  rssiDbm?: number;
  antennaPort: number;
  readCount: number;
  frequencyMhz: number;
  phaseAngleDeg: number;
  expectedLocation: string;
  lastScannedAt: string;
}

interface RfidTagCardProps {
  item: RfidPieceData;
  isSelected?: boolean;
  onSelect?: (item: RfidPieceData) => void;
}

export function RfidTagCard({
  item,
  isSelected = false,
  onSelect,
}: RfidTagCardProps) {
  const isMissing = item.status === "MISSING";

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold shadow-[0_0_18px_rgba(212,175,55,0.22)]"
          : isMissing
            ? "bg-rose-950/15 border border-rose-500/30 hover:border-rose-500/60"
            : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-gold text-obsidian text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
          Selected
        </div>
      )}

      {/* Top Header: EPC Tag & Presence Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="flex items-center space-x-1.5 min-w-0">
            <Radio
              className={`w-3.5 h-3.5 shrink-0 ${
                isMissing
                  ? "text-rose-600 dark:text-rose-400"
                  : isSelected
                    ? "text-gold animate-pulse"
                    : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors truncate ${
                isSelected
                  ? "text-gold"
                  : isMissing
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-foreground group-hover:text-gold"
              }`}
              title={item.epcTag}
            >
              {item.epcTag}
            </span>
          </div>
          <div
            className="text-[11px] text-muted-foreground font-medium truncate mt-1"
            title={item.itemName}
          >
            {item.itemName}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
            SKU: {item.serialNumber}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            item.status === "VERIFIED"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
              : item.status === "MISSING"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 animate-pulse font-semibold"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          {item.status === "VERIFIED" ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>VERIFIED</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>MISSING</span>
            </>
          )}
        </span>
      </div>

      {/* Middle Specs */}
      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[9px] block uppercase">
            Purity / Gross
          </span>
          <span className="text-foreground font-semibold tabular-nums">
            {item.grossWeightGrams.toFixed(3)}g
          </span>
          <span className="text-muted-foreground text-[10px] ml-1">
            ({item.metalPurity.split(" ")[0]})
          </span>
        </div>

        <div className="text-right">
          <span className="text-muted-foreground text-[9px] block uppercase">
            Net Gold / Stone
          </span>
          <span className="text-foreground font-semibold tabular-nums">
            {item.netGoldGrams.toFixed(3)}g
          </span>
          {item.diamondCarat && (
            <span className="text-gold text-[10px] ml-1 font-semibold">
              • {item.diamondCarat}ct
            </span>
          )}
        </div>
      </div>

      {/* Footer: RF Telemetry & Signal Strength */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center space-x-1">
          {isMissing ? (
            <WifiOff className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          ) : (
            <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          )}
          <span
            className={
              isMissing
                ? "text-rose-700 dark:text-rose-400 font-semibold"
                : "text-emerald-700 dark:text-emerald-400 font-medium"
            }
          >
            {isMissing ? "No Response" : `${item.rssiDbm} dBm`}
          </span>
        </div>

        <span className="text-muted-foreground">Ant #{item.antennaPort}</span>
      </div>
    </div>
  );
}
