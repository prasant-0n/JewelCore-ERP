"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import {
  RfidTagCard,
  RfidPieceData,
} from "../../components/rfid/RfidTagCard";
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
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

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
    trayName: "Tray #02: Kundan & Polki Bridal Necklaces",
    location: "Showroom Display Counter B",
    expectedCount: 12,
    detectedCount: 12,
    totalWeightGrams: 742.6,
    status: "SYNCHRONIZED",
    pieces: [
      {
        id: "rfid-nk-01",
        epcTag: "EPC-E280-1160-8812",
        serialNumber: "JC-CHK-2026-014",
        itemName: "22K Antique Heritage Jadau Choker with Polki",
        category: "Necklaces & Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 94.65,
        netGoldGrams: 78.2,
        diamondCarat: 14.2,
        status: "VERIFIED",
        rssiDbm: -36,
        antennaPort: 1,
        readCount: 184,
        frequencyMhz: 865.7,
        phaseAngleDeg: 112.1,
        expectedLocation: "Showroom Counter B, Tray 02, Slot 01",
        lastScannedAt: "15:20:12",
      },
      {
        id: "rfid-nk-02",
        epcTag: "EPC-E280-1160-8813",
        serialNumber: "JC-CHK-2026-015",
        itemName: "18K Rose Gold Waterfall Diamond Necklace",
        category: "Necklaces & Chokers",
        metalPurity: "18K Rose Gold (Au 750)",
        grossWeightGrams: 68.3,
        netGoldGrams: 52.1,
        diamondCarat: 18.5,
        status: "VERIFIED",
        rssiDbm: -41,
        antennaPort: 1,
        readCount: 140,
        frequencyMhz: 865.7,
        phaseAngleDeg: 165.4,
        expectedLocation: "Showroom Counter B, Tray 02, Slot 02",
        lastScannedAt: "15:20:12",
      },
    ],
  },
  {
    id: "tray-03",
    trayNumber: "TRAY-VLT-04",
    trayName: "Tray #03: Royal Calcutta Filigree Bangles",
    location: "Main Vault Tray 04 (Safe C-01)",
    expectedCount: 16,
    detectedCount: 16,
    totalWeightGrams: 480.2,
    status: "SEALED",
    pieces: [
      {
        id: "rfid-bg-01",
        epcTag: "EPC-E280-1160-7711",
        serialNumber: "JC-KAD-2026-004",
        itemName: "22K Royal Filigree Kada Pair (62g Each)",
        category: "Bangles & Kadas",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 124.5,
        netGoldGrams: 124.5,
        status: "VERIFIED",
        rssiDbm: -44,
        antennaPort: 3,
        readCount: 122,
        frequencyMhz: 867.1,
        phaseAngleDeg: 88.0,
        expectedLocation: "Main Vault Safe C-01, Tray 04",
        lastScannedAt: "15:19:40",
      },
      {
        id: "rfid-bg-02",
        epcTag: "EPC-E280-1160-7712",
        serialNumber: "JC-KAD-2026-005",
        itemName: "18K White Gold Tennis Bangle (5.20ct)",
        category: "Bangles & Kadas",
        metalPurity: "18K White Gold (Au 750)",
        grossWeightGrams: 28.6,
        netGoldGrams: 27.56,
        diamondCarat: 5.2,
        status: "VERIFIED",
        rssiDbm: -40,
        antennaPort: 3,
        readCount: 138,
        frequencyMhz: 867.1,
        phaseAngleDeg: 134.2,
        expectedLocation: "Main Vault Safe C-01, Tray 04",
        lastScannedAt: "15:19:40",
      },
    ],
  },
  {
    id: "tray-04",
    trayNumber: "TRAY-ING-01",
    trayName: "Tray #04: Minted Bullion & Ingot Assay Rack",
    location: "Main Vault Ingot Compartment 01",
    expectedCount: 15,
    detectedCount: 15,
    totalWeightGrams: 15000.0,
    status: "RESTRICTED",
    pieces: [
      {
        id: "rfid-bar-01",
        epcTag: "EPC-E280-1160-5501",
        serialNumber: "VAL-BAR-01",
        itemName: "999.9 Fine Gold Cast Ingot (1000g)",
        category: "Ingots & Bullion",
        metalPurity: "24K Fine Gold (Au 999.9)",
        grossWeightGrams: 1000.04,
        netGoldGrams: 1000.04,
        status: "VERIFIED",
        rssiDbm: -35,
        antennaPort: 4,
        readCount: 210,
        frequencyMhz: 866.9,
        phaseAngleDeg: 72.0,
        expectedLocation: "Main Vault Ingot Compartment 01",
        lastScannedAt: "15:18:22",
      },
    ],
  },
];

export default function RfidKioskPage() {
  const [trays, setTrays] = useState<ScanTrayData[]>(INITIAL_TRAYS);
  const [selectedPiece, setSelectedPiece] = useState<RfidPieceData | null>(
    INITIAL_TRAYS[0].pieces[0]
  );
  const [selectedTrayName, setSelectedTrayName] = useState<string>(
    INITIAL_TRAYS[0].trayName
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isFullSweeping, setIsFullSweeping] = useState(false);
  const [sweepNotification, setSweepNotification] = useState<string | null>(null);

  // Compute summary metrics
  const totalExpected = trays.reduce((acc, t) => acc + t.expectedCount, 0);
  const totalDetected = trays.reduce((acc, t) => acc + t.detectedCount, 0);
  const totalDiscrepancies = totalExpected - totalDetected;
  const totalWeight = trays.reduce((acc, t) => acc + t.totalWeightGrams, 0);
  const matchRate = totalExpected > 0 ? ((totalDetected / totalExpected) * 100).toFixed(1) : "100";

  // Filter logic
  const filteredTrays = trays.map((tray) => {
    let pieces = tray.pieces;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pieces = pieces.filter(
        (p) =>
          p.epcTag.toLowerCase().includes(q) ||
          p.serialNumber.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q)
      );
    }
    if (filterState === "MISSING") {
      pieces = pieces.filter((p) => p.status === "MISSING");
    } else if (filterState === "SHOWROOM") {
      pieces = pieces.filter((p) => tray.location.toLowerCase().includes("showroom"));
    } else if (filterState === "VAULT") {
      pieces = pieces.filter((p) => tray.location.toLowerCase().includes("vault"));
    }
    return { ...tray, pieces };
  });

  const handleSelectPiece = (piece: RfidPieceData, tray: ScanTrayData) => {
    setSelectedPiece(piece);
    setSelectedTrayName(tray.trayName);
  };

  const handleTriggerFullSweep = async () => {
    setIsFullSweeping(true);
    setSweepNotification("Multiplexing Antenna Ports #1-#4 • Sweeping carrier frequencies 865.7 - 867.5 MHz...");

    await new Promise((res) => setTimeout(res, 1200));

    setIsFullSweeping(false);
    setSweepNotification("Full 360° Antenna Sweep Complete. 84 of 85 Tags Responding • Load Cell Weight Locked.");
    setTimeout(() => setSweepNotification(null), 4000);
  };

  const handleResolveDiscrepancy = (item: RfidPieceData) => {
    // Simulate finding the missing item via handheld wand
    setTrays((prev) =>
      prev.map((tray) => {
        const itemExists = tray.pieces.some((p) => p.id === item.id);
        if (itemExists) {
          const nextPieces = tray.pieces.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: "VERIFIED" as const,
                  rssiDbm: -46,
                  readCount: 92,
                  lastScannedAt: "Just now (Handheld Wand)",
                }
              : p
          );
          return {
            ...tray,
            detectedCount: tray.expectedCount,
            status: "SYNCHRONIZED" as const,
            pieces: nextPieces,
          };
        }
        return tray;
      })
    );

    setSelectedPiece((prev) =>
      prev
        ? {
            ...prev,
            status: "VERIFIED",
            rssiDbm: -46,
            readCount: 92,
            lastScannedAt: "Just now (Handheld Wand)",
          }
        : null
    );
  };

  const handleRegisterManualTag = (newPiece: RfidPieceData, targetTrayId: string) => {
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
      })
    );
    setSelectedPiece(newPiece);
    const foundTray = trays.find((t) => t.id === targetTrayId);
    if (foundTray) setSelectedTrayName(foundTray.trayName);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, RFID Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/60">
              <span>JewelCore ERP</span>
              <span>/</span>
              <span>RFID Telemetry & Mesh</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Kiosk Rapid Scan Workstation
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Real-Time UHF RFID Showroom & Bulk Vault Scan Kiosk</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Impinj Speedway R420 UHF • 4-Antenna Matrix Active • 99.98% Sync
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-platinum/70" />
              <span>+ Manual Tag Intake</span>
            </button>

            <button
              onClick={handleTriggerFullSweep}
              disabled={isFullSweeping}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 text-obsidian ${isFullSweeping ? "animate-spin" : ""}`} />
              <span>{isFullSweeping ? "Sweeping 360° Array..." : "Trigger 360° Antenna Sweep"}</span>
            </button>
          </div>
        </div>

        {/* Sweep Status Notification Banner */}
        {sweepNotification && (
          <div className="p-3 rounded-xl bg-surface-card border border-gold/40 flex items-center justify-between text-xs font-mono text-gold animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 animate-pulse text-gold" />
              <span>{sweepNotification}</span>
            </div>
            <span className="text-[10px] text-platinum/60">RSSI Calibrated</span>
          </div>
        )}

        {/* 4 Metric KPI Cards matching Screen 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>RFID Tags Detected</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {totalDetected} / {totalExpected} Detected
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>{matchRate}% Match Rate</span>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Discrepancy / Flagged</span>
              <AlertTriangle className={`w-4 h-4 ${totalDiscrepancies > 0 ? "text-rose-400" : "text-emerald-400"}`} />
            </div>
            <div className={`text-2xl font-bold font-mono tracking-tight ${totalDiscrepancies > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {totalDiscrepancies} Piece Flagged
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              {totalDiscrepancies > 0 ? "Missing from Tray #01" : "All Trays Reconciled"}
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Load Cell Total Weight</span>
              <Scale className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
              {totalWeight.toFixed(3)} g
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Mettler Toledo ±0.001g synced
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Antenna RSSI Signal</span>
              <Wifi className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              -42 dBm Avg
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Zero cross-talk isolation
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
                  placeholder="Filter by EPC Tag, SKU, Jewellery Title..."
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
                  All Tags ({totalExpected})
                </button>
                <button
                  onClick={() => setFilterState("MISSING")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "MISSING"
                      ? "bg-rose-500 text-slate-100 font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Discrepancies ({totalDiscrepancies})
                </button>
                <button
                  onClick={() => setFilterState("SHOWROOM")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "SHOWROOM"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Showroom Trays
                </button>
                <button
                  onClick={() => setFilterState("VAULT")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "VAULT"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Vault Drawers
                </button>
              </div>
            </div>

            {/* Hierarchical Trays & Piece Matrix Grids */}
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
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <Radio className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching RFID tag records found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or register a new tag via manual intake.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <TagMetrologyInspector
              item={selectedPiece}
              parentTrayName={selectedTrayName}
              onClose={() => setSelectedPiece(null)}
              onReSweep={() => {
                handleTriggerFullSweep();
              }}
              onResolveDiscrepancy={(piece) => {
                handleResolveDiscrepancy(piece);
              }}
              onSealTrayAudit={() => {
                setTrays((prev) =>
                  prev.map((t) =>
                    t.trayName === selectedTrayName
                      ? { ...t, status: "SEALED" as const }
                      : t
                  )
                );
              }}
            />
          </div>
        </div>

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
