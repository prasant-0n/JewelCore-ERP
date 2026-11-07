"use client";

import React, { useState } from "react";
import { IngotBarCard, IngotBarItem } from "./IngotBarCard";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Truck,
  FileText,
  BadgeCheck,
} from "lucide-react";

export interface ShipmentData {
  id: string;
  shipmentNumber: string;
  supplierName: string;
  trackingNumber: string;
  totalWeightGrams: number;
  sealNumber: string;
  isLbmaCertified: boolean;
  status: "QUARANTINED" | "ASSAY_VERIFIED" | "IN_TRANSIT";
  ingots: IngotBarItem[];
}

interface ShipmentSectionProps {
  shipment: ShipmentData;
  selectedIngotId?: string;
  onSelectIngot?: (ingot: IngotBarItem, shipment: ShipmentData) => void;
  defaultExpanded?: boolean;
}

export function ShipmentSection({
  shipment,
  selectedIngotId,
  onSelectIngot,
  defaultExpanded = false,
}: ShipmentSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Shipment Header Banner */}
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
              <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                {shipment.shipmentNumber}: {shipment.supplierName}
              </span>
              {shipment.isLbmaCertified && (
                <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                  LBMA Certified
                </span>
              )}
            </div>

            <div className="text-xs text-platinum/70 flex items-center space-x-2 mt-0.5 font-mono">
              <span>{shipment.ingots.length} Ingot Cast Bars</span>
              <span>•</span>
              <span className="text-slate-100 font-bold tabular-nums">
                {shipment.totalWeightGrams.toFixed(3)} g Gross
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Security Seal OK (#{shipment.sealNumber})
              </span>
            </div>
          </div>
        </div>

        {/* Right Info Tags */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono text-platinum/60 bg-obsidian-deep px-2 py-1 rounded border border-surface-border">
            WAYBILL #{shipment.trackingNumber}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
              shipment.status === "QUARANTINED"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : shipment.status === "ASSAY_VERIFIED"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            {shipment.status === "QUARANTINED"
              ? "Quarantined (QC)"
              : shipment.status === "ASSAY_VERIFIED"
              ? "Assay Cleared"
              : "In Transit"}
          </span>
        </div>
      </div>

      {/* Expanded Ingot Bar Matrix */}
      {isOpen && (
        <div className="p-5 bg-obsidian-deep/50">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-platinum/70 uppercase text-[10px] tracking-wider font-medium">
              Ingot Bars in Lot ({shipment.ingots.length} Loaded on Receiving Tray)
            </span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Mettler High-Throughput Cell Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {shipment.ingots.map((ingot) => (
              <IngotBarCard
                key={ingot.id}
                ingot={ingot}
                isSelected={selectedIngotId === ingot.id}
                onSelect={(i) => onSelectIngot?.(i, shipment)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
