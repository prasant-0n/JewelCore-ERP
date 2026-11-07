"use client";

import React, { useState } from "react";
import { X, Sparkles, Gem, Scale, Radio, Check, ShieldCheck } from "lucide-react";
import { InventoryPieceData } from "./PieceCard";

interface BirthPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (piece: InventoryPieceData) => void;
}

export function BirthPieceModal({
  isOpen,
  onClose,
  onCreated,
}: BirthPieceModalProps) {
  const [serialNumber, setSerialNumber] = useState("JC-SOL-2026-9041");
  const [itemName, setItemName] = useState("18K Solitaire Emerald-Cut Diamond Ring (1.75ct)");
  const [category, setCategory] = useState("Solitaire Rings");
  const [metalPurity, setMetalPurity] = useState("18K Yellow Gold (Au 750)");
  const [grossWeightGrams, setGrossWeightGrams] = useState("5.850");
  const [netGoldGrams, setNetGoldGrams] = useState("5.500");
  const [diamondCarat, setDiamondCarat] = useState("1.75");
  const [diamondClarity, setDiamondClarity] = useState("VVS1");
  const [diamondColor, setDiamondColor] = useState("E");
  const [giaCertNumber, setGiaCertNumber] = useState("GIA-2210894511");
  const [currentLocation, setCurrentLocation] = useState("Main Vault - Section A (Locker 01)");
  const [epcRfidTag, setEpcRfidTag] = useState("E280-1160-2000-7741-0099");
  const [priceInr, setPriceInr] = useState("485000");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber || !itemName) {
      setError("Please specify a serial number and item description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 600));

      const newPiece: InventoryPieceData = {
        id: `piece-${Date.now()}`,
        serialNumber,
        itemName,
        category,
        metalPurity,
        grossWeightGrams: parseFloat(grossWeightGrams) || 5.85,
        netGoldGrams: parseFloat(netGoldGrams) || 5.5,
        diamondCarat: diamondCarat ? parseFloat(diamondCarat) : undefined,
        diamondClarity: diamondClarity || undefined,
        diamondColor: diamondColor || undefined,
        giaCertNumber: giaCertNumber || undefined,
        custodyState: "VAULT",
        qualityState: "HALLMARKED",
        approvalState: "APPROVED",
        commercialState: "AVAILABLE_FOR_SALE",
        priceInr: parseFloat(priceInr) || 485000,
        currentLocation,
        epcRfidTag,
        provenance: [
          {
            stage: "Serialized Genesis & Hallmarked",
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            actor: "Master Craftsman / Vault Controller",
            detail: `Piece birthed with Gross Wt ${grossWeightGrams}g, Net Au ${netGoldGrams}g, BIS Hallmarked`,
          },
        ],
      };

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onCreated?.(newPiece);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to birth piece");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-card border border-surface-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Birth Serialized Inventory Piece
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Lineage Master Register • Dual-Custody Verified
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Piece successfully birthed and assigned to Main Vault!</span>
            </div>
          )}

          {/* Identification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Serial Number (Barcode):
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-gold font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
              >
                <option value="Solitaire Rings">Solitaire Rings</option>
                <option value="Necklaces & Chokers">Necklaces & Chokers</option>
                <option value="Polki & Temple Jewellery">Polki & Temple Jewellery</option>
                <option value="Bangles & Kadas">Bangles & Kadas</option>
                <option value="High Jewellery Earrings">High Jewellery Earrings</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Item Title / Descriptive Spec:
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
              required
            />
          </div>

          {/* Metallurgical & Weight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Alloy & Purity:
              </label>
              <select
                value={metalPurity}
                onChange={(e) => setMetalPurity(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
              >
                <option value="18K Yellow Gold (Au 750)">18K Yellow (Au 750)</option>
                <option value="22K Yellow Gold (Au 916)">22K Yellow (Au 916)</option>
                <option value="18K Rose Gold (Au 750)">18K Rose (Au 750)</option>
                <option value="18K White Gold (Au 750)">18K White (Au 750)</option>
                <option value="Platinum (Pt 950)">Platinum 950</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Gross Weight (g):
              </label>
              <input
                type="number"
                step="0.001"
                value={grossWeightGrams}
                onChange={(e) => setGrossWeightGrams(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Net Gold (g):
              </label>
              <input
                type="number"
                step="0.001"
                value={netGoldGrams}
                onChange={(e) => setNetGoldGrams(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          {/* Gemstone / Diamond Specs */}
          <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-gold font-medium">
              <Gem className="w-3.5 h-3.5" />
              <span>Certified Diamond & Gemstone Attributes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-platinum/70 block mb-1">Carat Weight:</label>
                <input
                  type="number"
                  step="0.01"
                  value={diamondCarat}
                  onChange={(e) => setDiamondCarat(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-[11px] text-platinum/70 block mb-1">Clarity & Color:</label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={diamondClarity}
                    onChange={(e) => setDiamondClarity(e.target.value)}
                    placeholder="VVS1"
                    className="w-1/2 bg-surface-elevated border border-surface-border rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    value={diamondColor}
                    onChange={(e) => setDiamondColor(e.target.value)}
                    placeholder="E"
                    className="w-1/2 bg-surface-elevated border border-surface-border rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-platinum/70 block mb-1">GIA / IGI Cert #:</label>
                <input
                  type="text"
                  value={giaCertNumber}
                  onChange={(e) => setGiaCertNumber(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* IoT & Financial Valuations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                UHF RFID EPC Tag:
              </label>
              <input
                type="text"
                value={epcRfidTag}
                onChange={(e) => setEpcRfidTag(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Retail Price (INR ₹):
              </label>
              <input
                type="number"
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-semibold focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1">
              Target Vault Compartment:
            </label>
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold"
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Generating Genesis Record..." : "Confirm & Birth Piece"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
