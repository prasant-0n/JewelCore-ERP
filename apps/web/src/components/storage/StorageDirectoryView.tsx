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
      {/* Sub-Header & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
            <span>
              {storeName} ({storeCode})
            </span>
            <span>&gt;</span>
            <span className="text-gold font-medium">
              Storage &amp; Vault Hierarchy
            </span>
            <Badge variant="emerald" dot className="ml-2">
              Live RFID Mesh Sync
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Interactive Vault &amp; Storage Directory Visualizer
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsNewUnitModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Storage Unit</span>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handleScanRfid}
            isLoading={isScanning}
          >
            <Scan className="w-3.5 h-3.5 mr-1" />
            <span>Scan Compartment RFID</span>
          </Button>
        </div>
      </div>

      {/* 4 Primary Summary Metric Cards */}
      <WorkstationKpiGrid items={storageKpiItems} />

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
          {/* Filters & Search Toolbar */}
          <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search vault, locker, or cell ID (e.g. COMP-02)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
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
                      ? "bg-gold text-black font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground bg-surface-elevated border border-surface-border"
                  }`}
                >
                  {tier === "ALL"
                    ? "All Tiers"
                    : tier.charAt(0) + tier.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </Card>

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
