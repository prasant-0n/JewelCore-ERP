"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import {
  PieceCard,
  InventoryPieceData,
} from "../../components/inventory/PieceCard";
import {
  CategorySection,
  InventoryCategoryData,
} from "../../components/inventory/CategorySection";
import { PieceLineageInspector } from "../../components/inventory/PieceLineageInspector";
import { BirthPieceModal } from "../../components/inventory/BirthPieceModal";
import { Gem, Scale, Search, Plus, Sparkles, Radio, Table2, LayoutGrid, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { LaserHallmarkBadge } from "@/components/luxury/LaserHallmarkBadge";
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

const INITIAL_CATEGORIES: InventoryCategoryData[] = [
  {
    id: "cat-solitaires",
    categoryName: "High-Jewellery Solitaire Rings",
    vaultLocation: "Main Vault • Drawer S-01",
    totalPieces: 42,
    totalGrossWeightGrams: 248.85,
    status: "LIVE_IN_STOCK",
    pieces: [
      {
        id: "pc-sol-01",
        serialNumber: "JC-SOL-2026-081",
        itemName: "18K White Gold Oval Solitaire Ring (1.52ct F-VVS1)",
        category: "Solitaire Rings",
        metalPurity: "18K White Gold (Au 750)",
        grossWeightGrams: 5.42,
        netGoldGrams: 5.116,
        diamondCarat: 1.52,
        diamondClarity: "VVS1",
        diamondColor: "F",
        giaCertNumber: "GIA-2210894511",
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 485000,
        currentLocation: "Main Vault - Compartment A-01",
        epcRfidTag: "E280-1160-2000-7741-0099",
        provenance: [
          {
            stage: "Raw Ingot Smelting & Assay Passed",
            timestamp: "2026-11-01 10:15:00",
            actor: "Refinery Station #2",
            detail:
              "Fineness 750.2 parts per 1,000 certified via Niton XL5 Plus",
          },
          {
            stage: "Master Goldsmith Handcrafting",
            timestamp: "2026-11-03 14:30:00",
            actor: "Atelier Senior Craftsman",
            detail: "Precision bezel mounting and hand micro-prong setting",
          },
          {
            stage: "Dual-Custody Hallmarking & Vault Deposit",
            timestamp: "2026-11-06 18:20:00",
            actor: "Vault Custodian M. Nair",
            detail:
              "BIS 750 Hallmark verified. RFID EPC serialized into Drawer S-01",
          },
        ],
      },
      {
        id: "pc-sol-02",
        serialNumber: "JC-SOL-2026-082",
        itemName: "18K Yellow Gold Cushion Halo Ring (2.01ct D-VVS2)",
        category: "Solitaire Rings",
        metalPurity: "18K Yellow Gold (Au 750)",
        grossWeightGrams: 6.84,
        netGoldGrams: 6.438,
        diamondCarat: 2.01,
        diamondClarity: "VVS2",
        diamondColor: "D",
        giaCertNumber: "GIA-5591230044",
        custodyState: "DISPLAY",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 890000,
        currentLocation: "Showroom Safe - Display Case #02",
        epcRfidTag: "E280-1160-2000-7741-0100",
        provenance: [
          {
            stage: "Serialized Genesis",
            timestamp: "2026-11-02 09:00:00",
            actor: "QC Lab Tech",
            detail:
              "GIA 2.01ct D-Flawless laser inscription verified under 40x microscope",
          },
        ],
      },
    ],
  },
  {
    id: "cat-bridal-chokers",
    categoryName: "Royal Polki & Kundan Bridal Chokers",
    vaultLocation: "Main Vault • Safe B-04",
    totalPieces: 14,
    totalGrossWeightGrams: 680.4,
    status: "LIVE_IN_STOCK",
    pieces: [
      {
        id: "pc-chk-01",
        serialNumber: "JC-CHK-2026-014",
        itemName: "22K Antique Heritage Jadau Polki Choker",
        category: "Bridal Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 54.2,
        netGoldGrams: 46.85,
        diamondCarat: 6.5,
        diamondClarity: "Uncut Syndicate Polki",
        diamondColor: "Natural White",
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 1250000,
        currentLocation: "Main Vault - Compartment B-04-1",
        epcRfidTag: "E280-1160-2000-7741-0101",
        provenance: [
          {
            stage: "Antique Casting & Polki Setting",
            timestamp: "2026-10-28 11:00:00",
            actor: "Jaipur Atelier Master",
            detail:
              "Natural meenakari reverse enameling and pure gold foil setting",
          },
        ],
      },
    ],
  },
];

export default function InventoryMasterPage() {
  const [categories, setCategories] =
    useState<InventoryCategoryData[]>(INITIAL_CATEGORIES);
  const [selectedPiece, setSelectedPiece] = useState<InventoryPieceData | null>(
    INITIAL_CATEGORIES[0].pieces[0],
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(
    INITIAL_CATEGORIES[0].categoryName,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);

  // Compute summary KPI metrics
  const totalPiecesCount = categories.reduce(
    (acc, cat) => acc + cat.pieces.length,
    0,
  );
  const totalValuationInr = categories.reduce(
    (acc, cat) =>
      acc + cat.pieces.reduce((sub, p) => sub + (p.priceInr || 0), 0),
    0,
  );
  const totalGrossWeight = categories.reduce(
    (acc, cat) =>
      acc + cat.pieces.reduce((sub, p) => sub + (p.grossWeightGrams || 0), 0),
    0,
  );
  const showroomPiecesCount = categories.reduce(
    (acc, cat) =>
      acc + cat.pieces.filter((p) => p.custodyState === "DISPLAY").length,
    0,
  );

  const inventoryKpis: KpiItem[] = [
    {
      id: "kpi-pieces",
      title: "Total Vaulted Pieces",
      value: `${totalPiecesCount.toLocaleString()} Pcs`,
      subValue: "+18 pieces birthed this week",
      badge: { text: "Active", variant: "gold" },
      icon: <Sparkles className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-valuation",
      title: "Gross Stock Valuation",
      value: `₹ ${(totalValuationInr / 10000000).toFixed(2)} Cr`,
      subValue: "100% Insured under Lloyd's Specie",
      badge: { text: "Insured", variant: "emerald" },
      icon: <Gem className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-weight",
      title: "Total Gold Weight",
      value: `${(totalGrossWeight / 1000).toFixed(3)} kg`,
      subValue: "Sub-milligram digital balance locked",
      badge: { text: "Au 916/750", variant: "secondary" },
      icon: <Scale className="w-3.5 h-3.5 text-status-amber" />,
    },
    {
      id: "kpi-display",
      title: "Showroom Display Active",
      value: `${showroomPiecesCount} Pcs`,
      subValue: "Live UHF Tray Sensor Mesh",
      badge: { text: "Floor Ready", variant: "emerald" },
      icon: <Radio className="w-3.5 h-3.5 text-status-indigo" />,
    },
  ];

  const filteredCategories = categories.map((cat) => {
    let pieces = cat.pieces;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pieces = pieces.filter(
        (p) =>
          p.serialNumber.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q) ||
          p.epcRfidTag.toLowerCase().includes(q) ||
          p.metalPurity.toLowerCase().includes(q),
      );
    }
    if (filterState === "VAULT") {
      pieces = pieces.filter((p) => p.custodyState === "VAULT");
    } else if (filterState === "DISPLAY") {
      pieces = pieces.filter((p) => p.custodyState === "DISPLAY");
    } else if (filterState === "SOLITAIRE") {
      pieces = pieces.filter((p) => (p.diamondCarat ?? 0) > 0);
    }
    return { ...cat, pieces };
  });

  const handleSelectPiece = (
    piece: InventoryPieceData,
    cat: InventoryCategoryData,
  ) => {
    setSelectedPiece(piece);
    setSelectedCategoryName(cat.categoryName);
  };

  const handlePieceCreated = (newPiece: InventoryPieceData) => {
    setCategories((prev) => {
      const targetCatIndex = prev.findIndex(
        (c) =>
          c.categoryName
            .toLowerCase()
            .includes(newPiece.category.toLowerCase()) ||
          newPiece.category
            .toLowerCase()
            .includes(c.categoryName.toLowerCase()),
      );
      if (targetCatIndex >= 0) {
        const next = [...prev];
        next[targetCatIndex] = {
          ...next[targetCatIndex],
          totalPieces: next[targetCatIndex].totalPieces + 1,
          totalGrossWeightGrams:
            next[targetCatIndex].totalGrossWeightGrams +
            newPiece.grossWeightGrams,
          pieces: [newPiece, ...next[targetCatIndex].pieces],
        };
        return next;
      } else {
        const newCat: InventoryCategoryData = {
          id: `cat-${Date.now()}`,
          categoryName: newPiece.category,
          vaultLocation: "Main Vault • Drawer S-01",
          totalPieces: 1,
          totalGrossWeightGrams: newPiece.grossWeightGrams,
          status: "LIVE_IN_STOCK",
          pieces: [newPiece],
        };
        return [...prev, newCat];
      }
    });
    setSelectedPiece(newPiece);
    setSelectedCategoryName(newPiece.category);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Atmospheric Luxury Hero Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>Flagship Mumbai (INV-11)</span>
                <span>&gt;</span>
                <span className="text-gold font-medium">Vault &amp; Finished Goods Custody</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
                  Serialized Inventory &amp; Provenance Directory
                </h1>
                <Badge variant="emerald" dot className="text-xs font-mono font-bold">
                  UHF RFID Mesh Active • 99.98% Synced
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10 text-xs font-mono">
                  BIS Hallmarked &amp; Lloyd&apos;s Insured
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Granular Metrology Piece Master, Cradle-to-Grave Provenance Ledger, Dual-Custody Drawer Assignment &amp; Live RFID Tray Telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsBirthModalOpen(true)}
                className="font-semibold text-xs h-9 gap-1.5 transition-colors duration-150 font-mono"
              >
                <Plus className="h-4 w-4" />
                <span>Birth Serialized Piece</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Tactile Precision KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Total Live Inventory Pieces
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {totalPiecesCount}{" "}
              <span className="text-sm text-muted-foreground font-normal font-sans">Active Pieces</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>100% RFID Serialized</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Gross Stock Valuation
              </span>
              <div className="p-1.5 rounded-lg bg-status-emerald/10 text-status-emerald border border-status-emerald/30">
                <Gem className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              ₹ {(totalValuationInr / 10000000).toFixed(2)}{" "}
              <span className="text-sm text-gold font-normal font-sans">Cr</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <span>Lloyd&apos;s Specie Insured</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Total Gold Weight
              </span>
              <div className="p-1.5 rounded-lg bg-surface-elevated text-foreground border border-surface-border">
                <Scale className="h-4 w-4 text-foreground" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {(totalGrossWeight / 1000).toFixed(3)}{" "}
              <span className="text-sm text-gold font-normal font-sans">kg</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium font-mono">
              <span>Au 916 / Au 750 Calibrated</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Showroom Display Active
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Radio className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {showroomPiecesCount}{" "}
              <span className="text-sm text-muted-foreground font-normal font-sans">Pieces</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <span>Live UHF Tray Sensor Mesh</span>
            </div>
          </Card>
        </div>

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <PieceLineageInspector
              piece={selectedPiece}
              parentCategoryName={selectedCategoryName}
            />
          }
        >
          {/* Left Column (65%): Piece Directory */}
          <div className="space-y-4">
            {/* Search, Filter & View Mode Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-surface-border bg-surface-card/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Serial #, Title, RFID EPC Tag, Karat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-surface-elevated/60 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Segmented Filter Pills */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated/70 border border-surface-border shrink-0 overflow-x-auto">
                  {[
                    { id: "ALL", label: "All Custody" },
                    { id: "VAULT", label: "Vault Safe" },
                    { id: "DISPLAY", label: "Showroom Floor" },
                    { id: "SOLITAIRE", label: "Diamonds" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setFilterState(id)}
                      className={`px-3 py-1 rounded-lg font-mono text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                        filterState === id
                          ? "bg-gold text-obsidian font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* View Mode Switcher (Skiper UI style) */}
                <div className="flex items-center gap-0.5 border border-surface-border rounded-xl p-1 bg-surface-elevated/70 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-gold text-obsidian font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="High-Density Tabular View"
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-gold text-obsidian font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Visual Salon Catalog Grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* View Mode Render: Dense Table vs Visual Category Grid */}
            {viewMode === "table" ? (
              <Card className="overflow-hidden border-surface-border">
                <div className="overflow-x-auto max-h-[640px]">
                  <Table>
                    <TableHeader className="bg-surface-elevated/90 sticky top-0 z-10 text-[10px] uppercase font-mono tracking-wider">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10 text-center">#</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Piece Description</TableHead>
                        <TableHead>Purity &amp; HUID</TableHead>
                        <TableHead className="text-right">Gross (g)</TableHead>
                        <TableHead className="text-right">Net Au (g)</TableHead>
                        <TableHead className="text-right">Gemstones</TableHead>
                        <TableHead>Custody</TableHead>
                        <TableHead className="text-right">Retail Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs font-mono">
                      {filteredCategories.flatMap((cat) =>
                        cat.pieces.map((p) => ({ ...p, parentCategory: cat.categoryName })),
                      ).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-xs font-sans">
                            No inventory pieces match your current filter criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.flatMap((cat) =>
                          cat.pieces.map((p) => ({ ...p, parentCategory: cat.categoryName })),
                        ).map((p, idx) => {
                          const isSelected = selectedPiece?.id === p.id;
                          return (
                            <TableRow
                              key={p.id}
                              onClick={() => {
                                setSelectedPiece(p);
                                setSelectedCategoryName(p.parentCategory);
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-gold/15 dark:bg-gold/20 font-semibold border-l-4 border-l-gold"
                                  : "hover:bg-surface-elevated/60"
                              }`}
                            >
                              <TableCell className="text-center text-muted-foreground text-[11px]">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="font-bold text-foreground">
                                <span className={isSelected ? "text-gold" : ""}>{p.serialNumber}</span>
                              </TableCell>
                              <TableCell className="font-sans text-[11px] max-w-[200px] truncate text-foreground font-medium">
                                {p.itemName}
                              </TableCell>
                              <TableCell>
                                <LaserHallmarkBadge
                                  huid={p.giaCertNumber || p.serialNumber.slice(-6)}
                                  purity={p.metalPurity}
                                  isBisVerified={p.qualityState === "HALLMARKED"}
                                  showSweepAnimation={false}
                                />
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-foreground font-semibold">
                                {p.grossWeightGrams.toFixed(3)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-muted-foreground">
                                {p.netGoldGrams.toFixed(3)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-gold">
                                {p.diamondCarat ? `${p.diamondCarat.toFixed(2)} ct` : "—"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                                    p.custodyState === "VAULT"
                                      ? "bg-emerald-500/15 text-status-emerald border border-emerald-500/30"
                                      : p.custodyState === "DISPLAY"
                                      ? "bg-cyan-500/15 text-status-indigo border border-cyan-500/30"
                                      : "bg-amber-500/15 text-status-amber border border-amber-500/30"
                                  }`}
                                >
                                  {p.custodyState}
                                </span>
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-status-emerald font-bold">
                                ₹ {p.priceInr.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ) : (
              /* Category Sections List */
              filteredCategories.length === 0 ? (
                <Card className="text-center py-12 text-muted-foreground text-xs">
                  No inventory pieces match your current filter criteria.
                </Card>
              ) : (
                filteredCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    selectedPieceId={selectedPiece?.id}
                    onSelectPiece={handleSelectPiece}
                  />
                ))
              )
            )}
          </div>
        </WorkstationLayout>

        {/* Birth Piece Genesis Modal */}
        <BirthPieceModal
          isOpen={isBirthModalOpen}
          onClose={() => setIsBirthModalOpen(false)}
          onCreated={handlePieceCreated}
        />
      </div>
    </AppShell>
  );
}
