"use client";

import React, { useState } from "react";
import { AlloyPricingCard, AlloyRuleData } from "./AlloyPricingCard";
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Scale,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface PricingTierGroupData {
  id: string;
  tierName: string;
  categoryTag: string;
  description: string;
  activeCount: number;
  status: "LIVE_PEG_ACTIVE" | "SYNCED" | "SCHEDULED";
  alloys: AlloyRuleData[];
}

interface PricingTierSectionProps {
  group: PricingTierGroupData;
  selectedAlloyId?: string;
  onSelectAlloy?: (alloy: AlloyRuleData, group: PricingTierGroupData) => void;
  defaultExpanded?: boolean;
}

export function PricingTierSection({
  group,
  selectedAlloyId,
  onSelectAlloy,
  defaultExpanded = false,
}: PricingTierSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Tier Header Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-surface-elevated/70 hover:bg-surface-elevated border-b border-surface-border flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-gold">
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-foreground font-mono tracking-tight">
                {group.tierName}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                {group.categoryTag}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{group.alloys.length} Active Rules</span>
              <span>•</span>
              <span className="text-foreground font-medium">
                {group.description}
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Peg Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            {group.activeCount} Purity Tiers Synced
          </span>
        </div>
      </div>

      {/* Expanded Alloy Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              Alloy Quotation Matrix ({group.alloys.length} Formulas Active)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              MCX WebSocket Latency 14ms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5">
            {group.alloys.map((alloy) => (
              <AlloyPricingCard
                key={alloy.id}
                alloy={alloy}
                isSelected={selectedAlloyId === alloy.id}
                onSelect={(a) => onSelectAlloy?.(a, group)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
