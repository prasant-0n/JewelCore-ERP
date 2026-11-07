"use client";

import React, { useState } from "react";
import { X, Radio, Plus, Check, Scan, Scale } from "lucide-react";
import { RfidPieceData } from "./RfidTagCard";

interface ManualTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (piece: RfidPieceData, targetTrayId: string) => void;
}

export function ManualTagModal({
  isOpen,
  onClose,
  onRegistered,
}: ManualTagModalProps) {
  const [targetTrayId, setTargetTrayId] = useState("tray-01");
  const [epcTag, setEpcTag] = useState("E280-1160-2000-7741-0105");
  const [serialNumber, setSerialNumber] = useState("JC-SOL-2026-095");
  const [itemName, setItemName] = useState("18K Solitaire Princess Diamond Ring (1.60ct)");
  const [metalPurity, setMetalPurity] = useState("18K Yellow Gold (Au 750)");
  const [grossWeightGrams, setGrossWeightGrams] = useState("5.920");
  const [netGoldGrams, setNetGoldGrams] = useState("5.600");
  const [diamondCarat, setDiamondCarat] = useState("1.60");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epcTag || !serialNumber || !itemName) {
      setError("Please fill in EPC tag, serial number, and item title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 600));

      const newPiece: RfidPieceData = {
        id: `rfid-${Date.now()}`,
        epcTag,
        serialNumber,
        itemName,
        category: "Solitaire Rings",
        metalPurity,
        grossWeightGrams: parseFloat(grossWeightGrams) || 5.92,
        netGoldGrams: parseFloat(netGoldGrams) || 5.6,
        diamondCarat: diamondCarat ? parseFloat(diamondCarat) : undefined,
        status: "VERIFIED",
        rssiDbm: -38,
        antennaPort: 1,
        readCount: 168,
        frequencyMhz: 866.5,
        phaseAngleDeg: 124.5,
        expectedLocation: "Showroom Counter A, Tray 01",
        lastScannedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onRegistered?.(newPiece, targetTrayId);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register tag");
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
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Manual RFID Tag Registration & Pairing
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Atelier Handheld Wand • Real-Time Mesh Pairing
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
              <span>Tag paired and verified against live Impinj carrier frequency!</span>
            </div>
          )}

          {/* Target Tray Selection */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Destination Scan Tray:
            </label>
            <select
              value={targetTrayId}
              onChange={(e) => setTargetTrayId(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
            >
              <option value="tray-01">Tray #01: High-Jewellery Solitaire Rings (Counter A)</option>
              <option value="tray-02">Tray #02: Kundan & Polki Bridal Necklaces (Counter B)</option>
              <option value="tray-03">Tray #03: Royal Calcutta Filigree Bangles (Main Vault Tray 04)</option>
              <option value="tray-04">Tray #04: Minted Bullion & Ingot Assay Rack (Vault 01)</option>
            </select>
          </div>

          {/* EPC Tag & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                UHF RFID EPC Tag:
              </label>
              <input
                type="text"
                value={epcTag}
                onChange={(e) => setEpcTag(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-gold font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Jewellery Serial / SKU:
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Piece Name / Specification:
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
              required
            />
          </div>

          {/* Weight & Metrology */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Alloy:
              </label>
              <select
                value={metalPurity}
                onChange={(e) => setMetalPurity(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
              >
                <option value="18K Yellow Gold (Au 750)">18K Yellow</option>
                <option value="22K Yellow Gold (Au 916)">22K Yellow</option>
                <option value="18K White Gold (Au 750)">18K White</option>
                <option value="Platinum (Pt 950)">Pt 950</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Gross (g):
              </label>
              <input
                type="number"
                step="0.001"
                value={grossWeightGrams}
                onChange={(e) => setGrossWeightGrams(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Stone (ct):
              </label>
              <input
                type="number"
                step="0.01"
                value={diamondCarat}
                onChange={(e) => setDiamondCarat(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
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
              <Scan className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Pairing Tag Carrier..." : "Register & Pair Tag"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
