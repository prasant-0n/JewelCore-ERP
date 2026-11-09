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
  Scan,
} from "lucide-react";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "@/components/workstation/WorkstationLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
  const [filterStatus, setFilterStatus] = useState<
    CompartmentOccupancyStatus | "ALL"
  >("ALL");
  const [tierFilter, setTierFilter] = useState<
    "ALL" | "MAXIMUM" | "HIGH" | "SHOWROOM"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompartment, setSelectedCompartment] =
    useState<CompartmentWithOccupancy | null>(
      vaults[0]?.lockers[0]?.compartments[0] || null,
    );
  const [selectedLockerName, setSelectedLockerName] = useState<string>(
    vaults[0]?.lockers[0]?.name || "Locker 01",
  );
  const [selectedVaultName, setSelectedVaultName] = useState<string>(
    vaults[0]?.name || "Vault 01",
  );
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  const storageKpiItems: KpiItem[] = [
    {
      id: "kpi-vaults",
      title: "Total Vaults",
      value: `${totalVaults} Active`,
      subValue: "Primary Safe, Strongroom, Lab Vault",
      badge: { text: "Secure", variant: "emerald" },
      icon: <Lock className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-lockers",
      title: "Total Lockers",
      value: `${totalLockers} Lockers`,
      subValue: `Allocated across ${totalVaults} physical vaults`,
      badge: { text: "Biometric", variant: "secondary" },
      icon: <Layers className="w-3.5 h-3.5 text-foreground" />,
    },
    {
      id: "kpi-utilization",
      title: "Compartment Utilization",
      value: `${overallUtilization}%`,
      subValue: `${totalOccupiedPieces} / ${totalCapacity > 0 ? totalCapacity : 208} Cells`,
      badge: {
        text: overallUtilization > 85 ? "Near Cap" : "Optimal",
        variant: overallUtilization > 85 ? "amber" : "emerald",
      },
      icon: <PieChart className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-gold-weight",
      title: "Stored Fine Gold",
      value: "4,821.500 g",
      subValue: "Au 24K Eqv. • Mark-to-market verified",
      badge: { text: "Au 99.9%", variant: "gold" },
      icon: <Scale className="w-3.5 h-3.5 text-gold" />,
    },
  ];

  // Filter vaults
  const filteredVaults = vaults
    .filter((v) => {
      if (tierFilter === "ALL") return true;
      return (
        (v as any).vaultType?.includes(tierFilter) ||
        (v as any).accessLevelRequired?.includes(tierFilter)
      );
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
    vault: VaultHierarchyWithOccupancy,
  ) => {
    setSelectedCompartment(comp);
    setSelectedLockerName(locker.name);
    setSelectedVaultName(vault.name);
  };

  const handleScanRfid = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success("RFID Sweep Completed", {
        description: `142 tags synchronized in 220ms across ${selectedCompartment?.code || "active compartment"}. Zero discrepancies.`,
      });
    }, 700);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Luxury Hero Workstation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-elevated/90 via-surface-card/60 to-surface-card/90 border border-gold/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <span>{storeName} ({storeCode})</span>
              <span>/</span>
              <span>Treasury Storage</span>
              <span>/</span>
              <span className="text-gold font-semibold">Vault Hierarchy</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-foreground">
                Interactive Vault &amp; Storage Directory Visualizer
              </h1>
              <Badge variant="emerald" dot className="font-mono text-[11px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live RFID Mesh Sync
              </Badge>
              <Badge variant="outline" className="border-gold/30 text-gold font-mono text-[11px] px-2.5 py-1">
                Grade V Safe Encrypted
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl">
              Real-time multi-tier physical vault, smart locker, and high-security compartment occupancy tracking with automated tare-calibration telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewUnitModalOpen(true)}
              className="border-surface-border hover:border-gold/40 hover:bg-gold/5 font-mono text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Storage Unit</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleScanRfid}
              isLoading={isScanning}
              className="font-mono text-xs font-semibold shadow-lg shadow-gold/20"
            >
              <Scan className="w-3.5 h-3.5 mr-1" />
              <span>Scan Compartment RFID</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Primary Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storageKpiItems.map((kpi) => (
          <Card
            key={kpi.id}
            className="relative overflow-hidden p-4 rounded-xl bg-surface-card/90 border border-surface-border/80 hover:border-gold/40 transition-all duration-300 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                {kpi.title}
              </span>
              <div className="p-2 rounded-lg bg-surface-elevated border border-surface-border/50 text-gold">
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl font-serif font-black tracking-tight text-foreground">
              {kpi.value}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-border/40 text-xs">
              <span className="text-muted-foreground font-mono">{kpi.subValue}</span>
              {kpi.badge && (
                <Badge
                  variant={kpi.badge.variant as any}
                  className="font-mono text-[10px] px-1.5 py-0.5"
                >
                  {kpi.badge.text}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Workstation 65% / 35% Layout */}
      <WorkstationLayout
        inspector={
          <CompartmentInspector
            compartment={selectedCompartment}
            parentLockerName={selectedLockerName}
            parentVaultName={selectedVaultName}
            onTransferClick={() =>
              toast.info(
                `Initiating Inter-Compartment Stock Transfer for ${selectedCompartment?.code}`,
              )
            }
          />
        }
      >
        {/* Left Column (65%): 3-Tier Storage Hierarchy */}
        <div className="space-y-4">
          {/* Luxury Filters & Search Toolbar */}
          <div className="bg-surface-card/90 border border-surface-border rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search vault, locker, or cell ID (e.g. COMP-02)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-lg font-mono text-xs bg-surface-elevated border-surface-border"
              />
            </div>

            {/* Segmented Tier Filter Pills */}
            <div className="flex items-center p-1 bg-surface-elevated rounded-lg border border-surface-border/60 gap-1 overflow-x-auto">
              {(["ALL", "MAXIMUM", "HIGH", "SHOWROOM"] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    tierFilter === tier
                      ? "bg-gold text-obsidian font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-card/60"
                  }`}
                >
                  {tier === "ALL"
                    ? "All Tiers"
                    : tier.charAt(0) + tier.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Vault Sections List */}
          {filteredVaults.length === 0 ? (
            <Card className="text-center py-12 text-muted-foreground text-xs">
              No storage locations match your current filter criteria.
            </Card>
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
      </WorkstationLayout>

      {/* New Storage Unit Provisioning Modal */}
      <NewStorageUnitModal
        isOpen={isNewUnitModalOpen}
        onClose={() => setIsNewUnitModalOpen(false)}
        vaults={vaults.map((v) => ({
          id: v.id,
          name: v.name,
          code: v.code,
          lockers: v.lockers.map((l) => ({
            id: l.id,
            name: l.name,
            code: l.code,
          })),
        }))}
      />
    </div>
  );
}
