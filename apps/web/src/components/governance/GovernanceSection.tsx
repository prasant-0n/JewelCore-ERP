"use client";

import React, { useState } from "react";
import { GovernanceItemCard, GovernanceItemData } from "./GovernanceItemCard";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  Lock,
  Clock,
} from "lucide-react";

export interface GovernanceBatchGroupData {
  id: string;
  batchNumber: string;
  batchTitle: string;
  vaultSafeTag: string;
  thresholdCategory: string;
  status: "QUORUM_PENDING" | "FULLY_APPROVED" | "AUDIT_ARCHIVED";
  items: GovernanceItemData[];
}

interface GovernanceSectionProps {
  batch: GovernanceBatchGroupData;
  selectedItemId?: string;
  onSelectItem?: (
    item: GovernanceItemData,
    batch: GovernanceBatchGroupData,
  ) => void;
  defaultExpanded?: boolean;
}

export function GovernanceSection({
  batch,
  selectedItemId,
  onSelectItem,
  defaultExpanded = false,
}: GovernanceSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const totalValuation = batch.items.reduce(
    (acc, itm) => acc + (itm.valuationInr || 0),
    0,
  );
  const totalGrossWeight = batch.items.reduce(
    (acc, itm) => acc + (itm.grossWeightGrams || 0),
    0,
  );
  const pendingCount = batch.items.filter(
    (i) => i.status === "AWAITING_SECOND_KEY",
  ).length;

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
                {batch.vaultSafeTag}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{batch.items.length} Approvals Queued</span>
              <span>•</span>
              <span className="text-foreground font-bold tabular-nums">
                {totalGrossWeight.toFixed(3)} g Load
              </span>
              <span>•</span>
              <span className="text-status-emerald font-bold tabular-nums">
                ₹ {totalValuation.toLocaleString("en-IN")} Total Val
              </span>
              <span>•</span>
              <span
                className={`flex items-center gap-1 font-medium ${
                  pendingCount > 0
                    ? "text-status-amber"
                    : "text-status-emerald"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pendingCount > 0
                      ? "bg-status-amber"
                      : "bg-status-emerald"
                  }`}
                />
                {pendingCount > 0
                  ? `${pendingCount} Awaiting 2nd Key`
                  : "Quorum Reached"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              pendingCount > 0
                ? "bg-status-amber/15 text-status-amber border-status-amber/30 font-semibold"
                : "bg-status-emerald/10 text-status-emerald border border-status-emerald/30"
            }`}
          >
            {batch.thresholdCategory}
          </span>
        </div>
      </div>

      {/* Expanded Action Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground text-xs font-medium">
              Dual-Sign Custody Queue ({batch.items.length} High-Value Requests)
            </span>
            <span className="text-status-emerald text-xs flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
              HSM v4.2.8 Cryptographic Keystore Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5">
            {batch.items.map((item) => (
              <GovernanceItemCard
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
