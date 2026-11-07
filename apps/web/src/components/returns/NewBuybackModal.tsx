"use client";

import React, { useState } from "react";
import { X, Flame, Scale, Plus, Check, FlaskConical } from "lucide-react";
import { ScrapPieceData } from "./ScrapItemCard";

interface NewBuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (item: ScrapPieceData, targetBatchId: string) => void;
}

export function NewBuybackModal({
  isOpen,
  onClose,
  onCreated,
}: NewBuybackModalProps) {
  const [targetBatchId, setTargetBatchId] = useState("batch-01");
  const [clientName, setClientName] = useState("Mrs. Meenakshi Sundaram");
  const [description, setDescription] = useState("22K Antique Filigree Bangle Pair");
  const [grossWeightGrams, setGrossWeightGrams] = useState("54.200");
  const [stoneWeightDeduction, setStoneWeightDeduction] = useState("2.100");
  const [assayedFinenessPercent, setAssayedFinenessPercent] = useState("91.60");
  const [specificGravity, setSpecificGravity] = useState("17.55");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !grossWeightGrams) {
      setError("Please fill in item description and gross weight.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 600));

      const gross = parseFloat(grossWeightGrams) || 54.2;
      const stones = parseFloat(stoneWeightDeduction) || 0;
      const netGold = Math.max(0, gross - stones);
      const fineness = parseFloat(assayedFinenessPercent) || 91.6;
      const pureGold = netGold * (fineness / 100);
      const spotRate = 7340.5;
      const payout = Math.round(pureGold * spotRate * 0.985); // 1.5% refining deduction

      const newItem: ScrapPieceData = {
        id: `bb-itm-${Date.now()}`,
        itemCode: `BB-ITM-${Math.floor(10 + Math.random() * 90)}`,
        description,
        category: "Customer Old Gold",
        grossWeightGrams: gross,
        netGoldGrams: netGold,
        extractedStoneCarats: stones > 0 ? stones * 5 : undefined,
        assayedFinenessPercent: fineness,
        specificGravity: parseFloat(specificGravity) || 17.55,
        payoutValueInr: payout,
        status: "ASSAY_PASSED",
        alloyClassification: "22K Yellow Gold (Au 916)",
      };

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onCreated?.(newItem, targetBatchId);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record buyback");
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
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Customer Old Gold Buyback Intake & Assay
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Hydrostatic Balance & Niton XRF Inspection • Atelier Lab
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
              <span>Old gold scrap assayed and allocated to induction smelt lot!</span>
            </div>
          )}

          {/* Target Batch Selection */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Target Crucible Melt Batch:
            </label>
            <select
              value={targetBatchId}
              onChange={(e) => setTargetBatchId(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
            >
              <option value="batch-01">Batch #BB-2026-044: Royal Kundan & Antique 22K Melt Lot</option>
              <option value="batch-02">Batch #BB-2026-045: Atelier Bench Sweeps & Filing Dust</option>
              <option value="batch-03">Batch #RET-2026-012: Store Customer Exchange & Resale Assessment</option>
            </select>
          </div>

          {/* Client & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Customer / KYC Record:
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Item Description:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          {/* Metrology & Weights */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Gross Wt (g):
              </label>
              <input
                type="number"
                step="0.001"
                value={grossWeightGrams}
                onChange={(e) => setGrossWeightGrams(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-gold font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Stone Wt (g):
              </label>
              <input
                type="number"
                step="0.001"
                value={stoneWeightDeduction}
                onChange={(e) => setStoneWeightDeduction(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                XRF Fineness (%):
              </label>
              <input
                type="number"
                step="0.01"
                value={assayedFinenessPercent}
                onChange={(e) => setAssayedFinenessPercent(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-gold"
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
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Weighing & Assaying..." : "Record Buyback & Assay"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
