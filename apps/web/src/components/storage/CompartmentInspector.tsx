"use client";

import React, { useState } from "react";
import type { CompartmentWithOccupancy } from "@jewelcore/shared";
import {
  ShieldCheck,
  Radio,
  Scale,
  Boxes,
  Sparkles,
  Printer,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";

interface StoredItemMock {
  serialNumber: string;
  name: string;
  purity: string;
  weightGrams: number;
  slotNumber: string;
}

const SAMPLE_STORED_ITEMS: Record<string, StoredItemMock[]> = {
  default: [
    {
      serialNumber: "JWL-2026-08912",
      name: "Solitaire Diamond Ring 1.25ct",
      purity: "18K Yellow Gold",
      weightGrams: 4.821,
      slotNumber: "Slot 1",
    },
    {
      serialNumber: "JWL-2026-08913",
      name: "Royal Heritage Kundan Choker",
      purity: "22K Gold (916)",
      weightGrams: 26.31,
      slotNumber: "Slot 2",
    },
    {
      serialNumber: "JWL-2026-08918",
      name: "Pavé Diamond Bangle",
      purity: "Pt 950",
      weightGrams: 38.4,
      slotNumber: "Slot 3",
    },
    {
      serialNumber: "JWL-2026-08922",
      name: "Colombian Emerald Earstuds",
      purity: "18K Yellow Gold",
      weightGrams: 6.15,
      slotNumber: "Slot 4",
    },
  ],
};

interface CompartmentInspectorProps {
  compartment: CompartmentWithOccupancy | null;
  parentLockerName?: string;
  parentVaultName?: string;
  onClose?: () => void;
  onAuditClick?: () => void;
  onTransferClick?: () => void;
}

export function CompartmentInspector({
  compartment,
  parentLockerName = "Locker 02: High-Jewellery Trays",
  parentVaultName = "Vault 01: Primary Bullion & Diamond Safe",
  onClose,
  onAuditClick,
  onTransferClick,
}: CompartmentInspectorProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  if (!compartment) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Boxes className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Compartment Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any compartment cell from the 3-tier hierarchy matrix to inspect its live occupancy, weight load, and stored inventory.
        </p>
      </div>
    );
  }

  const {
    code,
    name,
    compartmentNumber,
    maxItemCapacity = 20,
    maxWeightCapacityGrams = 5000,
    occupiedItemCount = 0,
    occupancyPercentage,
  } = compartment;

  const safePercentage = occupancyPercentage ?? 0;
  const currentWeightGrams = occupiedItemCount * 18.52; // realistic mock weight calculation
  const weightPercentage = Math.min(
    Math.round((currentWeightGrams / (maxWeightCapacityGrams || 5000)) * 100),
    100
  );

  const items = SAMPLE_STORED_ITEMS[code] || SAMPLE_STORED_ITEMS.default;

  const handleSimulateAudit = () => {
    setIsAuditing(true);
    setAuditSuccess(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccess(true);
      setTimeout(() => setAuditSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Inspector Header */}
      <div className="p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
              <h3 className="text-base font-semibold text-slate-100 font-mono">
                {code}
              </h3>
              {compartmentNumber && (
                <span className="text-xs font-mono text-platinum/60">
                  (Tray #{compartmentNumber})
                </span>
              )}
            </div>
            <p className="text-xs text-platinum/70 mt-1">
              {parentLockerName} &gt; {parentVaultName}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-3 h-3 animate-pulse" />
            Active RFID Mesh
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-gold/10 text-gold-light border border-gold/30">
            <ShieldCheck className="w-3 h-3" />
            Tamper Seal Intact
          </span>
        </div>
      </div>

      {/* Dual Utilization Gauges */}
      <div className="p-5 border-b border-surface-border space-y-4">
        {/* Metric 1: Weight Load */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-platinum/50" />
              Weight Load:
            </span>
            <span className="font-mono text-slate-100">
              <strong className="text-gold-light font-semibold">
                {currentWeightGrams.toFixed(2)} g
              </strong>{" "}
              / {maxWeightCapacityGrams} g ({weightPercentage}%)
            </span>
          </div>
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden mt-2 border border-surface-border/50">
            <div
              style={{ width: `${weightPercentage}%` }}
              className="bg-gold h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Metric 2: Occupancy Slots */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-platinum/50" />
              Occupancy:
            </span>
            <span className="font-mono text-slate-100">
              <strong className="text-emerald-400 font-semibold">
                {occupiedItemCount}
              </strong>{" "}
              / {maxItemCapacity} Pieces ({safePercentage}%)
            </span>
          </div>
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden mt-2 border border-surface-border/50">
            <div
              style={{ width: `${Math.min(safePercentage, 100)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                safePercentage >= 85 ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
          </div>
        </div>

        {/* Audit Timestamp */}
        <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-[11px] font-mono text-platinum/60">
          <span>Last Audit: Today 14:15 IST</span>
          <span className="text-slate-300">Inspector K. Mehta</span>
        </div>
      </div>

      {/* Stored Items Micro-Manifest */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-2.5 bg-obsidian-deep border-b border-surface-border flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium">
            Stored Items Manifest ({occupiedItemCount} Pieces)
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live Sync
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-surface-border/40">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 hover:bg-surface-elevated/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-gold-light">
                  {item.serialNumber}
                </span>
                <span className="text-[10px] font-mono bg-surface-card px-1.5 py-0.5 rounded text-platinum/60 border border-surface-border">
                  {item.slotNumber}
                </span>
              </div>
              <div className="text-xs text-slate-100 font-medium mt-1 truncate">
                {item.name}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-platinum/70">
                <span>{item.purity}</span>
                <span className="text-slate-200 tabular-nums font-semibold">
                  {item.weightGrams.toFixed(3)} g
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="p-4 bg-surface-elevated/70 border-t border-surface-border space-y-2">
        {auditSuccess && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dual-custody RFID scale audit verified &amp; logged!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSimulateAudit}
            disabled={isAuditing}
            className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Auditing..." : "Audit Reconcile"}</span>
          </button>

          <button
            onClick={onTransferClick}
            className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Transfer Stock</span>
          </button>
        </div>

        <button
          onClick={() => alert(`Printing replacement Zebra RFID label for ${code}`)}
          className="w-full px-3 py-2 rounded-lg bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Compartment RFID Tag</span>
        </button>
      </div>
    </div>
  );
}
