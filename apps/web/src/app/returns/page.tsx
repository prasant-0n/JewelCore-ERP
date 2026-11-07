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
        {/* Top Subheader: Breadcrumbs, Refinery Telemetry & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Refining &amp; Scrap Melting
              </span>
              <Badge variant="emerald" dot className="ml-2">
                Induction Furnace Active • Niton XRF Verified
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Returns, Buyback Valuation &amp; Scrap Refining Workflow
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsBuybackModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Log Old Gold Buyback</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <WorkstationKpiGrid items={returnsKpis} />

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
            {/* Search & Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Lot #, Customer Name, Metal Alloy or Item ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Lots" },
                  { id: "OLD_GOLD", label: "Customer Old Gold" },
                  { id: "SWEEPS", label: "Atelier Sweeps" },
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
