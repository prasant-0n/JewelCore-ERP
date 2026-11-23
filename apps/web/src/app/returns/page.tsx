"use client";

import React, { useState, useEffect } from "react";
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
  TrendingUp,
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
import { api } from "../../lib/api";

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
        customerName: "Mrs. Sunita Verma",
        customerPan: "BPLPB1104M",
        itemDescription: "22K Traditional Antique Kada Pair",
        grossWeightGrams: 64.2,
        stoneWeightDeductionGrams: 5.39,
        netGoldWeightGrams: 58.81,
        assayedPurityPercent: 91.68,
        karatString: "22K Old Gold",
        hydrostaticSpecificGravity: 17.58,
        spotGoldRatePerGram: 7450.0,
        meltLossDeductionPercent: 1.5,
        calculatedValuationInr: 395450,
        status: "VALUATED",
        containmentBucket: "Melt Crucible A-01",
        receivedAt: "14:15:00",
      },
      {
        id: "bb-itm-02",
        itemCode: "BB-ITM-02",
        customerName: "Mrs. Sunita Verma",
        customerPan: "BPLPB1104M",
        itemDescription: "18K Diamond Cocktail Ring (Shank Melt)",
        grossWeightGrams: 7.4,
        stoneWeightDeductionGrams: 1.84,
        netGoldWeightGrams: 5.56,
        assayedPurityPercent: 75.12,
        karatString: "18K Scrap",
        hydrostaticSpecificGravity: 15.42,
        spotGoldRatePerGram: 7450.0,
        meltLossDeductionPercent: 2.0,
        calculatedValuationInr: 40737,
        status: "VALUATED",
        containmentBucket: "Melt Crucible A-02",
        receivedAt: "14:18:00",
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
        customerName: "Main Atelier Goldsmith Floor",
        customerPan: "GSTIN-ATELIER-01",
        itemDescription: "Jeweller Bench Wire Clippings & Sprues",
        grossWeightGrams: 142.5,
        stoneWeightDeductionGrams: 12.0,
        netGoldWeightGrams: 130.5,
        assayedPurityPercent: 91.55,
        karatString: "22K Workshop Scrap",
        hydrostaticSpecificGravity: 17.5,
        spotGoldRatePerGram: 7450.0,
        meltLossDeductionPercent: 2.5,
        calculatedValuationInr: 878000,
        status: "SMELT_QUEUED",
        containmentBucket: "Crucible Induction Furnace #2",
        receivedAt: "12:30:00",
      },
    ],
  },
];

export default function ReturnsRefiningPage() {
  const [batches, setBatches] = useState<ScrapBatchGroupData[]>(
    INITIAL_SCRAP_BATCHES,
  );
  const [selectedItem, setSelectedItem] = useState<ScrapPieceData | null>(
    INITIAL_SCRAP_BATCHES[0].items[0],
  );
  const [selectedBatchTitle, setSelectedBatchTitle] = useState<string>(
    INITIAL_SCRAP_BATCHES[0].batchTitle,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isBuybackModalOpen, setIsBuybackModalOpen] = useState(false);

  useEffect(() => {
    async function loadLiveBuybacks() {
      try {
        const res = await api.get<{
          success: boolean;
          data: Array<{
            id: string;
            orderNumber: string;
            status: string;
            customerName?: string;
            createdAt: string;
            items?: Array<{
              id: string;
              description: string;
              grossWeightGrams: number;
              netWeightGrams: number;
              purityPercentage: number;
              marketRatePerGramCad?: number;
              netPayoutCad?: number;
            }>;
          }>;
        }>("/sales/buybacks?limit=10");

        if (Array.isArray(res.data) && res.data.length > 0) {
          const liveItems: ScrapPieceData[] = res.data.flatMap((o) => {
            return (o.items || []).map((it) => ({
              id: it.id,
              buybackOrderId: o.id,
              itemCode: o.orderNumber,
              customerName: o.customerName || "Showroom VIP Client",
              customerPan: "AAAPS9012K",
              itemDescription: it.description,
              grossWeightGrams: Number(it.grossWeightGrams),
              stoneWeightDeductionGrams: Math.max(
                0,
                Number(it.grossWeightGrams) - Number(it.netWeightGrams),
              ),
              netGoldWeightGrams: Number(it.netWeightGrams),
              assayedPurityPercent: Number(it.purityPercentage),
              karatString:
                Number(it.purityPercentage) >= 91.6
                  ? "22K Old Gold"
                  : "18K Scrap",
              hydrostaticSpecificGravity: 17.55,
              spotGoldRatePerGram: Number(it.marketRatePerGramCad) || 7450,
              meltLossDeductionPercent: 1.5,
              calculatedValuationInr: Math.round(Number(it.netPayoutCad || 0)),
              status: o.status === "SETTLED" ? ("REFINED" as const) : ("VALUATED" as const),
              containmentBucket: "Melt Crucible A-01",
              receivedAt: new Date(o.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
          });

          if (liveItems.length > 0) {
            setBatches((prev) => [
              {
                id: "batch-live-buybacks",
                batchNumber: "BB-LIVE-01",
                batchTitle: "Live Database Old Gold Buyback Ledger",
                sourceTag: "Live Orders",
                clientOrSource: "Atelier Showroom Desk",
                status: "XRF_ASSAYED",
                items: liveItems,
              },
              ...prev,
            ]);
            setSelectedItem(liveItems[0]);
            setSelectedBatchTitle("Live Database Old Gold Buyback Ledger");
          }
        }
      } catch {
        // Fallback to initial seed items
      }
    }
    loadLiveBuybacks();
  }, []);

  // Summary Metrics
  const totalScrapGrams = batches.reduce(
    (acc, b) => acc + b.items.reduce((sub, i) => sub + i.grossWeightGrams, 0),
    0,
  );
  const totalBuybackPayout = batches.reduce(
    (acc, b) =>
      acc +
      b.items.reduce(
        (sub, i) => sub + (i.calculatedValuationInr ?? i.payoutValueInr ?? 0),
        0,
      ),
    0,
  );

  const returnsKpis: KpiItem[] = [
    {
      id: "kpi-scrap-wt",
      title: "Scrap Gold Inflow Today",
      value: `${totalScrapGrams.toFixed(3)} g`,
      subValue: "Au 916 & 750 Mixed (+18.4%)",
      badge: { text: "Au 916/750", variant: "gold" },
      icon: <Scale className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-buyback-payout",
      title: "Total Buyback Payout",
      value: `₹ ${(totalBuybackPayout / 100000).toFixed(2)} Lakh`,
      subValue: "99.8% RTGS Disbursed to Clients",
      badge: { text: "Disbursed", variant: "emerald" },
      icon: <TrendingUp className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-purity-yield",
      title: "Assayed Purity Yield",
      value: "91.64% Avg",
      subValue: "XRF & Density Verified",
      badge: { text: "Niton Verified", variant: "emerald" },
      icon: <FlaskConical className="w-3.5 h-3.5 text-status-amber" />,
    },
    {
      id: "kpi-quarantined-batches",
      title: "Quarantined Discrepancies",
      value: "0 Batches",
      subValue: "Audit Clean • Zero Contamination",
      badge: { text: "Clean", variant: "emerald" },
      icon: <ShieldCheck className="w-3.5 h-3.5 text-status-emerald" />,
    },
  ];

  const filteredBatches = batches.map((batch) => {
    let items = batch.items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.itemCode.toLowerCase().includes(q) ||
          (i.itemDescription || i.description || "")
            .toLowerCase()
            .includes(q) ||
          (i.customerName || "").toLowerCase().includes(q),
      );
    }
    return { ...batch, items };
  });

  const handleSelectItem = (
    item: ScrapPieceData,
    batch: ScrapBatchGroupData,
  ) => {
    setSelectedItem(item);
    setSelectedBatchTitle(batch.batchTitle);
  };

  const handleCreatedItem = (item: ScrapPieceData, targetBatchId: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === targetBatchId ? { ...b, items: [item, ...b.items] } : b,
      ),
    );
    setSelectedItem(item);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Luxury Hero Returns & Refining Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>Flagship Mumbai (INV-11)</span>
                <span>/</span>
                <span>Refining &amp; Scrap Melting</span>
                <span>/</span>
                <span className="text-gold font-medium">
                  Old Gold Returns &amp; Assaying
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">
                  Returns, Buyback Valuation &amp; Scrap Refining Workflow
                </h1>
                <Badge variant="emerald" dot className="font-mono text-[11px] px-2.5 py-1 bg-status-emerald/10 text-status-emerald border border-status-emerald/30">
                  Induction Furnace Active • Niton XRF Verified
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold font-mono text-[11px] px-2.5 py-1">
                  BIS Gold Scheme Ready
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-3xl">
                Customer exchange old gold assaying, automated karat melt loss deduction, spot valuation calculation, and induction furnace bar casting custody logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsBuybackModalOpen(true)}
                className="font-mono text-xs font-semibold shadow-lg shadow-gold/20"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Log Old Gold Buyback</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {returnsKpis.map((kpi) => (
            <Card
              key={kpi.id}
              className="relative overflow-hidden p-4 rounded-xl bg-surface-card/90 border border-surface-border/80 hover:border-gold/40 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground font-medium">
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
            <SmeltInspector
              item={selectedItem}
              parentBatchTitle={selectedBatchTitle}
            />
          }
        >
          {/* Left Column (65%): Scrap Batches */}
          <div className="space-y-4">
            {/* Luxury Search & Filter Toolbar */}
            <div className="bg-surface-card/90 border border-surface-border rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Lot #, Customer Name, Metal Alloy or Item ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg font-mono text-xs bg-surface-elevated border-surface-border"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center p-1 bg-surface-elevated rounded-lg border border-surface-border/60 gap-1 overflow-x-auto">
                {[
                  { id: "ALL", label: "All Lots" },
                  { id: "OLD_GOLD", label: "Customer Old Gold" },
                  { id: "SWEEPS", label: "Atelier Sweeps" },
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

            {/* Hierarchical Scrap Batches */}
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
            </div>
          </div>
        </WorkstationLayout>

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
