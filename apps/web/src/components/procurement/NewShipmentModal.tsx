"use client";

import React, { useState } from "react";
import { X, Plus, Truck, Scale, Shield, Check } from "lucide-react";

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewShipmentModal({
  isOpen,
  onClose,
  onCreated,
}: NewShipmentModalProps) {
  const [supplier, setSupplier] = useState("Valcambi Suisse");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [metalType, setMetalType] = useState("Au 999.9 Fine Gold Ingot (24K)");
  const [barCount, setBarCount] = useState("3");
  const [declaredWeight, setDeclaredWeight] = useState("3000.000");
  const [sealNumber, setSealNumber] = useState("TS-8824");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) {
      setError("Please provide an Air Waybill or Delivery Tracking Number.");
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
      setError(err instanceof Error ? err.message : "Failed to log shipment");
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
                Log Inbound Bullion Shipment
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Flagship Mumbai (INV-11) Receiving Bay
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
              <span>Inbound shipment logged! Ready for scale tare verification.</span>
            </div>
          )}

          {/* Supplier Selector */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Accredited Refiner / Supplier:
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
            >
              <option value="Valcambi Suisse">Valcambi Suisse (LBMA Good Delivery)</option>
              <option value="MMTC-PAMP India">MMTC-PAMP India (BIS Hallmark Accredited)</option>
              <option value="Argor-Heraeus Switzerland">Argor-Heraeus Switzerland (LBMA Accredited)</option>
              <option value="Rand Refinery South Africa">Rand Refinery South Africa</option>
            </select>
          </div>

          {/* Tracking Number & Seal # */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Air Waybill / Delivery Note #:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LX-94025"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder-platinum/40 focus:outline-none focus:border-gold/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Armored Seal #:
              </label>
              <input
                type="text"
                required
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold/60"
              />
            </div>
          </div>

          {/* Material & Karatage */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Material Specification:
            </label>
            <select
              value={metalType}
              onChange={(e) => setMetalType(e.target.value)}
              className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
            >
              <option value="Au 999.9 Fine Gold Ingot (24K)">Au 999.9 Fine Gold Ingot (24K)</option>
              <option value="Au 999.9 Fine Gold Shot / Grain (24K)">Au 999.9 Fine Gold Shot / Grain (24K)</option>
              <option value="Au 995.0 Cast Dore Bars">Au 995.0 Cast Dore Bars</option>
              <option value="Pt 950 Platinum Sponge / Ingot">Pt 950 Platinum Sponge / Ingot</option>
              <option value="Ag 999.0 Silver 1kg Minted Bars">Ag 999.0 Silver 1kg Minted Bars</option>
            </select>
          </div>

          {/* Ingot Count & Declared Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Ingot / Unit Count:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={barCount}
                onChange={(e) => setBarCount(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Declared Invoice Wt (g):
              </label>
              <input
                type="number"
                step="0.001"
                min="1"
                value={declaredWeight}
                onChange={(e) => setDeclaredWeight(e.target.value)}
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
              {isSubmitting ? "Logging Inbound..." : "Log Inbound Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
