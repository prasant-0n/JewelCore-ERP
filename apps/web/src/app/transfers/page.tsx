"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
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
  Truck,
  ShieldCheck,
  Lock,
  Search,
  Plus,
  Radio,
  MapPin,
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
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
    INITIAL_MANIFESTS[0].items[0]
  );
  const [selectedRouteTitle, setSelectedRouteTitle] = useState<string>(
    INITIAL_MANIFESTS[0].routeTitle
  );
  const [selectedCarrierPlate, setSelectedCarrierPlate] = useState<string>(
    INITIAL_MANIFESTS[0].carrierPlate
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSigningDispatch, setIsSigningDispatch] = useState(false);
  const [dispatchNotification, setDispatchNotification] = useState<
    string | null
  >(null);

  // Compute metrics
  const activeDispatchesCount = 4;
  const sealedPiecesCount = 186;
  const etaCompliance = "99.4% On-Schedule";
  const securityBreaches = 0;

  // Filter manifests
  const filteredManifests = manifests.map((manifest) => {
    let items = manifest.items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.itemCode.toLowerCase().includes(q) ||
          i.trayDescription.toLowerCase().includes(q) ||
          i.electronicSealId.toLowerCase().includes(q)
      );
    }
    if (filterState === "DELHI") {
      items = items.filter((i) => manifest.destinationVault.toLowerCase().includes("delhi"));
    } else if (filterState === "ATELIER") {
      items = items.filter((i) => manifest.routeTitle.toLowerCase().includes("surat"));
    } else if (filterState === "BANGALORE") {
      items = items.filter((i) => manifest.destinationVault.toLowerCase().includes("bangalore"));
    }
    return { ...manifest, items };
  });

  const handleSelectItem = (
    item: ConsignmentItemData,
    manifest: ManifestGroupData
  ) => {
    setSelectedItem(item);
    setSelectedRouteTitle(manifest.routeTitle);
    setSelectedCarrierPlate(manifest.carrierPlate);
  };

  const handleDualSignDispatch = async () => {
    setIsSigningDispatch(true);
    setDispatchNotification(
      "Signing outward cryptographic vault handover token • Armored fleet escort protocol armed..."
    );

    await new Promise((res) => setTimeout(res, 1200));

    setIsSigningDispatch(false);
    setDispatchNotification(
      "Dispatch Dual-Signed! Brinks Armored Van #04 cleared for departure via National Highway 48."
    );
    setTimeout(() => setDispatchNotification(null), 4000);
  };

  const handleScheduledItem = (
    newItem: ConsignmentItemData,
    targetManifestId: string
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
      })
    );
    setSelectedItem(newItem);
    const found = manifests.find((m) => m.id === targetManifestId);
    if (found) {
      setSelectedRouteTitle(found.routeTitle);
      setSelectedCarrierPlate(found.carrierPlate);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/60">
              <span>JewelCore ERP</span>
              <span>/</span>
              <span>Logistics & Fleet Custody</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Inter-Branch Transfers & Armored Transit
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Armored Fleet Tracking & Dual-Custody Manifests</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Brinks Armored Van #MH-01-BX-9021 • GPS / Cellular Gate Locked • Latency 12ms
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-platinum/70" />
              <span>+ Schedule Armored Transfer</span>
            </button>

            <button
              onClick={handleDualSignDispatch}
              disabled={isSigningDispatch}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck
                className={`w-4 h-4 text-obsidian ${
                  isSigningDispatch ? "animate-pulse" : ""
                }`}
              />
              <span>
                {isSigningDispatch
                  ? "Signing Vault Transit..."
                  : "Dual-Sign Vault Transit Dispatch"}
              </span>
            </button>
          </div>
        </div>

        {/* Dispatch Status Notification Banner */}
        {dispatchNotification && (
          <div className="p-3 rounded-xl bg-surface-card border border-gold/40 flex items-center justify-between text-xs font-mono text-gold animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>{dispatchNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Geofence Armed
            </span>
          </div>
        )}

        {/* 4 Metric KPI Cards matching Screen 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Active In-Transit Shipments</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {activeDispatchesCount} Dispatches
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>₹ 18.42 Cr Specie Insured</span>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Custody Sealed Pieces</span>
              <Lock className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-gold tracking-tight">
              {sealedPiecesCount} Pieces
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              100% RFID Tamper-Taped
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Transit ETA Compliance</span>
              <MapPin className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              {etaCompliance}
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              GPS Geofenced Corridor
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Security Incidents</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {securityBreaches} Breach Alerts
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Armored Escort Guard Active
            </div>
          </div>
        </div>

        {/* Master Workspace: 65% Directory + 35% Sticky Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (65% -> col-span-12 lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-platinum/50" />
                <input
                  type="text"
                  placeholder="Filter by Manifest ID, Vehicle Plate, Electronic Seal ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-slate-100 placeholder:text-platinum/40 focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono">
                <button
                  onClick={() => setFilterState("ALL")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "ALL"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  All Dispatches
                </button>
                <button
                  onClick={() => setFilterState("DELHI")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "DELHI"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Delhi Safe
                </button>
                <button
                  onClick={() => setFilterState("ATELIER")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "ATELIER"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Surat Atelier
                </button>
                <button
                  onClick={() => setFilterState("BANGALORE")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "BANGALORE"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Bangalore Showroom
                </button>
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
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <Truck className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching transit consignments found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or schedule a new armored transfer.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <TransitSecurityInspector
              item={selectedItem}
              parentRouteTitle={selectedRouteTitle}
              carrierPlate={selectedCarrierPlate}
              onClose={() => setSelectedItem(null)}
              onAcknowledgeDeSeal={(item) => {
                // Update item status to DE_SEALED
                setManifests((prev) =>
                  prev.map((m) => ({
                    ...m,
                    items: m.items.map((i) =>
                      i.id === item.id
                        ? { ...i, status: "DE_SEALED" as const }
                        : i
                    ),
                  }))
                );
                setSelectedItem((prev) =>
                  prev ? { ...prev, status: "DE_SEALED" } : null
                );
              }}
            />
          </div>
        </div>

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
