"use client";

import React from "react";
import { Gem, CheckCircle2, ShieldCheck } from "lucide-react";
import { TactileCard } from "@/components/luxury/TactileCard";
import { LaserHallmarkBadge } from "@/components/luxury/LaserHallmarkBadge";

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
    <TactileCard
      isSelected={isSelected}
      onClick={() => onSelect?.(piece)}
      className="p-3.5 flex flex-col justify-between"
    >
      {/* Top Header: Serial & Custody State Pill */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1.5">
          <span
            className={`font-mono text-xs font-bold transition-colors block truncate ${
              isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
            }`}
            title={serialNumber}
          >
            {serialNumber}
          </span>
          <div
            className="text-[11px] text-muted-foreground font-medium truncate mt-0.5"
            title={itemName}
          >
            {itemName}
          </div>
          <div className="mt-1">
            <LaserHallmarkBadge
              huid={piece.giaCertNumber || serialNumber.slice(-6)}
              purity={metalPurity}
              isBisVerified={qualityState === "HALLMARKED"}
            />
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            custodyState === "VAULT"
              ? "bg-status-emerald/15 text-status-emerald border border-status-emerald/30"
              : custodyState === "DISPLAY"
                ? "bg-status-indigo/15 text-status-indigo border border-status-indigo/30"
                : custodyState === "TRANSIT"
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "bg-status-amber/15 text-status-amber border border-status-amber/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              custodyState === "VAULT"
                ? "bg-status-emerald"
                : custodyState === "DISPLAY"
                  ? "bg-status-indigo"
                  : "bg-gold"
            }`}
          />
          {custodyState}
        </span>
      </div>

      {/* Center Metrology & Stone Reading Box */}
      <div className="my-2.5 py-2 px-2.5 bg-surface-elevated/80 border border-surface-border/60 rounded-lg flex items-center justify-between">
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
        <CheckCircle2 className="w-4 h-4 text-status-emerald" />
      </div>

      {/* Bottom Purity / Hallmarking Progress */}
      <div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>{metalPurity}</span>
          <span className="text-gold font-semibold flex items-center gap-1">
            {qualityState === "HALLMARKED" ? (
              <>
                <ShieldCheck className="w-3 h-3 text-status-emerald" />
                <span>IS 1417 Hallmarked</span>
              </>
            ) : (
              <span>QC Inspection Pending</span>
            )}
          </span>
        </div>
        <div className="w-full bg-surface-elevated h-1 rounded-full overflow-hidden border border-surface-border/40">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              qualityState === "HALLMARKED"
                ? "bg-emerald-500 w-full"
                : "bg-amber-500 w-1/2"
            }`}
          />
        </div>
      </div>
    </TactileCard>
  );
}
