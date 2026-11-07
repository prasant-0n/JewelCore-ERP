"use client";

import React, { useState } from "react";
import { X, Plus, Shield, Layers, Box, Check } from "lucide-react";

interface NewStorageUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaults: Array<{ id: string; name: string; code: string; lockers: Array<{ id: string; name: string; code: string }> }>;
  onCreated?: () => void;
}

export function NewStorageUnitModal({
  isOpen,
  onClose,
  vaults,
  onCreated,
}: NewStorageUnitModalProps) {
  const [unitType, setUnitType] = useState<"VAULT" | "LOCKER" | "COMPARTMENT">("COMPARTMENT");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id || "");
  const [selectedLockerId, setSelectedLockerId] = useState(vaults[0]?.lockers[0]?.id || "");
  const [securityTier, setSecurityTier] = useState("MAXIMUM");
  const [maxPieces, setMaxPieces] = useState("25");
  const [maxWeight, setMaxWeight] = useState("5000");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeVault = vaults.find((v) => v.id === selectedVaultId) || vaults[0];
  const lockersForVault = activeVault?.lockers || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      setError("Please fill in both Name and Code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Call mock or backend endpoint
      // Simulate API call for seamless UX
      await new Promise((res) => setTimeout(res, 600));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        onCreated?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create unit");
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
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Provision New Storage Unit
              </h3>
              <p className="text-[11px] text-platinum/60 font-mono">
                Flagship Mumbai (INV-11) Vault Registry
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
              <span>Unit successfully provisioned in storage ledger!</span>
            </div>
          )}

          {/* Type Selector Pills */}
          <div>
            <label className="text-xs font-medium text-platinum/80 block mb-1.5">
              Select Architecture Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "VAULT", label: "Vault (Safe)", icon: Shield },
                { type: "LOCKER", label: "Locker (Cabinet)", icon: Layers },
                { type: "COMPARTMENT", label: "Compartment (Tray)", icon: Box },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUnitType(type as any)}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                    unitType === type
                      ? "bg-surface-elevated border-gold text-gold shadow-sm"
                      : "bg-obsidian-deep border-surface-border text-platinum/60 hover:text-slate-200 hover:border-surface-border/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Parent Selection */}
          {unitType !== "VAULT" && (
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Parent Vault:
              </label>
              <select
                value={selectedVaultId}
                onChange={(e) => {
                  setSelectedVaultId(e.target.value);
                  const v = vaults.find((vault) => vault.id === e.target.value);
                  if (v?.lockers[0]) setSelectedLockerId(v.lockers[0].id);
                }}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
              >
                {vaults.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {unitType === "COMPARTMENT" && (
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Parent Locker:
              </label>
              <select
                value={selectedLockerId}
                onChange={(e) => setSelectedLockerId(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold/60"
              >
                {lockersForVault.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Code Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Display Name:
              </label>
              <input
                type="text"
                required
                placeholder={
                  unitType === "VAULT"
                    ? "e.g. Retail Strongroom"
                    : unitType === "LOCKER"
                    ? "e.g. Diamond Solitaire Safe"
                    : "e.g. Solitaire Tray 01"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-platinum/40 focus:outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-platinum/80 block mb-1">
                Unique Code:
              </label>
              <input
                type="text"
                required
                placeholder={
                  unitType === "VAULT"
                    ? "VLT-02"
                    : unitType === "LOCKER"
                    ? "LCK-04"
                    : "COMP-02-D1"
                }
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder-platinum/40 focus:outline-none focus:border-gold/60"
              />
            </div>
          </div>

          {/* Metrological Specs for Compartment */}
          {unitType === "COMPARTMENT" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-platinum/80 block mb-1">
                  Piece Capacity:
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={maxPieces}
                  onChange={(e) => setMaxPieces(e.target.value)}
                  className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-platinum/80 block mb-1">
                  Max Weight (g):
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold/60"
                />
              </div>
            </div>
          )}

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
              {isSubmitting ? "Provisioning..." : `Create ${unitType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
