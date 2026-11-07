"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { InventoryPieceData } from "./PieceCard";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber || !itemName) {
      toast.error("Validation Error", { description: "Please specify a serial number and item description." });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));

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

      toast.success("Piece Birthed Successfully", {
        description: `${serialNumber} registered into lineage master ledger. RFID tag linked.`,
      });
      setIsSubmitting(false);
      onClose();
      onCreated?.(newPiece);
    } catch {
      toast.error("Failed to birth piece");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Birth Serialized Inventory Piece</DialogTitle>
              <DialogDescription>Lineage Master Register • Dual-Custody Verified</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Serial Number:
              </label>
              <Input
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Jewellery Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
              >
                <option value="Solitaire Rings">Solitaire Rings</option>
                <option value="Bridal Chokers">Bridal Chokers</option>
                <option value="Heritage Bangles">Heritage Bangles</option>
                <option value="Emerald Earstuds">Emerald Earstuds</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Item Title / Provenance Description:
            </label>
            <Input
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Alloy & Purity:
              </label>
              <Input
                value={metalPurity}
                onChange={(e) => setMetalPurity(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Gross Wt (g):
              </label>
              <Input
                type="number"
                step="0.001"
                value={grossWeightGrams}
                onChange={(e) => setGrossWeightGrams(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Net Gold (g):
              </label>
              <Input
                type="number"
                step="0.001"
                value={netGoldGrams}
                onChange={(e) => setNetGoldGrams(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Diamond (ct):
              </label>
              <Input
                type="number"
                step="0.01"
                value={diamondCarat}
                onChange={(e) => setDiamondCarat(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Clarity / Color:
              </label>
              <Input
                value={diamondClarity}
                onChange={(e) => setDiamondClarity(e.target.value)}
                placeholder="e.g. VVS1 / E"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                GIA Certificate:
              </label>
              <Input
                value={giaCertNumber}
                onChange={(e) => setGiaCertNumber(e.target.value)}
                className="font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Initial Location:
              </label>
              <Input
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                MSRP / Tag Price (₹):
              </label>
              <Input
                type="number"
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Birth Asset & Mint Lineage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
