"use client";

import React, { useState } from "react";
import { X, TrendingUp, Plus, Check, Scale } from "lucide-react";
import { AlloyRuleData } from "./AlloyPricingCard";

interface NewPricingTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (alloy: AlloyRuleData, targetGroupId: string) => void;
}

export function NewPricingTierModal({
  isOpen,
  onClose,
  onCreated,
}: NewPricingTierModalProps) {
  const [targetGroupId, setTargetGroupId] = useState("grp-alloys");
  const [alloyName, setAlloyName] = useState("Au 585 Rose Gold (14K)");
  const [karatTag, setKaratTag] = useState("14K");
  const [finenessPurity, setFinenessPurity] = useState("14K Hallmark (58.5% Au)");
  const [spotPricePerGram, setSpotPricePerGram] = useState("4294.20");
  const [makingChargePercent, setMakingChargePercent] = useState("20.0");
  const [wastagePercent, setWastagePercent] = useState("2.50");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alloyName || !spotPricePerGram) {
      setError("Please specify alloy name and spot base price.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 600));

      const spot = parseFloat(spotPricePerGram) || 4294.2;
      const makingPct = parseFloat(makingChargePercent) || 20.0;
      const wastagePct = parseFloat(wastagePercent) || 2.5;
      const calculated = spot * (1 + wastagePct / 100) + spot * (makingPct / 100);

      const newAlloy: AlloyRuleData = {
        id: `alloy-${Date.now()}`,
        alloyName,
        karatTag,
        finenessPurity,
        spotPricePerGram: spot,
        makingChargePercent: makingPct,
        makingChargeFixedPerGram: 0,
        wastagePercent: wastagePct,
        calculatedRetailPerGram: calculated * 1.03, // including GST
        status: "ACTIVE",
        volatilityIndexPercent: 12.8,
        hedgingCoverPercent: 98.4,
        targetTerminalsCount: 12,
        lastUpdated: "Just now",
      };

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onCreated?.(newAlloy, targetGroupId);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pricing rule");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-card border border-surface-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Add Purity & Margin Quotation Tier
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                MCX Commodity Feed Linked • Atelier Margin Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4" />
              <span>Pricing tier rule created and linked to MCX spot formula!</span>
            </div>
          )}

          {/* Target Group Selection */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Pricing Tier Matrix Group:
            </label>
            <select
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
            >
              <option value="grp-alloys">Gold Alloy Fixing Matrix (Live Market Pegged)</option>
              <option value="grp-making">Dynamic Making Charges Matrix (Atelier Craft)</option>
              <option value="grp-promos">Festival & VIP Client Privilege Tiers</option>
            </select>
          </div>

          {/* Alloy Name & Karat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Alloy / Blend Title:
              </label>
              <input
                type="text"
                value={alloyName}
                onChange={(e) => setAlloyName(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Fineness Specification:
              </label>
              <input
                type="text"
                value={finenessPurity}
                onChange={(e) => setFinenessPurity(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          {/* Spot, Making & Wastage Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Spot Fix (₹/g):
              </label>
              <input
                type="number"
                step="0.01"
                value={spotPricePerGram}
                onChange={(e) => setSpotPricePerGram(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-gold font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Making Charge (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={makingChargePercent}
                onChange={(e) => setMakingChargePercent(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Wastage (%):
              </label>
              <input
                type="number"
                step="0.05"
                value={wastagePercent}
                onChange={(e) => setWastagePercent(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-platinum/80 hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold hover:bg-gold-light text-obsidian shadow-lg shadow-gold/20 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Linking Formula..." : "Create & Authorize Rule"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
