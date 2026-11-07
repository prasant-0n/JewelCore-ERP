"use client";

import React, { useState } from "react";
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
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  Search,
  Plus,
  Radio,
  Sliders,
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
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const totalRulesCount = pricingGroups.reduce(
    (acc, g) => acc + g.alloys.length,
    0,
  );

  const pricingKpiItems: KpiItem[] = [
    {
      id: "kpi-mcx-spot",
      title: "MCX 24K Gold Spot",
      value: "₹7,450.50 / g",
      subValue: "+0.64% Today (+₹46.80)",
      badge: { text: "+0.64%", variant: "emerald" },
      icon: <TrendingUp className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-22k-bench",
      title: "22K Benchmark (Au 916)",
      value: "₹6,824.00 / g",
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
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      toast.success("Bullion Spot Fixing Broadcasted", {
        description:
          "Published updated rates to 14 POS counter terminals. Zero latency drift.",
      });
    }, 800);
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
                MCX Gold Spot ₹7,450.50/g • Reuters IBJA Feed Live
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bullion Fixing, Dynamic Making Charges &amp; Margin Rules
            </h1>
          </div>

          <div className="flex items-center space-x-3">
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
              isLoading={isBroadcasting}
            >
              <Radio className="w-3.5 h-3.5 mr-1" />
              <span>Broadcast Spot Fix</span>
            </Button>
          </div>
        </div>

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
              {filteredGroups.map((group) => (
                <PricingTierSection
                  key={group.id}
                  group={group}
                  selectedAlloyId={selectedAlloy?.id}
                  onSelectAlloy={(alloy, g) => handleSelectAlloy(alloy, g)}
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
      </div>
    </AppShell>
  );
}
