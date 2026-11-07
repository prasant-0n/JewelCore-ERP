"use client";

import React, { useState } from "react";
import { X, Plus, FlaskConical, Microscope, Check } from "lucide-react";

interface NewQcBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewQcBatchModal({
  isOpen,
  onClose,
  onCreated,
}: NewQcBatchModalProps) {
  const [batchName, setBatchName] = useState("Inward Gold Casting Grain Lot #B-991");
  const [inspectorName, setInspectorName] = useState("Dr. A. Joshi");
  const [instrument, setInstrument] = useState("Thermo Niton XL5 Plus (COM4)");
  const [alloyKarat, setAlloyKarat] = useState("Au 999.9 Fine Gold (24K)");
  const [itemCount, setItemCount] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName) {
      setError("Please specify a batch description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 600));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onCreated?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create QC batch");
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
                Initiate Analytical QC Session
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Flagship Mumbai (INV-11) Metallurgical Lab
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
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>QC Inspection session queued! Spectrometer fixture armed.</span>
            </div>
          )}

          {/* Batch Description */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              QC Inspection Batch Title:
            </label>
            <input
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
            />
          </div>

          {/* Lead Metallurgist & Instrument */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Lead Metallurgist:
              </label>
              <input
                type="text"
                required
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Testing Instrument:
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
              >
                <option value="Thermo Niton XL5 Plus (COM4)">Thermo Niton XL5 Plus (COM4)</option>
                <option value="Oxford X-Strata 920 (COM2)">Oxford X-Strata 920 (COM2)</option>
                <option value="Mettler Hydrostatic Density Kit">Mettler Hydrostatic Density Kit</option>
              </select>
            </div>
          </div>

          {/* Alloy Karat & Item Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Target Alloy Karat:
              </label>
              <select
                value={alloyKarat}
                onChange={(e) => setAlloyKarat(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
              >
                <option value="Au 999.9 Fine Gold (24K)">Au 999.9 Fine Gold (24K)</option>
                <option value="Au 916 Temple Antique (22K)">Au 916 Temple Antique (22K)</option>
                <option value="Au 750 Diamond Jewellery (18K)">Au 750 Diamond Jewellery (18K)</option>
                <option value="Pt 950 Pure Platinum">Pt 950 Pure Platinum</option>
                <option value="Ag 999 Sterling / Bullion">Ag 999 Sterling / Bullion</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Items in Fixture Stage:
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={itemCount}
                onChange={(e) => setItemCount(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold/60"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs font-medium text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Queueing Batch..." : "Initiate QC Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
