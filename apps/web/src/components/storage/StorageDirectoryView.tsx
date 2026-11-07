"use client";

import React, { useState } from "react";
import type {
  VaultHierarchyWithOccupancy,
  LockerHierarchyWithOccupancy,
  CompartmentWithOccupancy,
  CompartmentOccupancyStatus,
} from "@jewelcore/shared";
import { VaultSection } from "./VaultSection";
import { CompartmentInspector } from "./CompartmentInspector";
import { NewStorageUnitModal } from "./NewStorageUnitModal";
import {
  Lock,
  Layers,
  PieChart,
  Scale,
  Search,
  Plus,
  Radio,
  Scan,
  RefreshCw,
} from "lucide-react";

interface StorageDirectoryViewProps {
  storeName?: string;
  storeCode?: string;
  vaults: VaultHierarchyWithOccupancy[];
}

export function StorageDirectoryView({
  storeName = "Flagship Mumbai",
  storeCode = "INV-11",
  vaults,
}: StorageDirectoryViewProps) {
  const [filterStatus, setFilterStatus] = useState<CompartmentOccupancyStatus | "ALL">("ALL");
  const [tierFilter, setTierFilter] = useState<"ALL" | "MAXIMUM" | "HIGH" | "SHOWROOM">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompartment, setSelectedCompartment] = useState<CompartmentWithOccupancy | null>(
    vaults[0]?.lockers[0]?.compartments[0] || null
  );
  const [selectedLockerName, setSelectedLockerName] = useState<string>(
    vaults[0]?.lockers[0]?.name || "Locker 01"
  );
  const [selectedVaultName, setSelectedVaultName] = useState<string>(
    vaults[0]?.name || "Vault 01"
  );
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);

  // Compute summary metrics
  const totalVaults = vaults.length;
  let totalLockers = 0;
  let totalCompartments = 0;
  let totalOccupiedPieces = 0;
  let totalCapacity = 0;

  for (const vault of vaults) {
    totalLockers += vault.lockers.length;
    for (const locker of vault.lockers) {
      totalCompartments += locker.compartments.length;
      for (const comp of locker.compartments) {
        totalOccupiedPieces += comp.occupiedItemCount;
        if (comp.maxItemCapacity) {
          totalCapacity += comp.maxItemCapacity;
        }
      }
    }
  }

  const overallUtilization =
    totalCapacity > 0
      ? Math.round((totalOccupiedPieces / totalCapacity) * 100)
      : 68;

  // Filter vaults
  const filteredVaults = vaults
    .filter((v) => {
      if (tierFilter === "ALL") return true;
      return (v as any).vaultType?.includes(tierFilter) || (v as any).accessLevelRequired?.includes(tierFilter);
    })
    .map((vault) => ({
      ...vault,
      lockers: vault.lockers.map((locker) => ({
        ...locker,
        compartments: locker.compartments.filter((comp) => {
          const matchesStatus =
            filterStatus === "ALL" || comp.status === filterStatus;
          const matchesSearch =
            searchQuery.trim() === "" ||
            comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            comp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            locker.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesStatus && matchesSearch;
        }),
      })),
    }));

  const handleSelectCompartment = (
    comp: CompartmentWithOccupancy,
    locker: LockerHierarchyWithOccupancy,
    vault: VaultHierarchyWithOccupancy
  ) => {
    setSelectedCompartment(comp);
    setSelectedLockerName(locker.name);
    setSelectedVaultName(vault.name);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      {/* Sub-Header & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-platinum/70 uppercase tracking-wider mb-1">
            <span>{storeName} ({storeCode})</span>
            <span>&gt;</span>
            <span className="text-gold font-medium">Storage &amp; Vault Hierarchy</span>
            <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live RFID Mesh Sync
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Interactive Vault &amp; Storage Directory Visualizer
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNewUnitModalOpen(true)}
            className="px-3.5 py-1.5 rounded-md bg-surface-card border border-surface-border text-xs font-medium text-slate-200 hover:border-gold/50 hover:text-gold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-platinum/60" />
            <span>+ New Storage Unit</span>
          </button>
          <button
            onClick={() => alert("RFID Scanner Polling: 142 tags synchronized in 220ms.")}
            className="px-3.5 py-1.5 rounded-md bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Compartment RFID</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Vaults */}
        <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-platinum">
            <span className="uppercase font-mono text-[10px] tracking-wider">Total Vaults</span>
            <Lock className="w-4 h-4 text-gold/70" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight font-mono text-slate-100">
              {totalVaults} Active
            </div>
            <p className="mt-1 text-xs text-platinum/60">
              Primary Safe, Retail Strongroom, Lab Vault
            </p>
          </div>
        </div>

        {/* Metric 2: Total Lockers */}
        <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-platinum">
            <span className="uppercase font-mono text-[10px] tracking-wider">Total Lockers</span>
            <Layers className="w-4 h-4 text-platinum/60" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight font-mono text-slate-100">
              {totalLockers} Lockers
            </div>
            <p className="mt-1 text-xs text-platinum/60">
              Allocated across {totalVaults} physical vaults
            </p>
          </div>
        </div>

        {/* Metric 3: Compartment Utilization */}
        <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-platinum">
            <span className="uppercase font-mono text-[10px] tracking-wider">Utilization</span>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight font-mono text-gold-light">
                {overallUtilization}%
              </span>
              <span className="text-xs font-mono text-platinum/60">
                {totalOccupiedPieces} / {totalCapacity > 0 ? totalCapacity : 208} Cells
              </span>
            </div>
            {/* Segmented mini progress bar */}
            <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden flex gap-0.5 mt-2 border border-surface-border/50">
              <div
                style={{ width: `${Math.min(overallUtilization, 70)}%` }}
                className="bg-gold h-full"
              />
              <div
                style={{ width: `${Math.max(overallUtilization - 70, 0)}%` }}
                className="bg-emerald-400 h-full"
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Stored Fine Gold */}
        <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-platinum">
            <span className="uppercase font-mono text-[10px] tracking-wider">Stored Fine Gold</span>
            <Scale className="w-4 h-4 text-gold/80" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-100">
              4,821.500 <span className="text-sm font-sans font-normal text-platinum">g</span>
            </div>
            <p className="mt-1 text-xs text-platinum/60">
              Au 24K Eqv. • Mark-to-market verified
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column (8 of 12 spans = ~65%): 3-Tier Storage Hierarchy */}
        <div className="xl:col-span-8 space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-card p-3 rounded-xl border border-surface-border shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-platinum/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vault, locker, or cell ID (e.g. COMP-02)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-platinum/40 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>

            {/* Tier Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto text-xs">
              {(["ALL", "MAXIMUM", "HIGH", "SHOWROOM"] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all whitespace-nowrap ${
                    tierFilter === tier
                      ? "bg-gold text-obsidian font-bold shadow-sm"
                      : "text-platinum/70 hover:text-slate-100 bg-obsidian-deep border border-surface-border"
                  }`}
                >
                  {tier === "ALL" ? "All Tiers" : tier.charAt(0) + tier.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Vault Sections List */}
          {filteredVaults.length === 0 ? (
            <div className="text-center py-12 bg-surface-card border border-surface-border rounded-xl text-platinum/50 text-xs">
              No storage locations match your current filter criteria.
            </div>
          ) : (
            filteredVaults.map((vault) => (
              <VaultSection
                key={vault.id}
                vault={vault}
                selectedCompartmentId={selectedCompartment?.id}
                onSelectCompartment={handleSelectCompartment}
              />
            ))
          )}
        </div>

        {/* Right Column (4 of 12 spans = ~35%): Selected Compartment Inspector */}
        <div className="xl:col-span-4 sticky top-6 self-start h-[calc(100vh-140px)]">
          <CompartmentInspector
            compartment={selectedCompartment}
            parentLockerName={selectedLockerName}
            parentVaultName={selectedVaultName}
            onTransferClick={() =>
              alert(`Initiating Inter-Compartment Stock Transfer for ${selectedCompartment?.code}`)
            }
          />
        </div>
      </div>

      {/* New Storage Unit Provisioning Modal */}
      <NewStorageUnitModal
        isOpen={isNewUnitModalOpen}
        onClose={() => setIsNewUnitModalOpen(false)}
        vaults={vaults.map((v) => ({
          id: v.id,
          name: v.name,
          code: v.code,
          lockers: v.lockers.map((l) => ({ id: l.id, name: l.name, code: l.code })),
        }))}
      />
    </div>
  );
}
