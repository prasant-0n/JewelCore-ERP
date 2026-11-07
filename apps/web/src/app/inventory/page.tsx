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
import {
  Gem,
  Scale,
  ShieldCheck,
  Search,
  Plus,
  Sparkles,
  Layers,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

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
            detail: "Fineness 750.2 parts per 1,000 certified via Niton XL5 Plus",
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
            detail: "BIS 750 Hallmark verified. RFID EPC serialized into Drawer S-01",
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
            detail: "GIA 2.01ct D-Flawless laser inscription verified under 40x microscope",
          },
          {
            stage: "Transferred to Showroom Floor",
            timestamp: "2026-11-07 11:00:00",
            actor: "Store Floor Lead",
            detail: "Placed in Counter Display 02 with live RFID mesh sensor",
          },
        ],
      },
      {
        id: "pc-sol-03",
        serialNumber: "JC-SOL-2026-083",
        itemName: "Platinum 950 Emerald-Cut Solitaire (2.50ct E-VS1)",
        category: "Solitaire Rings",
        metalPurity: "Platinum (Pt 950)",
        grossWeightGrams: 8.12,
        netGoldGrams: 0.0,
        diamondCarat: 2.5,
        diamondClarity: "VS1",
        diamondColor: "E",
        giaCertNumber: "GIA-7104891122",
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 1250000,
        currentLocation: "Main Vault - Compartment A-03",
        epcRfidTag: "E280-1160-2000-7741-0101",
        provenance: [
          {
            stage: "Finished Goods Inward",
            timestamp: "2026-11-04 16:45:00",
            actor: "Vault Custodian M. Nair",
            detail: "Pt 950 Assay stamped. Locked in High-Security Compartment A-03",
          },
        ],
      },
    ],
  },
  {
    id: "cat-necklaces",
    categoryName: "Royal Kundan & Diamond Bridal Chokers",
    vaultLocation: "Main Vault • Safe B-02",
    totalPieces: 18,
    totalGrossWeightGrams: 1420.5,
    status: "LIVE_IN_STOCK",
    pieces: [
      {
        id: "pc-nk-01",
        serialNumber: "JC-CHK-2026-014",
        itemName: "22K Antique Heritage Jadau Choker with Uncut Polki",
        category: "Necklaces & Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 94.65,
        netGoldGrams: 78.2,
        diamondCarat: 14.2,
        diamondClarity: "Syndicate Polki",
        diamondColor: "Natural Uncut",
        giaCertNumber: "IGI-JAD-99120",
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 1140000,
        currentLocation: "Main Vault - Safe B-02",
        epcRfidTag: "E280-1160-2000-8812-0045",
        provenance: [
          {
            stage: "Bikaner Royal Workshop Batch",
            timestamp: "2026-10-28 11:20:00",
            actor: "Master Craftsman B. Rathore",
            detail: "22K foil back setting with natural Burmese emerald drops",
          },
          {
            stage: "BIS 916 Hallmarking Verified",
            timestamp: "2026-11-01 15:10:00",
            actor: "Govt Hallmarking Center",
            detail: "XRF assayed 91.68% Au purity standard",
          },
        ],
      },
      {
        id: "pc-nk-02",
        serialNumber: "JC-CHK-2026-015",
        itemName: "18K Rose Gold Cascading Waterfall Diamond Necklace",
        category: "Necklaces & Chokers",
        metalPurity: "18K Rose Gold (Au 750)",
        grossWeightGrams: 68.3,
        netGoldGrams: 52.1,
        diamondCarat: 18.5,
        diamondClarity: "VVS-VS",
        diamondColor: "F-G",
        giaCertNumber: "IGI-DIA-44102",
        custodyState: "DISPLAY",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 1850000,
        currentLocation: "Showroom Safe - Display Case #01",
        epcRfidTag: "E280-1160-2000-8812-0046",
        provenance: [
          {
            stage: "Laser Micro-setting",
            timestamp: "2026-10-30 14:00:00",
            actor: "Precision Atelier",
            detail: "382 brilliant cut diamonds set across 4 articulated graduated tiers",
          },
        ],
      },
      {
        id: "pc-nk-03",
        serialNumber: "JC-CHK-2026-016",
        itemName: "22K Temple Gold Nakshi Choker with South Sea Pearls",
        category: "Necklaces & Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 112.4,
        netGoldGrams: 104.8,
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 960000,
        currentLocation: "Main Vault - Safe B-02",
        epcRfidTag: "E280-1160-2000-8812-0047",
        provenance: [
          {
            stage: "Temple Artisan Hand Carving",
            timestamp: "2026-11-02 12:15:00",
            actor: "Master Sculptor S. Pillai",
            detail: "Hand-embossed Lakshmi Nakshi motif with AAA Australian pearls",
          },
        ],
      },
    ],
  },
  {
    id: "cat-bangles",
    categoryName: "Polki & Cast Gold Bangles & Kadas",
    vaultLocation: "Main Vault • Safe C-01",
    totalPieces: 32,
    totalGrossWeightGrams: 890.2,
    status: "LIVE_IN_STOCK",
    pieces: [
      {
        id: "pc-bg-01",
        serialNumber: "JC-KAD-2026-004",
        itemName: "22K Royal Calcutta Filigree Kada Pair (62g Each)",
        category: "Bangles & Kadas",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 124.5,
        netGoldGrams: 124.5,
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 1080000,
        currentLocation: "Main Vault - Safe C-01",
        epcRfidTag: "E280-1160-2000-9941-0021",
        provenance: [
          {
            stage: "Hand Drawn Filigree Assembly",
            timestamp: "2026-11-04 17:30:00",
            actor: "Bowbazar Heritage Studio",
            detail: "Solid wire wire drawing, screw-pin locking clasp tested to 25kg tensile",
          },
        ],
      },
      {
        id: "pc-bg-02",
        serialNumber: "JC-KAD-2026-005",
        itemName: "18K White Gold Tennis Bangle (5.20ct Diamonds)",
        category: "Bangles & Kadas",
        metalPurity: "18K White Gold (Au 750)",
        grossWeightGrams: 28.6,
        netGoldGrams: 27.56,
        diamondCarat: 5.2,
        diamondClarity: "VS1",
        diamondColor: "G",
        giaCertNumber: "IGI-DIA-55919",
        custodyState: "DISPLAY",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: 540000,
        currentLocation: "Showroom Safe - Display Case #03",
        epcRfidTag: "E280-1160-2000-9941-0022",
        provenance: [
          {
            stage: "Micro-prong Setting & Tension Locking",
            timestamp: "2026-11-05 11:00:00",
            actor: "Gemological Lab",
            detail: "Double security catch lock verified under optical loupe",
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
    INITIAL_CATEGORIES[0].pieces[0]
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(
    INITIAL_CATEGORIES[0].categoryName
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);

  // Compute summary KPI metrics
  const totalPiecesCount = categories.reduce(
    (acc, cat) => acc + cat.pieces.length,
    0
  );
  const totalValuationInr = categories.reduce(
    (acc, cat) =>
      acc + cat.pieces.reduce((sub, p) => sub + (p.priceInr || 0), 0),
    0
  );
  const totalGrossWeight = categories.reduce(
    (acc, cat) =>
      acc + cat.pieces.reduce((sub, p) => sub + (p.grossWeightGrams || 0), 0),
    0
  );
  const showroomPiecesCount = categories.reduce(
    (acc, cat) =>
      acc +
      cat.pieces.filter((p) => p.custodyState === "DISPLAY").length,
    0
  );

  // Filter pieces by search & custody state
  const filteredCategories = categories.map((cat) => {
    let pieces = cat.pieces;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pieces = pieces.filter(
        (p) =>
          p.serialNumber.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q) ||
          p.epcRfidTag.toLowerCase().includes(q) ||
          p.metalPurity.toLowerCase().includes(q)
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
    cat: InventoryCategoryData
  ) => {
    setSelectedPiece(piece);
    setSelectedCategoryName(cat.categoryName);
  };

  const handlePieceCreated = (newPiece: InventoryPieceData) => {
    setCategories((prev) => {
      const targetCatIndex = prev.findIndex(
        (c) =>
          c.categoryName.toLowerCase().includes(newPiece.category.toLowerCase()) ||
          newPiece.category.toLowerCase().includes(c.categoryName.toLowerCase())
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
        // Create new category if needed
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
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, RFID Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/60">
              <span>JewelCore ERP</span>
              <span>/</span>
              <span>Vault & Finished Goods Custody</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Lifecycle & Lineage Master
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Serialized Inventory & Provenance Directory</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                UHF RFID Mesh Active • 99.98% Synced
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBirthModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-semibold shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Birth Serialized Piece</span>
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Total Vaulted Pieces</span>
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {totalPiecesCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>+18 pieces birthed this week</span>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Gross Stock Valuation</span>
              <Gem className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              ₹ {(totalValuationInr / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              100% Insured under Lloyd's Specie
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Total Gold Weight</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
              {(totalGrossWeight / 1000).toFixed(3)} kg
            </div>
            <div className="text-[10px] text-gold font-mono mt-1">
              Sub-milligram digital balance locked
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Showroom Display Active</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              {showroomPiecesCount} pcs
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Live UHF Tray Sensor Mesh
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
                  placeholder="Filter by Serial #, Title, RFID EPC Tag, Karat..."
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
                  All Custody
                </button>
                <button
                  onClick={() => setFilterState("VAULT")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "VAULT"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Vault Safe
                </button>
                <button
                  onClick={() => setFilterState("DISPLAY")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "DISPLAY"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Showroom Floor
                </button>
                <button
                  onClick={() => setFilterState("SOLITAIRE")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "SOLITAIRE"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Certified Diamonds
                </button>
              </div>
            </div>

            {/* Hierarchical Categories & Piece Matrix Grids */}
            <div className="space-y-4">
              {filteredCategories.map((cat, idx) => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  defaultExpanded={idx === 0}
                  selectedPieceId={selectedPiece?.id}
                  onSelectPiece={(piece, category) =>
                    handleSelectPiece(piece, category)
                  }
                />
              ))}

              {filteredCategories.every((c) => c.pieces.length === 0) && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <Gem className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching inventory pieces found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or birth a new serialized piece.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <PieceLineageInspector
              piece={selectedPiece}
              parentCategoryName={selectedCategoryName}
              onClose={() => setSelectedPiece(null)}
              onCheckoutClick={(piece) => {
                // Update commercial status to SOLD
                setCategories((prev) =>
                  prev.map((cat) => ({
                    ...cat,
                    pieces: cat.pieces.map((p) =>
                      p.id === piece.id
                        ? { ...p, commercialState: "SOLD", custodyState: "TRANSIT" }
                        : p
                    ),
                  }))
                );
                setSelectedPiece((prev) =>
                  prev ? { ...prev, commercialState: "SOLD", custodyState: "TRANSIT" } : null
                );
              }}
              onTransferClick={(piece) => {
                // Toggle custody state between VAULT and DISPLAY
                const nextState =
                  piece.custodyState === "VAULT" ? "DISPLAY" : "VAULT";
                setCategories((prev) =>
                  prev.map((cat) => ({
                    ...cat,
                    pieces: cat.pieces.map((p) =>
                      p.id === piece.id ? { ...p, custodyState: nextState } : p
                    ),
                  }))
                );
                setSelectedPiece((prev) =>
                  prev ? { ...prev, custodyState: nextState } : null
                );
              }}
            />
          </div>
        </div>

        {/* Modal for Birthing Serialized Piece */}
        <BirthPieceModal
          isOpen={isBirthModalOpen}
          onClose={() => setIsBirthModalOpen(false)}
          onCreated={handlePieceCreated}
        />
      </div>
    </AppShell>
  );
}
