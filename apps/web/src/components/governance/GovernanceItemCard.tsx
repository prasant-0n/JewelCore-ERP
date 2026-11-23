"use client";

import React from "react";
import { KeyRound, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export interface GovernanceItemData {
  id: string;
  requestCode: string;
  actionTitle: string;
  category: string;
  grossWeightGrams: number;
  valuationInr: number;
  keyholder1Name: string;
  keyholder1SignedAt: string;
  keyholder2Name: string;
  keyholder2Status: "PENDING_KEY" | "SIGNED" | "REJECTED";
  status: "AWAITING_SECOND_KEY" | "DUAL_SIGNED_RELEASED" | "REJECTED_LOCKED";
  targetVaultLocation: string;
  merkleProofHash: string;
}

interface GovernanceItemCardProps {
  item: GovernanceItemData;
  isSelected?: boolean;
  onSelect?: (item: GovernanceItemData) => void;
}

export function GovernanceItemCard({
  item,
  isSelected = false,
  onSelect,
}: GovernanceItemCardProps) {
  const isPending = item.status === "AWAITING_SECOND_KEY";
  const isReleased = item.status === "DUAL_SIGNED_RELEASED";

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-colors duration-150 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold border-l-4 border-l-gold"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {/* Top Header: Request Code & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="flex items-center space-x-1.5 min-w-0">
            <KeyRound
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected
                  ? "text-gold"
                  : isPending
                    ? "text-status-amber"
                    : "text-status-emerald"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors truncate ${
                isSelected
                  ? "text-gold"
                  : "text-foreground group-hover:text-gold"
              }`}
              title={item.requestCode}
            >
              {item.requestCode}
            </span>
          </div>
          <div
            className="text-[11px] text-muted-foreground font-medium truncate mt-0.5"
            title={item.actionTitle}
          >
            {item.actionTitle}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
            Safe: {item.targetVaultLocation}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isPending
              ? "bg-status-amber/15 text-status-amber border border-status-amber/30 font-semibold"
              : isReleased
                ? "bg-status-emerald/10 text-status-emerald border border-status-emerald/30"
                : "bg-status-rose/10 text-status-rose border border-status-rose/30"
          }`}
        >
          {isPending ? (
            <>
              <Clock className="w-2.5 h-2.5" />
              <span>2ND KEY PENDING</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>RELEASED</span>
            </>
          )}
        </span>
      </div>

      {/* Middle Specs Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[9px] block uppercase">
            Weight / Val
          </span>
          <span className="text-foreground font-semibold tabular-nums">
            {item.grossWeightGrams.toFixed(3)}g Gross
          </span>
          <span className="text-status-emerald text-[10px] block tabular-nums font-bold">
            ₹ {item.valuationInr.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="text-right">
          <span className="text-muted-foreground text-[9px] block uppercase">
            Keyholder Quorum
          </span>
          <span className="text-status-emerald font-semibold text-[10px] block">
            Key 1: {item.keyholder1Name} ✓
          </span>
          <span
            className={`text-[10px] font-semibold block ${
              item.keyholder2Status === "SIGNED"
                ? "text-status-emerald"
                : "text-status-amber"
            }`}
          >
            Key 2:{" "}
            {item.keyholder2Status === "SIGNED"
              ? `${item.keyholder2Name} ✓`
              : "Pending PIN"}
          </span>
        </div>
      </div>

      {/* Footer: Merkle Root Hash */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="uppercase text-[9px]">Merkle Proof:</span>
        <span className="text-gold font-mono truncate max-w-[150px]">
          {item.merkleProofHash}
        </span>
      </div>
    </div>
  );
}
