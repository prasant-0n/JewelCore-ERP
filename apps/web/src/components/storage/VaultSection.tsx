"use client";

import React, { useState } from "react";
import type {
  VaultHierarchyWithOccupancy,
  LockerHierarchyWithOccupancy,
  CompartmentWithOccupancy,
} from "@jewelcore/shared";
import { LockerSection } from "./LockerSection";
import { ChevronDown, ChevronRight, Thermometer, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VaultSectionProps {
  vault: VaultHierarchyWithOccupancy;
  selectedCompartmentId?: string;
  onSelectCompartment?: (
    compartment: CompartmentWithOccupancy,
    locker: LockerHierarchyWithOccupancy,
    vault: VaultHierarchyWithOccupancy
  ) => void;
}

export function VaultSection({
  vault,
  selectedCompartmentId,
  onSelectCompartment,
}: VaultSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalLockers = vault.lockers.length;
  const totalCompartments = vault.lockers.reduce(
    (acc, l) => acc + l.compartments.length,
    0
  );
  const totalPieces = vault.lockers.reduce(
    (acc, l) =>
      acc + l.compartments.reduce((cAcc, c) => cAcc + c.occupiedItemCount, 0),
    0
  );
  const totalCapacity = vault.lockers.reduce(
    (acc, l) =>
      acc +
      l.compartments.reduce((cAcc, c) => cAcc + (c.maxItemCapacity ?? 0), 0),
    0
  );
  const vaultOccupancy =
    totalCapacity > 0 ? Math.round((totalPieces / totalCapacity) * 100) : 0;

  return (
    <div
      data-testid={`vault-section-${vault.code}`}
      className="border border-surface-border rounded-xl bg-surface overflow-hidden mb-6 shadow-md"
    >
      {/* Vault Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 bg-surface-elevated border-b border-surface-border flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-surface-elevated/80"
      >
        <div className="flex items-center space-x-3">
          <span className="text-gold">
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-foreground font-mono tracking-tight">
              {vault.name}
            </span>
            <Badge variant="gold" size="sm">
              {vault.code}
            </Badge>
            <Badge variant="emerald" dot size="sm" className="hidden md:inline-flex">
              Armed &amp; Dual-Key Active
            </Badge>
          </div>
        </div>

        {/* Telemetry & Aggregate stats */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="hidden lg:flex items-center space-x-3 text-muted-foreground text-[11px] pr-2 border-r border-surface-border">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
              19.2°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
              42% RH
            </span>
          </div>

          <div className="text-muted-foreground">
            <span>{totalLockers} Lockers</span>
            <span className="mx-1.5">•</span>
            <span>{totalCompartments} Trays</span>
            <span className="mx-1.5">•</span>
            <strong className="text-gold">{totalPieces} pcs</strong>
          </div>

          <Badge variant="gold" size="default">
            {vaultOccupancy}% Cap
          </Badge>
        </div>
      </div>

      {/* Vault Body: Locker Sections */}
      {isOpen && (
        <div className="p-5 bg-surface/50">
          {vault.lockers.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              No lockers provisioned in this vault.
            </div>
          ) : (
            vault.lockers.map((locker) => (
              <LockerSection
                key={locker.id}
                locker={locker}
                selectedCompartmentId={selectedCompartmentId}
                onSelectCompartment={(comp, lk) =>
                  onSelectCompartment?.(comp, lk, vault)
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
