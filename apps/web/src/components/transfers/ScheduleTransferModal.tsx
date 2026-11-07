"use client";

import React, { useState } from "react";
import { X, Truck, ShieldCheck, Plus, Check } from "lucide-react";
import { ConsignmentItemData } from "./ConsignmentItemCard";

interface ScheduleTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (item: ConsignmentItemData, targetManifestId: string) => void;
}

export function ScheduleTransferModal({
  isOpen,
  onClose,
  onScheduled,
}: ScheduleTransferModalProps) {
  const [targetManifestId, setTargetManifestId] = useState("man-01");
  const [destinationVault, setDestinationVault] = useState("New Delhi Connaught Place Vault (INV-02)");
  const [trayDescription, setTrayDescription] = useState("Artisan Diamond Solitaire Pendants & Bangles");
  const [pieceCount, setPieceCount] = useState("24");
  const [grossWeightGrams, setGrossWeightGrams] = useState("412.500");
  const [specieValuationInr, setSpecieValuationInr] = useState("8500000");
  const [electronicSealId, setElectronicSealId] = useState("ELEC-SEAL-9920");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trayDescription || !grossWeightGrams) {
      setError("Please fill in tray description and gross weight.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 600));

      const gross = parseFloat(grossWeightGrams) || 412.5;
      const count = parseInt(pieceCount, 10) || 24;
      const val = parseFloat(specieValuationInr) || 8500000;

      const newItem: ConsignmentItemData = {
        id: `tr-itm-${Date.now()}`,
        itemCode: `TR-ITM-${Math.floor(10 + Math.random() * 90)}`,
        trayDescription,
        category: "High Jewellery Consignment",
        pieceCount: count,
        grossWeightGrams: gross,
        netGoldGrams: gross * 0.78,
        specieValuationInr: val,
        electronicSealId,
        status: "GEOFENCE_LOCKED",
        securityTier: "Armored Safe B6",
      };

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onScheduled?.(newItem, targetManifestId);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule transfer");
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
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Schedule Armored Transit & Dual-Custody Manifest
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Brinks B6 Armored Transit Protocol • Lloyd's Specie Insured
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
              <span>Armored dispatch scheduled! Electronic tamper seal paired & logged.</span>
            </div>
          )}

          {/* Destination Vault Selection */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Destination Vault / Target Branch:
            </label>
            <select
              value={destinationVault}
              onChange={(e) => setDestinationVault(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
            >
              <option value="New Delhi Connaught Place Vault (INV-02)">New Delhi Connaught Place Vault (INV-02)</option>
              <option value="Bangalore Indiranagar Showroom (INV-05)">Bangalore Indiranagar Showroom (INV-05)</option>
              <option value="Airport Bonded Exhibition Transit (Geneva Salon)">Airport Bonded Exhibition Transit (Geneva Salon)</option>
              <option value="Surat Atelier Refinery Safe (INV-03)">Surat Atelier Refinery Safe (INV-03)</option>
            </select>
          </div>

          {/* Tray Description */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Consignment Description:
            </label>
            <input
              type="text"
              value={trayDescription}
              onChange={(e) => setTrayDescription(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold"
              required
            />
          </div>

          {/* Weights & Seals */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Pieces Count:
              </label>
              <input
                type="number"
                value={pieceCount}
                onChange={(e) => setPieceCount(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
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
                Declared ₹ Val:
              </label>
              <input
                type="number"
                value={specieValuationInr}
                onChange={(e) => setSpecieValuationInr(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          {/* Electronic Seal */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              UHF Electronic Tamper Seal Barcode:
            </label>
            <input
              type="text"
              value={electronicSealId}
              onChange={(e) => setElectronicSealId(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-gold font-mono focus:outline-none focus:border-gold"
              required
            />
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
              <Truck className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Pairing Geofence Mesh..." : "Schedule Armored Dispatch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
