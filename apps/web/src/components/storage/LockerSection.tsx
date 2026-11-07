"use client";

import React, { useState } from "react";
import type {
  LockerHierarchyWithOccupancy,
  CompartmentWithOccupancy,
} from "@jewelcore/shared";
import { CompartmentCard } from "./CompartmentCard";
import { ChevronDown, ChevronRight, Layers, KeySquare } from "lucide-react";

interface LockerSectionProps {
  locker: LockerHierarchyWithOccupancy;
  selectedCompartmentId?: string;
  onSelectCompartment?: (
    compartment: CompartmentWithOccupancy,
    locker: LockerHierarchyWithOccupancy
  ) => void;
}

export function LockerSection({
  locker,
  selectedCompartmentId,
  onSelectCompartment,
}: LockerSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalPieces = locker.compartments.reduce(
    (acc, c) => acc + c.occupiedItemCount,
    0
  );
  const totalCapacity = locker.compartments.reduce(
    (acc, c) => acc + (c.maxItemCapacity ?? 0),
    0
  );
  const occupancyPercentage =
    totalCapacity > 0 ? Math.round((totalPieces / totalCapacity) * 100) : 0;

  return (
    <div
      data-testid={`locker-section-${locker.code}`}
      className="border border-surface-border rounded-xl bg-obsidian-deep overflow-hidden mb-4 shadow-sm"
    >
      {/* Locker Header Accordion */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-surface-card hover:bg-surface-elevated/70 border-b border-surface-border flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <span className="text-platinum/60 hover:text-gold transition-colors">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gold" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
          <span className="text-sm font-semibold text-slate-100 font-mono">
            {locker.name} ({locker.code})
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-platinum/70 bg-obsidian-deep px-2 py-0.5 rounded border border-surface-border">
            <KeySquare className="w-3 h-3 text-gold/70" />
            Cabinet #{locker.lockerNumber || "01"}
            {locker.capacityRating ? ` • Rating: ${locker.capacityRating}` : ""}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-platinum/70 hidden sm:inline">
            {locker.compartments.length} Trays •{" "}
            <strong className="text-slate-100">{totalPieces} pcs</strong>
            {totalCapacity > 0 ? ` / ${totalCapacity} cap` : ""}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              occupancyPercentage >= 85
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {occupancyPercentage}% Cap
          </span>
        </div>
      </div>

      {/* Locker Body: Compartments Grid */}
      {isOpen && (
        <div className="p-4 bg-obsidian-deep/80">
          {locker.compartments.length === 0 ? (
            <div className="text-center py-6 text-xs text-platinum/40 italic">
              No compartments configured in this locker.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {locker.compartments.map((comp) => (
                <CompartmentCard
                  key={comp.id}
                  compartment={comp}
                  isSelected={selectedCompartmentId === comp.id}
                  onSelect={(c) => onSelectCompartment?.(c, locker)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
