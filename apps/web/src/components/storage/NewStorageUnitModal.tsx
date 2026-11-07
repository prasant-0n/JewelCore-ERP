"use client";

import React, { useState } from "react";
import { Plus, Shield, Layers, Box } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NewStorageUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaults: Array<{
    id: string;
    name: string;
    code: string;
    lockers: Array<{ id: string; name: string; code: string }>;
  }>;
  onCreated?: () => void;
}

export function NewStorageUnitModal({
  isOpen,
  onClose,
  vaults,
  onCreated,
}: NewStorageUnitModalProps) {
  const [unitType, setUnitType] = useState<"VAULT" | "LOCKER" | "COMPARTMENT">(
    "COMPARTMENT",
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id || "");
  const [selectedLockerId, setSelectedLockerId] = useState(
    vaults[0]?.lockers[0]?.id || "",
  );
  const [maxPieces, setMaxPieces] = useState("25");
  const [maxWeight, setMaxWeight] = useState("5000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeVault = vaults.find((v) => v.id === selectedVaultId) || vaults[0];
  const lockersForVault = activeVault?.lockers || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Validation Error", {
        description: "Please fill in both Name and Code.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      toast.success(`${unitType} Created Successfully`, {
        description: `${name} (${code}) has been provisioned into the storage ledger.`,
      });
      setIsSubmitting(false);
      onClose();
      onCreated?.();
    } catch {
      toast.error("Failed to provision storage unit");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Provision New Storage Unit</DialogTitle>
              <DialogDescription>
                Flagship Mumbai (INV-11) Vault Registry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Architecture Level Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
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
                      ? "bg-surface-elevated border-gold text-gold shadow-sm font-semibold"
                      : "bg-surface border-surface-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Parent Selection */}
          {unitType !== "VAULT" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Parent Vault:
              </label>
              <select
                value={selectedVaultId}
                onChange={(e) => {
                  setSelectedVaultId(e.target.value);
                  const v = vaults.find((vault) => vault.id === e.target.value);
                  if (v?.lockers[0]) setSelectedLockerId(v.lockers[0].id);
                }}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
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
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Parent Locker:
              </label>
              <select
                value={selectedLockerId}
                onChange={(e) => setSelectedLockerId(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
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
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Display Name:
              </label>
              <Input
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
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Unique Code:
              </label>
              <Input
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
                className="font-mono uppercase"
              />
            </div>
          </div>

          {/* Metrological Specs for Compartment */}
          {unitType === "COMPARTMENT" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Piece Capacity:
                </label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={maxPieces}
                  onChange={(e) => setMaxPieces(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Max Weight (g):
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100000"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Create {unitType}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
