"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import {
  ScrapItemCard,
  ScrapPieceData,
} from "../../components/returns/ScrapItemCard";
import {
  ScrapBatchSection,
  ScrapBatchGroupData,
} from "../../components/returns/ScrapBatchSection";
import { SmeltInspector } from "../../components/returns/SmeltInspector";
import { NewBuybackModal } from "../../components/returns/NewBuybackModal";
import {
  Flame,
  Scale,
  FlaskConical,
  ShieldCheck,
  Search,
  Plus,
  RotateCw,
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const INITIAL_SCRAP_BATCHES: ScrapBatchGroupData[] = [
  {
    id: "batch-01",
    batchNumber: "BB-2026-044",
    batchTitle: "Batch #BB-2026-044: Royal Kundan & Antique 22K Melt Lot",
    sourceTag: "Old Gold Buyback",
    clientOrSource: "Mrs. Sunita Verma (KYC Verified)",
    status: "XRF_ASSAYED",
    items: [
      {
        id: "bb-itm-01",
        itemCode: "BB-ITM-01",
        description: "22K Traditional Antique Kada Pair",
        category: "Customer Old Gold",
        grossWeightGrams: 64.2,
        netGoldGrams: 58.81,
        assayedFinenessPercent: 91.68,
        specificGravity: 17.58,
        payoutValueInr: 395450,
        status: "ASSAY_PASSED",
        alloyClassification: "22K Yellow Gold (Au 916)",
      },
      {
        id: "bb-itm-02",
        itemCode: "BB-ITM-02",
        description: "18K Diamond Cocktail Ring (Shank Melt)",
        category: "Customer Old Gold",
        grossWeightGrams: 7.4,
        netGoldGrams: 5.56,
        extractedStoneCarats: 1.85,
        assayedFinenessPercent: 75.12,
        specificGravity: 15.42,
        payoutValueInr: 40737,
        status: "STONES_EXTRACTED",
        alloyClassification: "18K Yellow Gold (Au 750)",
      },
      {
        id: "bb-itm-03",
        itemCode: "BB-ITM-03",
        description: "22K Cut Bangle Links & Clasps",
        category: "Customer Old Gold",
        grossWeightGrams: 32.1,
        netGoldGrams: 29.4,
        assayedFinenessPercent: 91.6,
        specificGravity: 17.55,
        payoutValueInr: 201680,
        status: "ASSAY_PASSED",
        alloyClassification: "22K Yellow Gold (Au 916)",
      },
    ],
  },
  {
    id: "batch-02",
    batchNumber: "BB-2026-045",
    batchTitle: "Batch #BB-2026-045: Atelier Bench Sweeps & Filing Dust",
    sourceTag: "Crucible Smelt #2",
    clientOrSource: "Main Atelier Goldsmith Floor",
    status: "SMELT_QUEUED",
    items: [
      {
        id: "bb-itm-04",
        itemCode: "SWP-LOT-01",
        description: "Jeweller Bench Wire Clippings & Sprues",
        category: "Atelier Sweeps & Dross",
        grossWeightGrams: 142.5,
        netGoldGrams: 130.5,
        assayedFinenessPercent: 91.55,
        specificGravity: 17.5,
        payoutValueInr: 878000,
        status: "SMELT_QUEUED",
        alloyClassification: "22K Workshop Scrap",
      },
      {
        id: "bb-itm-05",
        itemCode: "SWP-LOT-02",
        description: "Polishing Dust Filter Bag Residue",
        category: "Atelier Sweeps & Dross",
        grossWeightGrams: 307.7,
        netGoldGrams: 245.2,
        assayedFinenessPercent: 79.7,
        specificGravity: 16.1,
        payoutValueInr: 1435000,
        status: "SMELT_QUEUED",
        alloyClassification: "Mixed Floor Sweeps",
      },
    ],
  },
  {
    id: "batch-03",
    batchNumber: "RET-2026-012",
    batchTitle: "Batch #RET-2026-012: Store Customer Exchange & Resale Assessment",
    sourceTag: "Store Exchange",
    clientOrSource: "Flagship Showroom Return Counter",
    status: "XRF_ASSAYED",
    items: [
      {
        id: "ret-itm-01",
        itemCode: "RET-ITM-01",
        description: "18K Diamond Solitaire Ring (Sizing Return)",
        category: "Defective Exchanges",
        grossWeightGrams: 5.42,
        netGoldGrams: 5.116,
        assayedFinenessPercent: 75.02,
        specificGravity: 15.4,
        payoutValueInr: 34500,
        status: "ASSAY_PASSED",
        alloyClassification: "18K White Gold (Au 750)",
      },
    ],
  },
];

export default function ReturnsScrapRefiningPage() {
  const [batches, setBatches] =
    useState<ScrapBatchGroupData[]>(INITIAL_SCRAP_BATCHES);
  const [selectedItem, setSelectedItem] = useState<ScrapPieceData | null>(
    INITIAL_SCRAP_BATCHES[0].items[0]
  );
  const [selectedBatchTitle, setSelectedBatchTitle] = useState<string>(
    INITIAL_SCRAP_BATCHES[0].batchTitle
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isBuybackModalOpen, setIsBuybackModalOpen] = useState(false);
  const [isSmelting, setIsSmelting] = useState(false);
  const [smeltNotification, setSmeltNotification] = useState<string | null>(
    null
  );

  // Compute metrics
  const totalScrapGrams = 4850.24;
  const totalBuybackPayout = 2845200;
  const averagePurityYield = "92.4% Avg Au";
  const quarantinedCount = 0;

  // Filter batches
  const filteredBatches = batches.map((batch) => {
    let items = batch.items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.itemCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.alloyClassification.toLowerCase().includes(q)
      );
    }
    if (filterState === "OLD_GOLD") {
      items = items.filter((i) => i.category === "Customer Old Gold");
    } else if (filterState === "SWEEPS") {
      items = items.filter((i) => i.category.includes("Sweeps"));
    } else if (filterState === "SMELT_READY") {
      items = items.filter((i) => i.status === "ASSAY_PASSED" || i.status === "SMELT_QUEUED");
    }
    return { ...batch, items };
  });

  const handleSelectItem = (
    item: ScrapPieceData,
    batch: ScrapBatchGroupData
  ) => {
    setSelectedItem(item);
    setSelectedBatchTitle(batch.batchTitle);
  };

  const handleInitiateSmelt = async () => {
    setIsSmelting(true);
    setSmeltNotification(
      "Induction Furnace Crucible #01 Ignited • Nitrogen Blanket Active • Heating to 1,064°C..."
    );

    await new Promise((res) => setTimeout(res, 1200));

    setIsSmelting(false);
    setSmeltNotification(
      "Smelting Complete! Fine Gold Cast Ingot #ING-2026-9901 formed • 999.8 Fineness stamped."
    );
    setTimeout(() => setSmeltNotification(null), 4000);
  };

  const handleCreatedItem = (
    newItem: ScrapPieceData,
    targetBatchId: string
  ) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === targetBatchId) {
          return {
            ...b,
            items: [newItem, ...b.items],
          };
        }
        return b;
      })
    );
    setSelectedItem(newItem);
    const foundBatch = batches.find((b) => b.id === targetBatchId);
    if (foundBatch) setSelectedBatchTitle(foundBatch.batchTitle);
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
              <span>Atelier & Refining</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Returns, Buyback & Scrap Refining Workflow
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Old Gold Buyback, XRF Assay & Induction Smelting</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Thermo Niton XL5 XRF & Hydrostatic Density Scale Active • Latency 8ms
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBuybackModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-platinum/70" />
              <span>+ New Buyback Intake</span>
            </button>

            <button
              onClick={handleInitiateSmelt}
              disabled={isSmelting}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Flame
                className={`w-4 h-4 text-obsidian ${
                  isSmelting ? "animate-pulse" : ""
                }`}
              />
              <span>
                {isSmelting
                  ? "Firing Crucible Furnace..."
                  : "Initiate Induction Smelt Batch"}
              </span>
            </button>
          </div>
        </div>

        {/* Smelt Status Notification Banner */}
        {smeltNotification && (
          <div className="p-3 rounded-xl bg-surface-card border border-gold/40 flex items-center justify-between text-xs font-mono text-gold animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>{smeltNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Crucible #01 Ready
            </span>
          </div>
        )}

        {/* 4 Metric KPI Cards matching Screen 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Today's Scrap Inward</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
              {totalScrapGrams.toFixed(3)} g
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>Au 916 & 750 Mixed (+18.4%)</span>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Total Buyback Payout</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight tabular-nums">
              ₹ {totalBuybackPayout.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              99.8% RTGS Disbursed to Clients
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Assayed Purity Yield</span>
              <FlaskConical className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-gold tracking-tight">
              {averagePurityYield}
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              XRF & Density Verified
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Quarantined Discrepancies</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {quarantinedCount} Batches Flagged
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Audit Clean • Zero Contamination
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
                  placeholder="Filter by Lot #, Customer Name, Metal Alloy or Item ID..."
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
                  All Lots
                </button>
                <button
                  onClick={() => setFilterState("OLD_GOLD")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "OLD_GOLD"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Customer Old Gold
                </button>
                <button
                  onClick={() => setFilterState("SWEEPS")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "SWEEPS"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Atelier Sweeps
                </button>
                <button
                  onClick={() => setFilterState("SMELT_READY")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "SMELT_READY"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Smelt Ready
                </button>
              </div>
            </div>

            {/* Hierarchical Scrap Batches & Item Matrix Grids */}
            <div className="space-y-4">
              {filteredBatches.map((batch, idx) => (
                <ScrapBatchSection
                  key={batch.id}
                  batch={batch}
                  defaultExpanded={idx === 0}
                  selectedItemId={selectedItem?.id}
                  onSelectItem={(item, b) => handleSelectItem(item, b)}
                />
              ))}

              {filteredBatches.every((b) => b.items.length === 0) && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <Flame className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching scrap lots found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or register a new buyback intake.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <SmeltInspector
              item={selectedItem}
              parentBatchTitle={selectedBatchTitle}
              clientName="Mrs. Sunita Verma (KYC Verified)"
              onClose={() => setSelectedItem(null)}
              onAuthorizePayout={(item) => {
                // Update item status to SMELT_QUEUED
                setBatches((prev) =>
                  prev.map((b) => ({
                    ...b,
                    items: b.items.map((i) =>
                      i.id === item.id
                        ? { ...i, status: "SMELT_QUEUED" as const }
                        : i
                    ),
                  }))
                );
                setSelectedItem((prev) =>
                  prev ? { ...prev, status: "SMELT_QUEUED" } : null
                );
              }}
              onConvertToCredit={() => {
                // Handled in inspector
              }}
            />
          </div>
        </div>

        {/* Modal for Old Gold Buyback Intake */}
        <NewBuybackModal
          isOpen={isBuybackModalOpen}
          onClose={() => setIsBuybackModalOpen(false)}
          onCreated={handleCreatedItem}
        />
      </div>
    </AppShell>
  );
}
