"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import { IngotBarItem } from "../../components/procurement/IngotBarCard";
import {
  ShipmentSection,
  ShipmentData,
} from "../../components/procurement/ShipmentSection";
import { IngotInspector } from "../../components/procurement/IngotInspector";
import { NewShipmentModal } from "../../components/procurement/NewShipmentModal";
import {
  Truck,
  Scale,
  FlaskConical,
  Coins,
  Search,
  Plus,
  Radio,
  FileSpreadsheet,
} from "lucide-react";

// Mock Inbound Shipments replicating approved Stitch design
const INITIAL_SHIPMENTS: ShipmentData[] = [
  {
    id: "shp-842",
    shipmentNumber: "Shipment SHP-2026-0842",
    supplierName: "Valcambi Suisse LBMA Delivery",
    trackingNumber: "LX-94022",
    totalWeightGrams: 3000.12,
    sealNumber: "TS-8821",
    isLbmaCertified: true,
    status: "QUARANTINED",
    ingots: [
      {
        id: "ingot-01",
        barCode: "VAL-BAR-01",
        materialType: "999.9 Fine Gold Cast Ingot",
        fineness: "999.9",
        grossWeightGrams: 1000.042,
        invoiceWeightGrams: 1000.0,
        varianceGrams: 0.042,
        variancePercent: 0.004,
        toleranceStatus: "TOLERANCE_OK",
        status: "QUARANTINED",
        containmentPath: "Vault 03 > Locker 05 > Tray Q1",
        lastUpdated: "Just now",
      },
      {
        id: "ingot-02",
        barCode: "VAL-BAR-02",
        materialType: "999.9 Fine Gold Cast Ingot",
        fineness: "999.9",
        grossWeightGrams: 1000.038,
        invoiceWeightGrams: 1000.0,
        varianceGrams: 0.038,
        variancePercent: 0.004,
        toleranceStatus: "TOLERANCE_OK",
        status: "QUARANTINED",
        containmentPath: "Vault 03 > Locker 05 > Tray Q1",
        lastUpdated: "8 mins ago",
      },
      {
        id: "ingot-03",
        barCode: "VAL-BAR-03",
        materialType: "999.9 Fine Gold Cast Ingot",
        fineness: "999.9",
        grossWeightGrams: 1000.04,
        invoiceWeightGrams: 1000.0,
        varianceGrams: 0.04,
        variancePercent: 0.004,
        toleranceStatus: "TOLERANCE_OK",
        status: "QUARANTINED",
        containmentPath: "Vault 03 > Locker 05 > Tray Q1",
        lastUpdated: "12 mins ago",
      },
    ],
  },
  {
    id: "shp-843",
    shipmentNumber: "Shipment SHP-2026-0843",
    supplierName: "MMTC-PAMP Pure Gold Shot / Grain",
    trackingNumber: "IN-88910",
    totalWeightGrams: 5000.0,
    sealNumber: "TS-8819",
    isLbmaCertified: true,
    status: "ASSAY_VERIFIED",
    ingots: [
      {
        id: "ingot-04",
        barCode: "PAMP-DRUM-01",
        materialType: "Au 999.9 Granulated Shot Drum A",
        fineness: "999.9",
        grossWeightGrams: 2500.0,
        invoiceWeightGrams: 2500.0,
        varianceGrams: 0.0,
        variancePercent: 0.0,
        toleranceStatus: "TOLERANCE_OK",
        status: "ASSAY_VERIFIED",
        containmentPath: "Vault 01 > Locker 01 > Steel Drum A",
        lastUpdated: "1 hour ago",
      },
      {
        id: "ingot-05",
        barCode: "PAMP-DRUM-02",
        materialType: "Au 999.9 Granulated Shot Drum B",
        fineness: "999.9",
        grossWeightGrams: 2500.0,
        invoiceWeightGrams: 2500.0,
        varianceGrams: 0.0,
        variancePercent: 0.0,
        toleranceStatus: "TOLERANCE_OK",
        status: "ASSAY_VERIFIED",
        containmentPath: "Vault 01 > Locker 01 > Steel Drum B",
        lastUpdated: "1 hour ago",
      },
    ],
  },
  {
    id: "shp-844",
    shipmentNumber: "Shipment SHP-2026-0844",
    supplierName: "Argor-Heraeus Cast Dore Bars",
    trackingNumber: "CH-22198",
    totalWeightGrams: 4449.88,
    sealNumber: "TS-8825",
    isLbmaCertified: true,
    status: "IN_TRANSIT",
    ingots: [
      {
        id: "ingot-06",
        barCode: "AH-DORE-01",
        materialType: "Au 995.0 Unrefined Dore Bar",
        fineness: "995.0",
        grossWeightGrams: 4449.88,
        invoiceWeightGrams: 4450.0,
        varianceGrams: -0.12,
        variancePercent: -0.003,
        toleranceStatus: "TOLERANCE_OK",
        status: "IN_TRANSIT",
        containmentPath: "Armored Transit Van #BR-09",
        lastUpdated: "In Transit",
      },
    ],
  },
];

export default function ProcurementPage() {
  const [shipments, setShipments] = useState<ShipmentData[]>(INITIAL_SHIPMENTS);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "QUARANTINED" | "ASSAY_VERIFIED" | "IN_TRANSIT"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngot, setSelectedIngot] = useState<IngotBarItem | null>(
    INITIAL_SHIPMENTS[0].ingots[0]
  );
  const [selectedShipmentName, setSelectedShipmentName] = useState<string>(
    INITIAL_SHIPMENTS[0].shipmentNumber + " > " + INITIAL_SHIPMENTS[0].supplierName
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic filter
  const filteredShipments = shipments
    .filter((shp) => {
      if (activeFilter === "ALL") return true;
      return shp.status === activeFilter;
    })
    .map((shp) => ({
      ...shp,
      ingots: shp.ingots.filter((ingot) => {
        const matchesQuery =
          searchQuery.trim() === "" ||
          ingot.barCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shp.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shp.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
      }),
    }))
    .filter((shp) => shp.ingots.length > 0);

  const handleSelectIngot = (ingot: IngotBarItem, shipment: ShipmentData) => {
    setSelectedIngot(ingot);
    setSelectedShipmentName(shipment.shipmentNumber + " > " + shipment.supplierName);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/70 uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Inward Procurement &amp; Bullion Ingestion
              </span>
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mettler Toledo RS-232 Scale Sync • 0.001g Calibrated
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Inward Procurement &amp; Ingot Intake Directory
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-surface-card border border-surface-border text-xs font-medium text-slate-200 hover:border-gold/50 hover:text-gold flex items-center space-x-1.5 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-platinum/60" />
              <span>+ Log Inbound Shipment</span>
            </button>
            <button
              onClick={() => alert("Auto-Tare scale baseline re-zeroed (0.000 g).")}
              className="px-3.5 py-1.5 rounded-md bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Auto-Tare Scale</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards (Matching Screen 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Inbound Batches */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Inbound Shipments
              </span>
              <Truck className="w-4 h-4 text-gold/70" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-slate-100">
                3 Batches Active
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                Valcambi, MMTC-PAMP, Argor-Heraeus
              </p>
            </div>
          </div>

          {/* Metric 2: Fine Gold Intake */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Fine Gold Intake
              </span>
              <Scale className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-gold-light tabular-nums">
                12,450.000 <span className="text-sm font-sans font-normal text-platinum">g</span>
              </div>
              <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                <span>● Au 999.9 Net Fine Recorded</span>
              </p>
            </div>
          </div>

          {/* Metric 3: Quarantined for QC */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Quarantined for QC
              </span>
              <FlaskConical className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-amber-300">
                2 Lots Pending
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                Awaiting Assay Clearance in QC Safe
              </p>
            </div>
          </div>

          {/* Metric 4: Procurement Value */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Procurement Value
              </span>
              <Coins className="w-4 h-4 text-gold/80" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-100">
                ₹90,138,000
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                Spot locked @ ₹7,240/g refiner base
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace (Matching Screen 2: 65% Left / 35% Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column (8 of 12 spans = 65%): Inbound Lots & Shipments Directory */}
          <div className="xl:col-span-8 space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-card p-3 rounded-xl border border-surface-border shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-platinum/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Ingot ID, Waybill, Assay Batch, or Refiner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-obsidian-deep border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-platinum/40 focus:outline-none focus:border-gold/60 transition-colors"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Batches" },
                  { id: "QUARANTINED", label: "Quarantined" },
                  { id: "ASSAY_VERIFIED", label: "Assay Verified" },
                  { id: "IN_TRANSIT", label: "Active Inward" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id as any)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all whitespace-nowrap ${
                      activeFilter === id
                        ? "bg-gold text-obsidian font-bold shadow-sm"
                        : "text-platinum/70 hover:text-slate-100 bg-obsidian-deep border border-surface-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inbound Shipment Cards */}
            {filteredShipments.length === 0 ? (
              <div className="text-center py-12 bg-surface-card border border-surface-border rounded-xl text-platinum/50 text-xs">
                No inbound bullion shipments match your filter criteria.
              </div>
            ) : (
              filteredShipments.map((shipment, idx) => (
                <ShipmentSection
                  key={shipment.id}
                  shipment={shipment}
                  selectedIngotId={selectedIngot?.id}
                  onSelectIngot={handleSelectIngot}
                  defaultExpanded={idx === 0}
                />
              ))
            )}
          </div>

          {/* Right Column (4 of 12 spans = 35%): Selected Ingot Lot Inspector */}
          <div className="xl:col-span-4 sticky top-6 self-start h-[calc(100vh-140px)]">
            <IngotInspector
              ingot={selectedIngot}
              parentShipmentName={selectedShipmentName}
            />
          </div>
        </div>

        {/* Inbound Shipment Intake Modal */}
        <NewShipmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            // refresh data
          }}
        />
      </div>
    </AppShell>
  );
}
