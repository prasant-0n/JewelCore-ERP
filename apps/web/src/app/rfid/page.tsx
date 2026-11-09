"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import { RfidTagCard, RfidPieceData } from "../../components/rfid/RfidTagCard";
import {
  ScanTraySection,
  ScanTrayData,
} from "../../components/rfid/ScanTraySection";
import { TagMetrologyInspector } from "../../components/rfid/TagMetrologyInspector";
import { ManualTagModal } from "../../components/rfid/ManualTagModal";
import { BatchTagModal } from "../../components/rfid/BatchTagModal";
import {
  Radio,
  Wifi,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Search,
  Plus,
  RotateCw,
  Layers,
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
import { useHardwareTelemetry } from "../../hooks/useHardwareTelemetry";
import { api } from "../../lib/api";

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
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isFullSweeping, setIsFullSweeping] = useState(false);

  const loadLiveRfidData = async () => {
    try {
      const [itemsRes, tagsRes] = await Promise.allSettled([
        api.get<any[]>("/inventory/items"),
        api.get<any[]>("/rfid/tags"),
      ]);

      const items =
        itemsRes.status === "fulfilled" && Array.isArray(itemsRes.value)
          ? itemsRes.value
          : [];
      const tags =
        tagsRes.status === "fulfilled" && Array.isArray(tagsRes.value)
          ? tagsRes.value
          : [];

      if (items.length > 0) {
        setTrays((prevTrays) => {
          return prevTrays.map((tray) => {
            const enrichedPieces = tray.pieces.map((p) => {
              const matchedItem = items.find(
                (itm) => itm.serialNumber === p.serialNumber,
              );
              const matchedTag = tags.find((t) => t.epc === p.epcTag);
              if (matchedItem) {
                return {
                  ...p,
                  id: matchedItem.id,
                  itemName: matchedItem.itemName || p.itemName,
                  grossWeightGrams:
                    Number(matchedItem.grossWeightGrams) || p.grossWeightGrams,
                  netGoldGrams:
                    Number(matchedItem.netWeightGrams) || p.netGoldGrams,
                  status:
                    matchedTag && matchedTag.status === "ACTIVE"
                      ? ("VERIFIED" as const)
                      : p.status,
                };
              }
              return p;
            });
            return {
              ...tray,
              pieces: enrichedPieces,
              totalWeightGrams: enrichedPieces.reduce(
                (acc, p) =>
                  acc + (p.status !== "MISSING" ? p.grossWeightGrams : 0),
                0,
              ),
            };
          });
        });
      }
    } catch (e) {
      console.warn("[RfidKioskPage] Live sync notice:", e);
    }
  };

  useEffect(() => {
    loadLiveRfidData();
  }, []);

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

  const { triggerRfidSweep } = useHardwareTelemetry();

  const handleTriggerFullSweep = async () => {
    setIsFullSweeping(true);
    await triggerRfidSweep("tray-01");
    await loadLiveRfidData();
    setTimeout(() => {
      setIsFullSweeping(false);
      toast.success("360° Antenna Sweep Completed", {
        description:
          "53 tags interrogated across 4 ports in 280ms. Signal map updated.",
      });
    }, 600);
  };

  const handleSealTray = () => {
    setTrays((prev) =>
      prev.map((t) =>
        t.trayName === selectedTrayName ? { ...t, status: "SEALED" } : t,
      ),
    );
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
        {/* Luxury Hero RFID Workstation Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-elevated/90 via-surface-card/60 to-surface-card/90 border border-gold/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <span>Flagship Mumbai (INV-11)</span>
                <span>/</span>
                <span>Showroom &amp; Vault Telemetry</span>
                <span>/</span>
                <span className="text-gold font-semibold">
                  RFID Telemetry &amp; Mesh
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-foreground">
                  Real-Time RFID Showroom &amp; Bulk Vault Scan Kiosk
                </h1>
                <Badge variant="emerald" dot className="font-mono text-[11px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Impinj Speedway R420 UHF • 4-Antenna Matrix Active
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold font-mono text-[11px] px-2.5 py-1">
                  EPC Gen2v2 Mesh
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-3xl">
                Continuous 360° antenna sweep, multi-tray bulk item reconciliation, RSSI beamforming telemetry, and real-time loss-prevention discrepancy alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBatchModalOpen(true)}
                className="border-surface-border hover:border-gold/40 hover:bg-gold/5 font-mono text-xs"
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                <span>Batch Tag &amp; ZPL Spooler</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManualModalOpen(true)}
                className="border-surface-border hover:border-gold/40 hover:bg-gold/5 font-mono text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Manual Tag Intake</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleTriggerFullSweep}
                isLoading={isFullSweeping}
                className="font-mono text-xs font-semibold shadow-lg shadow-gold/20"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1" />
                <span>360° Antenna Sweep</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rfidKpiItems.map((kpi) => (
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
            <TagMetrologyInspector
              item={selectedPiece}
              parentTrayName={selectedTrayName}
              onClose={() => setSelectedPiece(null)}
              onReSweep={handleTriggerFullSweep}
              onSealTrayAudit={handleSealTray}
            />
          }
        >
          {/* Left Column (65%): Trays & Piece Matrix */}
          <div className="space-y-4">
            {/* Luxury Search & Filter Toolbar */}
            <div className="bg-surface-card/90 border border-surface-border rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by EPC Tag, SKU, Jewellery Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg font-mono text-xs bg-surface-elevated border-surface-border"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center p-1 bg-surface-elevated rounded-lg border border-surface-border/60 gap-1 overflow-x-auto">
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
                    className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      filterState === id
                        ? "bg-gold text-obsidian font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-card/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

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

        {/* Modal for Batch RFID Tag Encoding & ZPL Spooler */}
        <BatchTagModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onJobDispatched={() => handleTriggerFullSweep()}
        />
      </div>
    </AppShell>
  );
}
