"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import {
  AlloyPricingCard,
  AlloyRuleData,
} from "../../components/pricing/AlloyPricingCard";
import {
  PricingTierSection,
  PricingTierGroupData,
} from "../../components/pricing/PricingTierSection";
import { AlloyRuleInspector } from "../../components/pricing/AlloyRuleInspector";
import { NewPricingTierModal } from "../../components/pricing/NewPricingTierModal";
import { PublishRateFixModal } from "../../components/pricing/PublishRateFixModal";
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  Search,
  Plus,
  Radio,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { useHardwareTelemetry } from "../../hooks/useHardwareTelemetry";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "@/components/workstation/WorkstationLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "../../lib/api";
import { toast } from "sonner";

const INITIAL_PRICING_GROUPS: PricingTierGroupData[] = [
  {
    id: "grp-alloys",
    tierName: "Gold Alloy Fixing Matrix (Live Market Pegged)",
    categoryTag: "Live MCX Peg",
    description: "3 Active Karat Tiers • Spot Linked Formula",
    activeCount: 3,
    status: "LIVE_PEG_ACTIVE",
    alloys: [
      {
        id: "alloy-24k",
        alloyName: "Au 999.9 Fine Gold (24K)",
        karatTag: "24K",
        finenessPurity: "Primary Bullion Benchmark • 99.99% Fineness Standard",
        spotPricePerGram: 7450.5,
        makingChargePercent: 0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 0.2,
        calculatedRetailPerGram: 7465.4,
        status: "LOCKED",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 99.2,
        targetTerminalsCount: 14,
        lastUpdated: "15:40:12",
      },
      {
        id: "alloy-22k",
        alloyName: "Au 916 Standard Gold (22K)",
        karatTag: "22K",
        finenessPurity: "Hallmark Jewellery Benchmark • 91.60% Fineness",
        spotPricePerGram: 6824.0,
        makingChargePercent: 12.5,
        makingChargeFixedPerGram: 0,
        wastagePercent: 1.5,
        calculatedRetailPerGram: 7677.0,
        status: "ACTIVE",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 98.4,
        targetTerminalsCount: 14,
        lastUpdated: "15:40:12",
      },
      {
        id: "alloy-18k",
        alloyName: "Au 750 Artisan Gold (18K)",
        karatTag: "18K",
        finenessPurity: "Diamond Setting Alloy • 75.00% Fineness",
        spotPricePerGram: 5587.5,
        makingChargePercent: 18.0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 2.0,
        calculatedRetailPerGram: 6593.25,
        status: "ACTIVE",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 98.4,
        targetTerminalsCount: 14,
        lastUpdated: "15:40:12",
      },
    ],
  },
  {
    id: "grp-making",
    tierName: "Dynamic Making Charges Matrix (Atelier Craft)",
    categoryTag: "Atelier Labor",
    description: "Craftsmanship Complexity Surcharges (Cast / Hand / Filigree)",
    activeCount: 8,
    status: "SYNCED",
    alloys: [
      {
        id: "mc-kundan",
        alloyName: "Royal Kundan & Polki Setting Charge",
        karatTag: "Handcrafted",
        finenessPurity: "Traditional Jaipur Foil Back Setting Standard",
        spotPricePerGram: 6824.0,
        makingChargePercent: 24.0,
        makingChargeFixedPerGram: 450,
        wastagePercent: 3.5,
        calculatedRetailPerGram: 8520.0,
        status: "ACTIVE",
        volatilityIndexPercent: 12.0,
        hedgingCoverPercent: 97.5,
        targetTerminalsCount: 14,
        lastUpdated: "15:40:12",
      },
    ],
  },
];

export default function PricingMasterPage() {
  const [pricingGroups, setPricingGroups] = useState<PricingTierGroupData[]>(
    INITIAL_PRICING_GROUPS,
  );
  const [selectedAlloy, setSelectedAlloy] = useState<AlloyRuleData | null>(
    INITIAL_PRICING_GROUPS[0].alloys[0],
  );
  const [selectedGroupName, setSelectedGroupName] = useState<string>(
    INITIAL_PRICING_GROUPS[0].tierName,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isNewTierModalOpen, setIsNewTierModalOpen] = useState(false);
  const [isRateFixModalOpen, setIsRateFixModalOpen] = useState(false);
  const [liveGoldRate, setLiveGoldRate] = useState<number>(7450.5);
  const [isSyncingFeed, setIsSyncingFeed] = useState(false);

  const { bullionData, syncExchangeFeed, isConnected } = useHardwareTelemetry();

  // Listen to live hardware telemetry / WebSocket exchange ticks
  useEffect(() => {
    if (bullionData?.spotInrPerGram && bullionData.spotInrPerGram > 0) {
      const numGold = bullionData.spotInrPerGram;
      setLiveGoldRate(numGold);
      setPricingGroups((prev) =>
        prev.map((g) => {
          if (g.id !== "grp-alloys") return g;
          return {
            ...g,
            alloys: g.alloys.map((a) => {
              if (a.karatTag === "24K") {
                return {
                  ...a,
                  spotPricePerGram: numGold,
                  calculatedRetailPerGram: Math.round(numGold * 1.002 * 10) / 10,
                };
              }
              if (a.karatTag === "22K") {
                const rate22k =
                  bullionData.standardGold22k ?? Math.round(numGold * 0.9166);
                return {
                  ...a,
                  spotPricePerGram: rate22k,
                  calculatedRetailPerGram: Math.round(rate22k * 1.125 * 10) / 10,
                };
              }
              if (a.karatTag === "18K") {
                const rate18k =
                  bullionData.artisanGold18k ?? Math.round(numGold * 0.75);
                return {
                  ...a,
                  spotPricePerGram: rate18k,
                  calculatedRetailPerGram: Math.round(rate18k * 1.18 * 10) / 10,
                };
              }
              return a;
            }),
          };
        }),
      );
    }
  }, [bullionData]);

  const handleSyncExchange = async () => {
    setIsSyncingFeed(true);
    try {
      const res = await syncExchangeFeed({ sourceExchange: "MCX" });
      const pureGold = res?.pureGold24k ?? bullionData.spotInrPerGram;
      toast.success("Commodity Exchange Feed Synchronized", {
        description: `MCX Gold 24K: ₹${pureGold}/g • 22K: ₹${(res?.standardGold22k ?? Math.round(pureGold * 0.9166))}/g • Broadcasted to all terminals`,
      });
    } catch {
      toast.error("Failed to sync exchange rates");
    } finally {
      setIsSyncingFeed(false);
    }
  };

  useEffect(() => {
    async function loadLiveRates() {
      try {
        const res = await api.get<{
          data: Array<{
            metalType: string;
            ratePerGramCad: number;
            effectiveFrom: string;
          }>;
        }>("/pricing/rates");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const goldRate = res.data.find((r) => r.metalType === "GOLD")?.ratePerGramCad;
          if (goldRate) {
            const numGold = Number(goldRate);
            setLiveGoldRate(numGold);
            setPricingGroups((prev) =>
              prev.map((g) => {
                if (g.id !== "grp-alloys") return g;
                return {
                  ...g,
                  alloys: g.alloys.map((a) => {
                    if (a.karatTag === "24K") {
                      return {
                        ...a,
                        spotPricePerGram: numGold,
                        calculatedRetailPerGram: numGold * 1.002,
                      };
                    }
                    if (a.karatTag === "22K") {
                      const rate22k = Math.round(numGold * 0.916);
                      return {
                        ...a,
                        spotPricePerGram: rate22k,
                        calculatedRetailPerGram: Math.round(rate22k * 1.125),
                      };
                    }
                    if (a.karatTag === "18K") {
                      const rate18k = Math.round(numGold * 0.75);
                      return {
                        ...a,
                        spotPricePerGram: rate18k,
                        calculatedRetailPerGram: Math.round(rate18k * 1.18),
                      };
                    }
                    return a;
                  }),
                };
              }),
            );
          }
        }
      } catch {
        // Fallback to INITIAL_PRICING_GROUPS
      }
    }
    loadLiveRates();
  }, []);

  const totalRulesCount = pricingGroups.reduce(
    (acc, g) => acc + g.alloys.length,
    0,
  );

  const pricingKpiItems: KpiItem[] = [
    {
      id: "kpi-mcx-spot",
      title: "MCX 24K Gold Spot",
      value: `₹${liveGoldRate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / g`,
      subValue: "+0.64% Today (+₹46.80)",
      badge: { text: "MCX Fix", variant: "emerald" },
      icon: <TrendingUp className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-22k-bench",
      title: "22K Benchmark (Au 916)",
      value: `₹${(Math.round(liveGoldRate * 0.916 * 10) / 10).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / g`,
      subValue: "Base Jeweller Standard",
      badge: { text: "Au 916", variant: "gold" },
      icon: <Scale className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-rules-count",
      title: "Active Margin Rules",
      value: `${totalRulesCount} Active Tiers`,
      subValue: "Atelier & Retail Synced",
      badge: { text: "Active", variant: "secondary" },
      icon: <Sliders className="w-3.5 h-3.5 text-foreground" />,
    },
    {
      id: "kpi-hedging-cover",
      title: "Treasury Hedging Cover",
      value: "98.4% Hedged",
      subValue: "MCX Gold Mini Contracts",
      badge: { text: "Protected", variant: "emerald" },
      icon: <ShieldCheck className="w-3.5 h-3.5 text-status-emerald" />,
    },
  ];

  const filteredGroups = pricingGroups.map((group) => {
    let alloys = group.alloys;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      alloys = alloys.filter(
        (a) =>
          a.alloyName.toLowerCase().includes(q) ||
          a.karatTag.toLowerCase().includes(q) ||
          a.finenessPurity.toLowerCase().includes(q),
      );
    }
    if (filterState === "24K") {
      alloys = alloys.filter((a) => a.karatTag === "24K");
    } else if (filterState === "22K") {
      alloys = alloys.filter((a) => a.karatTag === "22K");
    } else if (filterState === "18K") {
      alloys = alloys.filter((a) => a.karatTag === "18K");
    }
    return { ...group, alloys };
  });

  const handleSelectAlloy = (
    alloy: AlloyRuleData,
    group: PricingTierGroupData,
  ) => {
    setSelectedAlloy(alloy);
    setSelectedGroupName(group.tierName);
  };

  const handleBroadcast = () => {
    setIsRateFixModalOpen(true);
  };

  const handleRatesPublished = (rates: {
    gold24k: number;
    gold22k: number;
    gold18k: number;
    platinum: number;
    silver: number;
  }) => {
    setLiveGoldRate(rates.gold24k);
    setPricingGroups((prev) =>
      prev.map((g) => {
        if (g.id !== "grp-alloys") return g;
        return {
          ...g,
          alloys: g.alloys.map((a) => {
            if (a.karatTag === "24K") {
              const updated = {
                ...a,
                spotPricePerGram: rates.gold24k,
                calculatedRetailPerGram:
                  Math.round(rates.gold24k * 1.002 * 10) / 10,
                lastUpdated: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              if (selectedAlloy?.id === a.id) setSelectedAlloy(updated);
              return updated;
            }
            if (a.karatTag === "22K") {
              const updated = {
                ...a,
                spotPricePerGram: rates.gold22k,
                calculatedRetailPerGram:
                  Math.round(rates.gold22k * 1.125 * 10) / 10,
                lastUpdated: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              if (selectedAlloy?.id === a.id) setSelectedAlloy(updated);
              return updated;
            }
            if (a.karatTag === "18K") {
              const updated = {
                ...a,
                spotPricePerGram: rates.gold18k,
                calculatedRetailPerGram:
                  Math.round(rates.gold18k * 1.18 * 10) / 10,
                lastUpdated: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              if (selectedAlloy?.id === a.id) setSelectedAlloy(updated);
              return updated;
            }
            return a;
          }),
        };
      }),
    );
  };

  const handleTierCreated = (
    newAlloy: AlloyRuleData,
    targetGroupId: string,
  ) => {
    setPricingGroups((prev) =>
      prev.map((g) =>
        g.id === targetGroupId
          ? {
              ...g,
              alloys: [newAlloy, ...g.alloys],
              activeCount: g.activeCount + 1,
            }
          : g,
      ),
    );
    setSelectedAlloy(newAlloy);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Top Subheader: Breadcrumbs, Market Telemetry & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Bullion Fixing & Dynamic Pricing Engine
              </span>
              <Badge variant="emerald" dot className="ml-2">
                MCX Gold Spot ₹{liveGoldRate.toLocaleString("en-IN", { minimumFractionDigits: 1 })}/g • Reuters IBJA Feed Live
              </Badge>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              Bullion Fixing, Dynamic Making Charges &amp; Margin Rules
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isSyncingFeed}
              onClick={handleSyncExchange}
              className="font-mono text-xs border-gold/30 hover:bg-gold/10 hover:text-gold"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${
                  isSyncingFeed ? "animate-spin" : ""
                }`}
              />
              <span>
                {isSyncingFeed ? "Syncing..." : "Sync MCX Feed"}
              </span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewTierModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Purity / Margin Tier</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleBroadcast}
            >
              <Radio className="w-3.5 h-3.5 mr-1" />
              <span>Broadcast Spot Fix</span>
            </Button>
          </div>
        </div>

        {/* Live Commodity Exchange Ingestion Banner (Pathway C) */}
        <Card className="p-3.5 bg-surface-elevated/70 border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-lg bg-gold/10 border border-gold/20 text-gold flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-semibold text-foreground">
                  Commodity Exchange Ingestion Engine (MCX / LBMA / IBJA)
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-surface border border-surface-border text-gold font-bold">
                  MCX Continuous Parity
                </span>
                <Badge variant={isConnected ? "emerald" : "gold"} dot>
                  {isConnected ? "WebSocket Stream Live" : "Feed Active"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tariff-Adjusted Calculation: [LBMA USD/oz × 84.45 FX ÷ 31.1035] × 1.06 (Customs Duty) + ₹45 Refiner Premium = Au 24K Benchmark
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right font-mono text-xs">
              <div className="text-muted-foreground text-[10px]">Active Benchmark</div>
              <div className="text-gold font-bold">
                ₹{liveGoldRate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/g
              </div>
            </div>
            <Button
              variant="gold"
              size="sm"
              disabled={isSyncingFeed}
              onClick={handleSyncExchange}
              className="text-xs font-mono"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${
                  isSyncingFeed ? "animate-spin" : ""
                }`}
              />
              <span>Trigger Live Ingestion</span>
            </Button>
          </div>
        </Card>

        {/* 4 Summary Metric Cards */}
        <WorkstationKpiGrid items={pricingKpiItems} />

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <AlloyRuleInspector
              alloy={selectedAlloy}
              parentGroupName={selectedGroupName}
            />
          }
        >
          {/* Left Column (65%): Pricing Tiers Directory */}
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Karat Tag, Alloy Description, Formula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Tiers" },
                  { id: "24K", label: "24K Bullion" },
                  { id: "22K", label: "22K Jewellery" },
                  { id: "18K", label: "18K Diamonds" },
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

            {/* Hierarchical Pricing Groups */}
            <div className="space-y-4">
              {filteredGroups.map((group, idx) => (
                <PricingTierSection
                  key={group.id}
                  group={group}
                  selectedAlloyId={selectedAlloy?.id}
                  onSelectAlloy={(alloy, g) => handleSelectAlloy(alloy, g)}
                  defaultExpanded={idx === 0}
                />
              ))}

              {filteredGroups.every((g) => g.alloys.length === 0) && (
                <Card className="text-center py-12 text-muted-foreground text-xs">
                  No matching bullion alloy pricing rules found.
                </Card>
              )}
            </div>
          </div>
        </WorkstationLayout>

        {/* Modal for New Pricing Tier */}
        <NewPricingTierModal
          isOpen={isNewTierModalOpen}
          onClose={() => setIsNewTierModalOpen(false)}
          onCreated={handleTierCreated}
        />

        {/* Modal for Live Bullion Rate Fix & Price Snapshots */}
        <PublishRateFixModal
          isOpen={isRateFixModalOpen}
          onClose={() => setIsRateFixModalOpen(false)}
          currentGoldRate={liveGoldRate}
          onRatesPublished={handleRatesPublished}
        />
      </div>
    </AppShell>
  );
}
