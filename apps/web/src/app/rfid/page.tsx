"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import { RfidTagCard, RfidPieceData } from "../../components/rfid/RfidTagCard";
import {
  ScanTraySection,
  ScanTrayData,
} from "../../components/rfid/ScanTraySection";
import { TagMetrologyInspector } from "../../components/rfid/TagMetrologyInspector";
import { ManualTagModal } from "../../components/rfid/ManualTagModal";
import {
  Radio,
  Wifi,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Search,
  Plus,
  RotateCw,
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

const INITIAL_TRAYS: ScanTrayData[] = [
  {
    id: "tray-01",
    trayNumber: "TRAY-SR-01",
    trayName: "Tray #01: High-Jewellery Solitaire Rings",
    location: "Showroom Display Counter A",
    expectedCount: 42,
    detectedCount: 41,
    totalWeightGrams: 248.85,
    status: "DISCREPANCY",
    pieces: [
      {
        id: "rfid-sol-01",
        epcTag: "EPC-E280-1160-9941",
        serialNumber: "JC-SOL-2026-081",
        itemName: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)",
        category: "Solitaire Rings",
        metalPurity: "18K White Gold (Au 750)",
        grossWeightGrams: 5.42,
        netGoldGrams: 5.116,
        diamondCarat: 1.52,
        status: "VERIFIED",
        rssiDbm: -42,
        antennaPort: 2,
        readCount: 142,
        frequencyMhz: 866.5,
        phaseAngleDeg: 142.8,
        expectedLocation: "Showroom Counter A, Tray 01, Slot 01",
        lastScannedAt: "15:20:11",
      },
      {
        id: "rfid-sol-02",
        epcTag: "EPC-E280-1160-9942",
        serialNumber: "JC-SOL-2026-082",
        itemName: "18K Cushion Halo Ring (2.01ct D-VVS2)",
        category: "Solitaire Rings",
        metalPurity: "18K Yellow Gold (Au 750)",
        grossWeightGrams: 6.84,
        netGoldGrams: 6.438,
        diamondCarat: 2.01,
        status: "VERIFIED",
        rssiDbm: -39,
        antennaPort: 2,
        readCount: 156,
        frequencyMhz: 866.5,
        phaseAngleDeg: 98.4,
        expectedLocation: "Showroom Counter A, Tray 01, Slot 02",
        lastScannedAt: "15:20:11",
      },
      {
        id: "rfid-sol-03",
        epcTag: "EPC-E280-1160-9943",
        serialNumber: "JC-SOL-2026-083",
        itemName: "Platinum 950 Emerald-Cut Solitaire (2.50ct)",
        category: "Solitaire Rings",
        metalPurity: "Platinum (Pt 950)",
        grossWeightGrams: 8.12,
        netGoldGrams: 0.0,
        diamondCarat: 2.5,
        status: "MISSING",
        rssiDbm: undefined,
        antennaPort: 2,
        readCount: 0,
        frequencyMhz: 866.5,
        phaseAngleDeg: 0,
        expectedLocation: "Showroom Counter A, Tray 01, Slot 03",
        lastScannedAt: "Morning Handover (10:00:00)",
      },
    ],
  },
  {
    id: "tray-02",
    trayNumber: "TRAY-SR-02",
    trayName: "Tray #02: Temple Kundan Chokers & Polki",
    location: "Showroom Display Counter B",
    expectedCount: 12,
    detectedCount: 12,
    totalWeightGrams: 580.4,
    status: "SYNCHRONIZED",
    pieces: [
      {
        id: "rfid-chk-01",
        epcTag: "EPC-E280-1160-9951",
        serialNumber: "JC-CHK-2026-014",
        itemName: "22K Antique Heritage Jadau Polki Choker",
        category: "Bridal Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 54.2,
        netGoldGrams: 46.85,
        diamondCarat: 6.5,
        status: "VERIFIED",
        rssiDbm: -35,
        antennaPort: 1,
        readCount: 198,
        frequencyMhz: 866.5,
        phaseAngleDeg: 45.2,
        expectedLocation: "Showroom Counter B, Tray 02, Slot 01",
        lastScannedAt: "15:20:12",
      },
    ],
  },
];

export default function RfidKioskPage() {
  const [trays, setTrays] = useState<ScanTrayData[]>(INITIAL_TRAYS);
  const [selectedPiece, setSelectedPiece] = useState<RfidPieceData | null>(
    INITIAL_TRAYS[0].pieces[0],
  );
  const [selectedTrayName, setSelectedTrayName] = useState<string>(
    INITIAL_TRAYS[0].trayName,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isFullSweeping, setIsFullSweeping] = useState(false);

  // Compute metrics
  const totalExpected = trays.reduce((acc, t) => acc + t.expectedCount, 0);
  const totalDetected = trays.reduce((acc, t) => acc + t.detectedCount, 0);
  const totalDiscrepancies = totalExpected - totalDetected;
  const matchRate =
    totalExpected > 0 ? Math.round((totalDetected / totalExpected) * 100) : 100;
  const totalWeight = trays.reduce((acc, t) => acc + t.totalWeightGrams, 0);

  const rfidKpiItems: KpiItem[] = [
    {
      id: "kpi-detected",
      title: "RFID Tags Detected",
      value: `${totalDetected} / ${totalExpected}`,
      subValue: `${matchRate}% Match Rate Verified`,
      badge: { text: `${matchRate}%`, variant: "emerald" },
      icon: <Radio className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-discrepancies",
      title: "Discrepancy / Flagged",
      value: `${totalDiscrepancies} Flagged`,
      subValue:
        totalDiscrepancies > 0 ? "Missing from Tray #01" : "All Reconciled",
      badge: {
        text: totalDiscrepancies > 0 ? "Alert" : "Clean",
        variant: totalDiscrepancies > 0 ? "rose" : "emerald",
      },
      icon: <AlertTriangle className="w-3.5 h-3.5 text-status-rose" />,
    },
    {
      id: "kpi-weight",
      title: "Load Cell Total Weight",
      value: `${totalWeight.toFixed(3)} g`,
      subValue: "Mettler Toledo ±0.001g synced",
      badge: { text: "Tare Synced", variant: "gold" },
      icon: <Scale className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-rssi",
      title: "Antenna RSSI Signal",
      value: "-42 dBm Avg",
      subValue: "Zero cross-talk isolation",
      badge: { text: "4 Ports", variant: "secondary" },
      icon: <Wifi className="w-3.5 h-3.5 text-status-indigo" />,
    },
  ];

  const filteredTrays = trays.map((tray) => {
    let pieces = tray.pieces;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pieces = pieces.filter(
        (p) =>
          p.epcTag.toLowerCase().includes(q) ||
          p.serialNumber.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q),
      );
    }
    if (filterState === "MISSING") {
      pieces = pieces.filter((p) => p.status === "MISSING");
    }
    return { ...tray, pieces };
  });

  const handleSelectPiece = (piece: RfidPieceData, tray: ScanTrayData) => {
    setSelectedPiece(piece);
    setSelectedTrayName(tray.trayName);
  };

  const handleTriggerFullSweep = () => {
    setIsFullSweeping(true);
    setTimeout(() => {
      setIsFullSweeping(false);
      toast.success("360° Antenna Sweep Completed", {
        description:
          "53 tags interrogated across 4 ports in 280ms. Signal map updated.",
      });
    }, 900);
  };

  const handleRegisterManualTag = (
    newPiece: RfidPieceData,
    targetTrayId: string,
  ) => {
    setTrays((prev) =>
      prev.map((tray) => {
        if (tray.id === targetTrayId) {
          return {
            ...tray,
            expectedCount: tray.expectedCount + 1,
            detectedCount: tray.detectedCount + 1,
            totalWeightGrams: tray.totalWeightGrams + newPiece.grossWeightGrams,
            pieces: [newPiece, ...tray.pieces],
          };
        }
        return tray;
      }),
    );
    setSelectedPiece(newPiece);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Top Subheader: Breadcrumbs, RFID Telemetry & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                RFID Telemetry &amp; Mesh
              </span>
              <Badge variant="emerald" dot className="ml-2">
                Impinj Speedway R420 UHF • 4-Antenna Matrix Active
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Real-Time RFID Showroom &amp; Bulk Vault Scan Kiosk
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsManualModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Manual Tag Intake</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleTriggerFullSweep}
              isLoading={isFullSweeping}
            >
              <RotateCw className="w-3.5 h-3.5 mr-1" />
              <span>360° Antenna Sweep</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <WorkstationKpiGrid items={rfidKpiItems} />

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <TagMetrologyInspector
              item={selectedPiece}
              parentTrayName={selectedTrayName}
              onClose={() => setSelectedPiece(null)}
              onReSweep={handleTriggerFullSweep}
            />
          }
        >
          {/* Left Column (65%): Trays & Piece Matrix */}
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by EPC Tag, SKU, Jewellery Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: `All Tags (${totalExpected})` },
                  {
                    id: "MISSING",
                    label: `Discrepancies (${totalDiscrepancies})`,
                  },
                  { id: "SHOWROOM", label: "Showroom Trays" },
                  { id: "VAULT", label: "Vault Drawers" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFilterState(id)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all whitespace-nowrap ${
                      filterState === id
                        ? "bg-gold text-black font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground bg-surface-elevated border border-surface-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Hierarchical Trays */}
            <div className="space-y-4">
              {filteredTrays.map((tray, idx) => (
                <ScanTraySection
                  key={tray.id}
                  tray={tray}
                  defaultExpanded={idx === 0 || tray.status === "DISCREPANCY"}
                  selectedTagId={selectedPiece?.id}
                  onSelectPiece={(piece, t) => handleSelectPiece(piece, t)}
                />
              ))}

              {filteredTrays.every((t) => t.pieces.length === 0) && (
                <Card className="text-center py-12 text-muted-foreground text-xs">
                  No matching RFID tag records found.
                </Card>
              )}
            </div>
          </div>
        </WorkstationLayout>

        {/* Modal for Manual Tag Intake */}
        <ManualTagModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onRegistered={handleRegisterManualTag}
        />
      </div>
    </AppShell>
  );
}
