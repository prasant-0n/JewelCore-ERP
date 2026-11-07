"use client";

import React, { useState } from "react";
import type {
  VaultHierarchyWithOccupancy,
  LockerHierarchyWithOccupancy,
  CompartmentWithOccupancy,
} from "@jewelcore/shared";
import { LockerSection } from "./LockerSection";
import { ShieldCheck, ChevronDown, ChevronRight, Thermometer, Droplets } from "lucide-react";

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
      className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-6 shadow-md"
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
            <span className="text-base font-bold text-slate-100 font-mono tracking-tight">
              {vault.name}
            </span>
            <span className="text-xs font-mono bg-obsidian-deep px-2 py-0.5 rounded text-gold-light border border-gold/30">
              {vault.code}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Armed &amp; Dual-Key Active
            </span>
          </div>
        </div>

        {/* Telemetry & Aggregate stats */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="hidden lg:flex items-center space-x-3 text-platinum/60 text-[11px] pr-2 border-r border-surface-border">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-platinum/40" />
              19.2°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-platinum/40" />
              42% RH
            </span>
          </div>

          <div className="text-platinum/70">
            <span>{totalLockers} Lockers</span>
            <span className="mx-1.5">•</span>
            <span>{totalCompartments} Trays</span>
            <span className="mx-1.5">•</span>
            <strong className="text-gold-light">{totalPieces} pcs</strong>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gold/10 text-gold border border-gold/30">
            {vaultOccupancy}% Cap
          </span>
        </div>
      </div>

      {/* Vault Body: Locker Sections */}
      {isOpen && (
        <div className="p-5 bg-surface-card/60">
          {vault.lockers.length === 0 ? (
            <div className="text-center py-8 text-xs text-platinum/40 italic">
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
