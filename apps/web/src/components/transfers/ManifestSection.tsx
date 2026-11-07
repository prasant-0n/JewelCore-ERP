"use client";

import React, { useState } from "react";
import {
  ConsignmentItemCard,
  ConsignmentItemData,
} from "./ConsignmentItemCard";
import {
  ChevronDown,
  ChevronRight,
  Truck,
  ShieldCheck,
  Radio,
  MapPin,
} from "lucide-react";

export interface ManifestGroupData {
  id: string;
  manifestNumber: string;
  routeTitle: string;
  carrierPlate: string;
  destinationVault: string;
  etaString: string;
  status: "EN_ROUTE" | "LOADING" | "DELIVERED" | "HELD_SECURITY";
  items: ConsignmentItemData[];
}

interface ManifestSectionProps {
  manifest: ManifestGroupData;
  selectedItemId?: string;
  onSelectItem?: (
    item: ConsignmentItemData,
    manifest: ManifestGroupData,
  ) => void;
  defaultExpanded?: boolean;
}

export function ManifestSection({
  manifest,
  selectedItemId,
  onSelectItem,
  defaultExpanded = false,
}: ManifestSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const totalGrossWeight = manifest.items.reduce(
    (acc, itm) => acc + (itm.grossWeightGrams || 0),
    0,
  );
  const totalValuation = manifest.items.reduce(
    (acc, itm) => acc + (itm.specieValuationInr || 0),
    0,
  );
  const totalPieceCount = manifest.items.reduce(
    (acc, itm) => acc + (itm.pieceCount || 0),
    0,
  );

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Manifest Header Banner */}
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
                {manifest.routeTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                {manifest.carrierPlate}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{totalPieceCount} Pieces Consigned</span>
              <span>•</span>
              <span className="text-foreground font-bold tabular-nums">
                {totalGrossWeight.toFixed(3)} g Total
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                ₹ {totalValuation.toLocaleString("en-IN")} Specie Cover
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {manifest.status === "EN_ROUTE"
                  ? "En Route (GPS Locked)"
                  : "Under Transit"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            ETA: {manifest.etaString}
          </span>
        </div>
      </div>

      {/* Expanded Consignment Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              Consigned Trays in Armored Safe ({manifest.items.length} Sealed
              Units)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Electronic Tamper Mesh Responding
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {manifest.items.map((item) => (
              <ConsignmentItemCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={(itm) => onSelectItem?.(itm, manifest)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
