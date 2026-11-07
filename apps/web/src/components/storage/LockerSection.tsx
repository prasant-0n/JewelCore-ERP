"use client";

import React, { useState } from "react";
import type {
  LockerHierarchyWithOccupancy,
  CompartmentWithOccupancy,
} from "@jewelcore/shared";
import { CompartmentCard } from "./CompartmentCard";
import { ChevronDown, ChevronRight, KeySquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      className="border border-surface-border rounded-xl bg-surface overflow-hidden mb-4 shadow-sm"
    >
      {/* Locker Header Accordion */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-surface-elevated hover:bg-surface-elevated/80 border-b border-surface-border flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <span className="text-muted-foreground hover:text-gold transition-colors">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gold" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
          <span className="text-sm font-semibold text-foreground font-mono">
            {locker.name} ({locker.code})
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-surface px-2 py-0.5 rounded border border-surface-border">
            <KeySquare className="w-3 h-3 text-gold" />
            Cabinet #{locker.lockerNumber || "01"}
            {locker.capacityRating ? ` • Rating: ${locker.capacityRating}` : ""}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-muted-foreground hidden sm:inline">
            {locker.compartments.length} Trays •{" "}
            <strong className="text-foreground">{totalPieces} pcs</strong>
            {totalCapacity > 0 ? ` / ${totalCapacity} cap` : ""}
          </span>
          <Badge
            variant={occupancyPercentage >= 85 ? "amber" : "emerald"}
            size="sm"
          >
            {occupancyPercentage}% Cap
          </Badge>
        </div>
      </div>

      {/* Locker Body: Compartments Grid */}
      {isOpen && (
        <div className="p-4 bg-obsidian-deep/40">
          {locker.compartments.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
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
