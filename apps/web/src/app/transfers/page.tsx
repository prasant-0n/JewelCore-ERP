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
import { DualCustodyDispatchModal } from "../../components/transfers/DualCustodyDispatchModal";
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
  ShieldAlert,
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
  const [isDualCustodyModalOpen, setIsDualCustodyModalOpen] = useState(false);
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
      icon: <Truck className="w-4 h-4 text-status-emerald" />,
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
      icon: <MapPin className="w-4 h-4 text-status-indigo" />,
    },
    {
      id: "security-incidents",
      title: "Security Incidents",
      value: "0 Breach Alerts",
      subValue: "Armored Escort Guard Active",
      badge: { text: "Secure", variant: "emerald" },
      icon: <ShieldCheck className="w-4 h-4 text-status-emerald" />,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Luxury Hero Workstation Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <JewelCoreLogo size="xs" variant="mark" />
                  JewelCore ERP
                </span>
                <span>/</span>
                <span>Logistics &amp; Fleet Custody</span>
                <span>/</span>
                <span className="text-gold font-medium">
                  Inter-Branch Transfers &amp; Armored Transit
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">
                  Armored Fleet Tracking &amp; Dual-Custody Manifests
                </h1>
                <Badge variant="emerald" dot className="font-mono text-[11px] px-2.5 py-1 bg-status-emerald/10 text-status-emerald border border-status-emerald/30">
                  Brinks Van #MH-01-BX-9021 • GPS / Gate Locked • 12ms
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold font-mono text-[11px] px-2.5 py-1">
                  HSM Geofence Armed
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-3xl">
                Cryptographic custody handoffs, real-time vehicular GPS geofencing, tamper-evident RFID e-seals, and dual-signatory dispatch gates across inter-branch bullion vaults.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleModalOpen(true)}
                className="border-surface-border hover:border-gold/40 hover:bg-gold/5 font-mono text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Schedule Transfer</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDualCustodyModalOpen(true)}
                className="border-gold/40 text-gold hover:bg-gold/10 font-mono text-xs"
              >
                <ShieldAlert className="w-4 h-4 mr-1 text-gold" />
                <span>Dual-Custody Dispatch Gate</span>
              </Button>

              <Button
                variant="gold"
                size="sm"
                onClick={handleDualSignDispatch}
                disabled={isSigningDispatch}
                isLoading={isSigningDispatch}
                className="font-mono text-xs font-semibold shadow-lg shadow-gold/20"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Dual-Sign Transit Dispatch</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card
              key={kpi.id}
              className="relative overflow-hidden p-4 rounded-xl bg-surface-card/90 border border-surface-border/80 hover:border-gold/40 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground font-medium">
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
            {/* Luxury Filter & Search Toolbar */}
            <div className="bg-surface-card/90 border border-surface-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm backdrop-blur-md">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter by Manifest ID, Vehicle Plate, Electronic Seal ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-surface-elevated border-surface-border font-mono text-xs h-9 rounded-lg"
                />
              </div>

              <div className="flex items-center p-1 bg-surface-elevated rounded-lg border border-surface-border/60 gap-1 overflow-x-auto">
                {(["ALL", "DELHI", "ATELIER", "BANGALORE"] as const).map(
                  (key) => {
                    const labels: Record<string, string> = {
                      ALL: "All Dispatches",
                      DELHI: "Delhi Safe",
                      ATELIER: "Surat Atelier",
                      BANGALORE: "Bangalore Showroom",
                    };
                    return (
                      <button
                        key={key}
                        onClick={() => setFilterState(key)}
                        className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                          filterState === key
                            ? "bg-gold text-obsidian font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-card/60"
                        }`}
                      >
                        {labels[key]}
                      </button>
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

        {/* High-Assurance Dual-Custody Armored Dispatch Modal */}
        <DualCustodyDispatchModal
          isOpen={isDualCustodyModalOpen}
          onClose={() => setIsDualCustodyModalOpen(false)}
          activeManifests={manifests}
          onDispatched={(newManifest) => {
            setManifests((prev) => [newManifest, ...prev]);
            setSelectedItem(newManifest.items[0]);
            setSelectedRouteTitle(newManifest.routeTitle);
            setSelectedCarrierPlate(newManifest.carrierPlate);
          }}
        />
      </div>
    </AppShell>
  );
}
