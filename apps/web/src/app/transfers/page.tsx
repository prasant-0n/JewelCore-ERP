"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import { JewelCoreLogo } from "../../components/common/JewelCoreLogo";
import {
  ConsignmentItemCard,
  ConsignmentItemData,
} from "../../components/transfers/ConsignmentItemCard";
import {
  ManifestSection,
  ManifestGroupData,
} from "../../components/transfers/ManifestSection";
import { TransitSecurityInspector } from "../../components/transfers/TransitSecurityInspector";
import { ScheduleTransferModal } from "../../components/transfers/ScheduleTransferModal";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "../../components/workstation/WorkstationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Truck,
  ShieldCheck,
  Lock,
  Search,
  Plus,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const INITIAL_MANIFESTS: ManifestGroupData[] = [
  {
    id: "man-01",
    manifestNumber: "TR-2026-0881",
    routeTitle: "Manifest #TR-2026-0881: Mumbai Flagship to New Delhi Vault",
    carrierPlate: "Brinks Van #04 (MH-01-BX-9021)",
    destinationVault: "New Delhi Connaught Place Safe",
    etaString: "19:45 IST (In 3h 30m)",
    status: "EN_ROUTE",
    items: [
      {
        id: "tr-itm-01",
        itemCode: "TR-ITM-01",
        trayDescription: "High-Jewellery Solitaire Rings Vault Tray #01",
        category: "Diamond Solitaires",
        pieceCount: 42,
        grossWeightGrams: 248.85,
        netGoldGrams: 194.2,
        specieValuationInr: 18450000,
        electronicSealId: "ELEC-SEAL-9912",
        status: "GEOFENCE_LOCKED",
        securityTier: "Armored Safe B6",
      },
      {
        id: "tr-itm-02",
        itemCode: "TR-ITM-02",
        trayDescription: "Royal Kundan & Polki Bridal Chokers Tray",
        category: "Bridal Jewellery",
        pieceCount: 12,
        grossWeightGrams: 1142.6,
        netGoldGrams: 890.15,
        specieValuationInr: 11400000,
        electronicSealId: "ELEC-SEAL-9913",
        status: "EN_ROUTE",
        securityTier: "Armored Safe B6",
      },
      {
        id: "tr-itm-03",
        itemCode: "TR-ITM-03",
        trayDescription: "24K Minted Fine Bullion Cast Ingot Box",
        category: "Raw Bullion",
        pieceCount: 5,
        grossWeightGrams: 5000.0,
        netGoldGrams: 5000.0,
        specieValuationInr: 36702500,
        electronicSealId: "ELEC-SEAL-9914",
        status: "EN_ROUTE",
        securityTier: "Armored Safe B6",
      },
    ],
  },
  {
    id: "man-02",
    manifestNumber: "TR-2026-0882",
    routeTitle: "Manifest #TR-2026-0882: Surat Atelier to Mumbai Vault",
    carrierPlate: "Sequel Logistics #GJ-05-TR-4412",
    destinationVault: "Mumbai Central Vault (INV-11)",
    etaString: "Tomorrow, 11:00 IST",
    status: "LOADING",
    items: [
      {
        id: "tr-itm-04",
        itemCode: "TR-ITM-04",
        trayDescription: "Finished Casting Grain & Uncut Diamond Lot",
        category: "Atelier Intake",
        pieceCount: 68,
        grossWeightGrams: 3420.1,
        netGoldGrams: 3120.5,
        specieValuationInr: 22800000,
        electronicSealId: "ELEC-SEAL-7718",
        status: "EN_ROUTE",
        securityTier: "Armored Safe B6",
      },
    ],
  },
  {
    id: "man-03",
    manifestNumber: "TR-2026-0883",
    routeTitle: "Manifest #TR-2026-0883: Mumbai Vault to Bangalore Showroom",
    carrierPlate: "Brinks Van #09 (KA-01-BX-1102)",
    destinationVault: "Bangalore Indiranagar Safe",
    etaString: "Tomorrow, 16:30 IST",
    status: "EN_ROUTE",
    items: [
      {
        id: "tr-itm-05",
        itemCode: "TR-ITM-05",
        trayDescription: "Heritage Polki & Temple Kada Showcase",
        category: "Exhibition Lot",
        pieceCount: 24,
        grossWeightGrams: 1840.5,
        netGoldGrams: 1680.0,
        specieValuationInr: 14850000,
        electronicSealId: "ELEC-SEAL-5501",
        status: "EN_ROUTE",
        securityTier: "Armored Safe B6",
      },
    ],
  },
];

export default function TransfersTransitPage() {
  const [manifests, setManifests] =
    useState<ManifestGroupData[]>(INITIAL_MANIFESTS);
  const [selectedItem, setSelectedItem] = useState<ConsignmentItemData | null>(
    INITIAL_MANIFESTS[0].items[0],
  );
  const [selectedRouteTitle, setSelectedRouteTitle] = useState<string>(
    INITIAL_MANIFESTS[0].routeTitle,
  );
  const [selectedCarrierPlate, setSelectedCarrierPlate] = useState<string>(
    INITIAL_MANIFESTS[0].carrierPlate,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSigningDispatch, setIsSigningDispatch] = useState(false);

  // Filter manifests
  const filteredManifests = manifests.map((manifest) => {
    let items = manifest.items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.itemCode.toLowerCase().includes(q) ||
          i.trayDescription.toLowerCase().includes(q) ||
          i.electronicSealId.toLowerCase().includes(q),
      );
    }
    if (filterState === "DELHI") {
      items = items.filter((i) =>
        manifest.destinationVault.toLowerCase().includes("delhi"),
      );
    } else if (filterState === "ATELIER") {
      items = items.filter((i) =>
        manifest.routeTitle.toLowerCase().includes("surat"),
      );
    } else if (filterState === "BANGALORE") {
      items = items.filter((i) =>
        manifest.destinationVault.toLowerCase().includes("bangalore"),
      );
    }
    return { ...manifest, items };
  });

  const handleSelectItem = (
    item: ConsignmentItemData,
    manifest: ManifestGroupData,
  ) => {
    setSelectedItem(item);
    setSelectedRouteTitle(manifest.routeTitle);
    setSelectedCarrierPlate(manifest.carrierPlate);
  };

  const handleDualSignDispatch = async () => {
    setIsSigningDispatch(true);
    toast.info("Signing cryptographic dispatch token...", {
      description: "Armored fleet escort protocol armed via HSM key custody.",
    });

    await new Promise((res) => setTimeout(res, 1200));

    setIsSigningDispatch(false);
    toast.success("Dispatch Dual-Signed & Authorized", {
      description:
        "Brinks Armored Van #04 cleared for departure via National Highway 48 corridor.",
    });
  };

  const handleScheduledItem = (
    newItem: ConsignmentItemData,
    targetManifestId: string,
  ) => {
    setManifests((prev) =>
      prev.map((m) => {
        if (m.id === targetManifestId) {
          return {
            ...m,
            items: [newItem, ...m.items],
          };
        }
        return m;
      }),
    );
    setSelectedItem(newItem);
    const found = manifests.find((m) => m.id === targetManifestId);
    if (found) {
      setSelectedRouteTitle(found.routeTitle);
      setSelectedCarrierPlate(found.carrierPlate);
    }
  };

  const kpis: KpiItem[] = [
    {
      id: "active-dispatches",
      title: "Active In-Transit Shipments",
      value: "4 Dispatches",
      subValue: "₹ 18.42 Cr Specie Insured",
      badge: { text: "Insured", variant: "emerald" },
      icon: <Truck className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: "sealed-pieces",
      title: "Custody Sealed Pieces",
      value: "186 Pieces",
      subValue: "100% RFID Tamper-Taped",
      badge: { text: "Tamper-Sealed", variant: "gold" },
      icon: <Lock className="w-4 h-4 text-gold" />,
    },
    {
      id: "eta-compliance",
      title: "Transit ETA Compliance",
      value: "99.4% On-Schedule",
      subValue: "GPS Geofenced Corridor",
      badge: { text: "On-Time", variant: "emerald" },
      icon: <MapPin className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: "security-incidents",
      title: "Security Incidents",
      value: "0 Breach Alerts",
      subValue: "Armored Escort Guard Active",
      badge: { text: "Secure", variant: "emerald" },
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <JewelCoreLogo size="xs" variant="mark" />
                JewelCore ERP
              </span>
              <span>/</span>
              <span>Logistics &amp; Fleet Custody</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Inter-Branch Transfers &amp; Armored Transit
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight mt-1 flex items-center space-x-3">
              <span>Armored Fleet Tracking & Dual-Custody Manifests</span>
              <Badge variant="emerald" dot>
                Brinks Van #MH-01-BX-9021 • GPS / Gate Locked • 12ms
              </Badge>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Schedule Transfer</span>
            </Button>

            <Button
              variant="gold"
              size="sm"
              onClick={handleDualSignDispatch}
              disabled={isSigningDispatch}
              isLoading={isSigningDispatch}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Dual-Sign Transit Dispatch</span>
            </Button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <WorkstationKpiGrid items={kpis} />

        {/* Master Workspace: 65% Directory + 35% Sticky Inspector */}
        <WorkstationLayout
          inspector={
            <TransitSecurityInspector
              item={selectedItem}
              parentRouteTitle={selectedRouteTitle}
              carrierPlate={selectedCarrierPlate}
              onClose={() => setSelectedItem(null)}
              onAcknowledgeDeSeal={(item) => {
                setManifests((prev) =>
                  prev.map((m) => ({
                    ...m,
                    items: m.items.map((i) =>
                      i.id === item.id
                        ? { ...i, status: "DE_SEALED" as const }
                        : i,
                    ),
                  })),
                );
                setSelectedItem((prev) =>
                  prev ? { ...prev, status: "DE_SEALED" } : null,
                );
              }}
            />
          }
        >
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter by Manifest ID, Vehicle Plate, Electronic Seal ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-surface-elevated border-surface-border font-mono text-xs"
                />
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono">
                {(["ALL", "DELHI", "ATELIER", "BANGALORE"] as const).map(
                  (key) => {
                    const labels: Record<string, string> = {
                      ALL: "All Dispatches",
                      DELHI: "Delhi Safe",
                      ATELIER: "Surat Atelier",
                      BANGALORE: "Bangalore Showroom",
                    };
                    return (
                      <Button
                        key={key}
                        variant={filterState === key ? "gold" : "outline"}
                        size="xs"
                        onClick={() => setFilterState(key)}
                      >
                        {labels[key]}
                      </Button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Hierarchical Manifests & Consignment Matrix Grids */}
            <div className="space-y-4">
              {filteredManifests.map((manifest, idx) => (
                <ManifestSection
                  key={manifest.id}
                  manifest={manifest}
                  defaultExpanded={idx === 0}
                  selectedItemId={selectedItem?.id}
                  onSelectItem={(item, m) => handleSelectItem(item, m)}
                />
              ))}

              {filteredManifests.every((m) => m.items.length === 0) && (
                <Card className="border-surface-border bg-surface-card p-12 text-center text-muted-foreground">
                  <Truck className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No matching transit consignments found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search criteria or schedule a new armored
                    transfer.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </WorkstationLayout>

        {/* Modal for Scheduling Armored Transfer */}
        <ScheduleTransferModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduled={handleScheduledItem}
        />
      </div>
    </AppShell>
  );
}
