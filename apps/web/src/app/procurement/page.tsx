"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import { IngotBarItem } from "../../components/procurement/IngotBarCard";
import {
  ShipmentSection,
  ShipmentData,
} from "../../components/procurement/ShipmentSection";
import { IngotInspector } from "../../components/procurement/IngotInspector";
import { NewShipmentModal } from "../../components/procurement/NewShipmentModal";
import { Truck, Scale, FlaskConical, Coins, Search, Plus } from "lucide-react";
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
import { useHardwareTelemetry } from "../../hooks/useHardwareTelemetry";

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

const PROCUREMENT_KPIS: KpiItem[] = [
  {
    id: "kpi-shipments",
    title: "Inbound Shipments",
    value: "3 Batches Active",
    subValue: "Valcambi, MMTC-PAMP, Argor-Heraeus",
    badge: { text: "Intake", variant: "gold" },
    icon: <Truck className="w-3.5 h-3.5 text-gold" />,
  },
  {
    id: "kpi-fine-gold",
    title: "Fine Gold Intake",
    value: "12,450.000 g",
    subValue: "Au 999.9 Net Fine Recorded",
    badge: { text: "Au 999.9", variant: "emerald" },
    icon: <Scale className="w-3.5 h-3.5 text-status-emerald" />,
  },
  {
    id: "kpi-quarantined",
    title: "Quarantined for QC",
    value: "2 Lots Pending",
    subValue: "Awaiting Assay Clearance in QC Safe",
    badge: { text: "Pending Assay", variant: "amber" },
    icon: <FlaskConical className="w-3.5 h-3.5 text-status-amber" />,
  },
  {
    id: "kpi-valuation",
    title: "Procurement Value",
    value: "₹9,28,77,500",
    subValue: "Spot locked @ ₹7,450/g refiner base",
    badge: { text: "Hedged", variant: "secondary" },
    icon: <Coins className="w-3.5 h-3.5 text-foreground" />,
  },
];

export default function ProcurementPage() {
  const [shipments, setShipments] = useState<ShipmentData[]>(INITIAL_SHIPMENTS);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "QUARANTINED" | "ASSAY_VERIFIED" | "IN_TRANSIT"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngot, setSelectedIngot] = useState<IngotBarItem | null>(
    INITIAL_SHIPMENTS[0].ingots[0],
  );
  const [selectedShipmentName, setSelectedShipmentName] = useState<string>(
    INITIAL_SHIPMENTS[0].shipmentNumber +
      " > " +
      INITIAL_SHIPMENTS[0].supplierName,
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
    setSelectedShipmentName(
      shipment.shipmentNumber + " > " + shipment.supplierName,
    );
  };

  const { tareScale } = useHardwareTelemetry();

  const handleTareScale = async () => {
    await tareScale();
    toast.success("Scale Calibrated", {
      description:
        "Auto-Tare baseline re-zeroed (0.0000g). RS-232 telemetry live.",
    });
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Inward Procurement &amp; Bullion Ingestion
              </span>
              <Badge variant="emerald" dot className="ml-1 sm:ml-2">
                Mettler Toledo RS-232 Scale Sync • 0.001g Calibrated
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
              Inward Procurement &amp; Ingot Intake Directory
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Truck className="w-3.5 h-3.5 mr-1" />
              <span>Log Inbound Shipment</span>
            </Button>
            <Button variant="gold" size="sm" onClick={handleTareScale}>
              <Scale className="w-3.5 h-3.5 mr-1" />
              <span>Auto-Tare Scale</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <WorkstationKpiGrid items={PROCUREMENT_KPIS} />

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <IngotInspector
              ingot={selectedIngot}
              parentShipmentName={selectedShipmentName}
            />
          }
        >
          {/* Left Column (65%): Inbound Lots & Shipments Directory */}
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Ingot ID, Waybill, Assay Batch, or Refiner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
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
                        ? "bg-gold text-black font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground bg-surface-elevated border border-surface-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Inbound Shipment Cards */}
            {filteredShipments.length === 0 ? (
              <Card className="text-center py-12 text-muted-foreground text-xs">
                No inbound bullion shipments match your filter criteria.
              </Card>
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
        </WorkstationLayout>

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
