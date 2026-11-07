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
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";

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
        spotPricePerGram: 7340.5,
        makingChargePercent: 0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 0.2,
        calculatedRetailPerGram: 7358.85,
        status: "LOCKED",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 99.2,
        targetTerminalsCount: 12,
        lastUpdated: "15:40:12",
      },
      {
        id: "alloy-22k",
        alloyName: "Au 916 Standard Gold (22K)",
        karatTag: "22K",
        finenessPurity: "Hallmark Jewellery Benchmark • 91.60% Fineness",
        spotPricePerGram: 6723.9,
        makingChargePercent: 12.5,
        makingChargeFixedPerGram: 0,
        wastagePercent: 1.5,
        calculatedRetailPerGram: 7564.38,
        status: "ACTIVE",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 98.4,
        targetTerminalsCount: 12,
        lastUpdated: "15:40:12",
      },
      {
        id: "alloy-18k",
        alloyName: "Au 750 Artisan Gold (18K)",
        karatTag: "18K",
        finenessPurity: "Diamond Setting Alloy • 75.00% Fineness",
        spotPricePerGram: 5505.38,
        makingChargePercent: 18.0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 2.0,
        calculatedRetailPerGram: 6496.35,
        status: "ACTIVE",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 98.4,
        targetTerminalsCount: 12,
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
        spotPricePerGram: 6723.9,
        makingChargePercent: 24.5,
        makingChargeFixedPerGram: 0,
        wastagePercent: 3.5,
        calculatedRetailPerGram: 8606.59,
        status: "ACTIVE",
        volatilityIndexPercent: 10.5,
        hedgingCoverPercent: 96.0,
        targetTerminalsCount: 12,
        lastUpdated: "15:35:00",
      },
      {
        id: "mc-filigree",
        alloyName: "Calcutta Wire Filigree Surcharge",
        karatTag: "Artisan Hand",
        finenessPurity: "0.2mm Solid Gold Wire Drawing Labor",
        spotPricePerGram: 6723.9,
        makingChargePercent: 19.0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 2.8,
        calculatedRetailPerGram: 8189.71,
        status: "ACTIVE",
        volatilityIndexPercent: 10.5,
        hedgingCoverPercent: 96.0,
        targetTerminalsCount: 12,
        lastUpdated: "15:35:00",
      },
      {
        id: "mc-cast",
        alloyName: "Precision Vacuum Cast Machine Work",
        karatTag: "High Precision",
        finenessPurity: "Automated German Induction Casting",
        spotPricePerGram: 6723.9,
        makingChargePercent: 8.5,
        makingChargeFixedPerGram: 0,
        wastagePercent: 0.8,
        calculatedRetailPerGram: 7349.22,
        status: "ACTIVE",
        volatilityIndexPercent: 10.5,
        hedgingCoverPercent: 99.0,
        targetTerminalsCount: 12,
        lastUpdated: "15:35:00",
      },
    ],
  },
  {
    id: "grp-diamond",
    tierName: "Diamond Rapaport Index & Solitaire Tables",
    categoryTag: "Rapaport Peg",
    description: "Real-Time USD/INR Rapaport Parity Index",
    activeCount: 4,
    status: "SYNCED",
    alloys: [
      {
        id: "rap-1ct",
        alloyName: "1.00 - 1.49 ct D-F VVS Solitaire Base",
        karatTag: "GIA / IGI",
        finenessPurity: "Rapaport $6,800/ct • Parity Multiplier 0.92",
        spotPricePerGram: 525000.0,
        makingChargePercent: 5.0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 0.0,
        calculatedRetailPerGram: 551250.0,
        status: "ACTIVE",
        volatilityIndexPercent: 8.4,
        hedgingCoverPercent: 100.0,
        targetTerminalsCount: 12,
        lastUpdated: "15:30:00",
      },
      {
        id: "rap-2ct",
        alloyName: "2.00 - 2.99 ct Triple Ex Solitaire Base",
        karatTag: "GIA Certified",
        finenessPurity: "Rapaport $14,200/ct • Parity Multiplier 0.95",
        spotPricePerGram: 1140000.0,
        makingChargePercent: 4.5,
        makingChargeFixedPerGram: 0,
        wastagePercent: 0.0,
        calculatedRetailPerGram: 1191300.0,
        status: "ACTIVE",
        volatilityIndexPercent: 8.4,
        hedgingCoverPercent: 100.0,
        targetTerminalsCount: 12,
        lastUpdated: "15:30:00",
      },
    ],
  },
  {
    id: "grp-hedging",
    tierName: "Treasury FX & MCX Hedging Multipliers",
    categoryTag: "Hedging Book",
    description: "USD/INR 84.12 • MCX Gold Mini Hedge Position 98.4%",
    activeCount: 3,
    status: "SYNCED",
    alloys: [
      {
        id: "hdg-mcx-mini",
        alloyName: "MCX Gold Mini Dec Futures Contract",
        karatTag: "Derivatives",
        finenessPurity: "Hedging Contract #MCX-GLD-MINI-DEC26",
        spotPricePerGram: 7338.0,
        makingChargePercent: 0,
        makingChargeFixedPerGram: 0,
        wastagePercent: 0,
        calculatedRetailPerGram: 7338.0,
        status: "LOCKED",
        volatilityIndexPercent: 14.2,
        hedgingCoverPercent: 98.4,
        targetTerminalsCount: 12,
        lastUpdated: "15:40:00",
      },
    ],
  },
];

export default function PricingMasterPage() {
  const [groups, setGroups] =
    useState<PricingTierGroupData[]>(INITIAL_PRICING_GROUPS);
  const [selectedAlloy, setSelectedAlloy] = useState<AlloyRuleData | null>(
    INITIAL_PRICING_GROUPS[0].alloys[0]
  );
  const [selectedGroupName, setSelectedGroupName] = useState<string>(
    INITIAL_PRICING_GROUPS[0].tierName
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isNewTierModalOpen, setIsNewTierModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastNotification, setBroadcastNotification] = useState<
    string | null
  >(null);

  // Compute metrics
  const totalRulesCount = groups.reduce((acc, g) => acc + g.alloys.length, 0);

  // Filter groups
  const filteredGroups = groups.map((grp) => {
    let alloys = grp.alloys;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      alloys = alloys.filter(
        (a) =>
          a.alloyName.toLowerCase().includes(q) ||
          a.finenessPurity.toLowerCase().includes(q) ||
          a.karatTag.toLowerCase().includes(q)
      );
    }
    if (filterState === "ALLOYS") {
      alloys = alloys.filter((a) => a.karatTag.includes("K"));
    } else if (filterState === "MAKING") {
      alloys = alloys.filter((a) => a.makingChargePercent > 0);
    } else if (filterState === "DIAMOND") {
      alloys = alloys.filter(
        (a) => a.karatTag.includes("GIA") || a.alloyName.includes("Solitaire")
      );
    }
    return { ...grp, alloys };
  });

  const handleSelectAlloy = (
    alloy: AlloyRuleData,
    group: PricingTierGroupData
  ) => {
    setSelectedAlloy(alloy);
    setSelectedGroupName(group.tierName);
  };

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    setBroadcastNotification(
      "Signing cryptographic bullion spot fix and broadcasting to 12 Flagship POS cash registers..."
    );

    await new Promise((res) => setTimeout(res, 1200));

    setIsBroadcasting(false);
    setBroadcastNotification(
      "Mid-Day Bullion Fix successfully propagated! All 12 POS Terminals & Mobile Handhelds synchronized."
    );
    setTimeout(() => setBroadcastNotification(null), 4000);
  };

  const handleCreatedTier = (newAlloy: AlloyRuleData, targetGroupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === targetGroupId) {
          return {
            ...g,
            activeCount: g.activeCount + 1,
            alloys: [newAlloy, ...g.alloys],
          };
        }
        return g;
      })
    );
    setSelectedAlloy(newAlloy);
    const foundGroup = groups.find((g) => g.id === targetGroupId);
    if (foundGroup) setSelectedGroupName(foundGroup.tierName);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, Market Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/60">
              <span>JewelCore ERP</span>
              <span>/</span>
              <span>Commercial & Treasury</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Bullion Fixing & Dynamic Pricing Engine
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Bullion Fixing, Dynamic Making Charges & Margin Rules</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MCX Gold Spot ₹7,340.50/g • Reuters IBJA Feed Live • Latency 14ms
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsNewTierModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-platinum/70" />
              <span>+ Add Purity / Margin Tier</span>
            </button>

            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Radio
                className={`w-4 h-4 text-obsidian ${
                  isBroadcasting ? "animate-pulse" : ""
                }`}
              />
              <span>
                {isBroadcasting
                  ? "Broadcasting Spot Fix..."
                  : "Broadcast Spot Fix to POS Terminals"}
              </span>
            </button>
          </div>
        </div>

        {/* Broadcast Status Notification Banner */}
        {broadcastNotification && (
          <div className="p-3 rounded-xl bg-surface-card border border-gold/40 flex items-center justify-between text-xs font-mono text-gold animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>{broadcastNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              POS Synced (12/12)
            </span>
          </div>
        )}

        {/* 4 Metric KPI Cards matching Screen 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>MCX 24K Gold Spot</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
              ₹ 7,340.50 / g
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>+0.64% Today (+₹46.80)</span>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>22K Benchmark (Au 916)</span>
              <Scale className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-gold tracking-tight tabular-nums">
              ₹ 6,723.90 / g
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Base Jeweller Standard
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Active Margin Rules</span>
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              {totalRulesCount} Active Tiers
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Atelier & Retail Synced
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Treasury Hedging Cover</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              98.4% Hedged
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              MCX Gold Mini Contracts
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
                  placeholder="Filter by Karat, Alloy, Making Tier or Rule ID..."
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
                  All Rules ({totalRulesCount})
                </button>
                <button
                  onClick={() => setFilterState("ALLOYS")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "ALLOYS"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Gold Alloys
                </button>
                <button
                  onClick={() => setFilterState("MAKING")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "MAKING"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Making Charges
                </button>
                <button
                  onClick={() => setFilterState("DIAMOND")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "DIAMOND"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Diamond Carat Index
                </button>
              </div>
            </div>

            {/* Hierarchical Pricing Tiers & Alloy Matrix Grids */}
            <div className="space-y-4">
              {filteredGroups.map((grp, idx) => (
                <PricingTierSection
                  key={grp.id}
                  group={grp}
                  defaultExpanded={idx === 0}
                  selectedAlloyId={selectedAlloy?.id}
                  onSelectAlloy={(alloy, g) => handleSelectAlloy(alloy, g)}
                />
              ))}

              {filteredGroups.every((g) => g.alloys.length === 0) && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <Scale className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching bullion or margin rules found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or create a new quotation tier.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <AlloyRuleInspector
              alloy={selectedAlloy}
              parentGroupName={selectedGroupName}
              onClose={() => setSelectedAlloy(null)}
              onLockFix={(alloy) => {
                // Update alloy status to LOCKED
                setGroups((prev) =>
                  prev.map((g) => ({
                    ...g,
                    alloys: g.alloys.map((a) =>
                      a.id === alloy.id
                        ? { ...a, status: "LOCKED" as const }
                        : a
                    ),
                  }))
                );
                setSelectedAlloy((prev) =>
                  prev ? { ...prev, status: "LOCKED" } : null
                );
              }}
              onSimulateImpact={() => {
                // Refresh simulated MCX feed
              }}
            />
          </div>
        </div>

        {/* Modal for New Pricing Tier */}
        <NewPricingTierModal
          isOpen={isNewTierModalOpen}
          onClose={() => setIsNewTierModalOpen(false)}
          onCreated={handleCreatedTier}
        />
      </div>
    </AppShell>
  );
}
