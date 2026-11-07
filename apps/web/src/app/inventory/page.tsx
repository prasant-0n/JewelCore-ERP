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
import { Gem, Scale, Search, Plus, Sparkles, Radio } from "lucide-react";
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
        {/* Top Subheader: Breadcrumbs, RFID Telemetry & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Vault & Finished Goods Custody
              </span>
              <Badge variant="emerald" dot className="ml-2">
                UHF RFID Mesh Active • 99.98% Synced
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Serialized Inventory &amp; Provenance Directory
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsBirthModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Birth Serialized Piece</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <WorkstationKpiGrid items={inventoryKpis} />

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
            {/* Search & Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Serial #, Title, RFID EPC Tag, Karat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Custody" },
                  { id: "VAULT", label: "Vault Safe" },
                  { id: "DISPLAY", label: "Showroom Floor" },
                  { id: "SOLITAIRE", label: "Certified Diamonds" },
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

            {/* Category Sections List */}
            {filteredCategories.length === 0 ? (
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
