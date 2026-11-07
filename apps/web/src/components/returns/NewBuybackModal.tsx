"use client";

import React, { useState } from "react";
import { Flame } from "lucide-react";
import { ScrapPieceData } from "./ScrapItemCard";
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
  const [description, setDescription] = useState(
    "22K Antique Filigree Bangle Pair",
  );
  const [grossWeightGrams, setGrossWeightGrams] = useState("54.200");
  const [stoneWeightDeduction, setStoneWeightDeduction] = useState("2.100");
  const [assayedFinenessPercent, setAssayedFinenessPercent] = useState("91.60");
  const [specificGravity, setSpecificGravity] = useState("17.55");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !grossWeightGrams) {
      toast.error("Validation Error", {
        description: "Please fill in item description and gross weight.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));

      const gross = parseFloat(grossWeightGrams) || 54.2;
      const stones = parseFloat(stoneWeightDeduction) || 0;
      const netGold = Math.max(0, gross - stones);
      const fineness = parseFloat(assayedFinenessPercent) || 91.6;
      const pureGold = netGold * (fineness / 100);
      const spotRate = 7450.0;
      const meltDeductionRate = 0.985;
      const valuation = pureGold * spotRate * meltDeductionRate;

      const newItem: ScrapPieceData = {
        id: `scrap-${Date.now()}`,
        itemCode: `BB-${Date.now().toString().slice(-4)}`,
        customerName: clientName,
        customerPan: "BPLPB1104M",
        itemDescription: description,
        grossWeightGrams: gross,
        stoneWeightDeductionGrams: stones,
        netGoldWeightGrams: netGold,
        assayedPurityPercent: fineness,
        karatString: fineness >= 91.6 ? "22K Old Gold" : "18K Scrap",
        hydrostaticSpecificGravity: parseFloat(specificGravity) || 17.55,
        spotGoldRatePerGram: spotRate,
        meltLossDeductionPercent: 1.5,
        calculatedValuationInr: Math.round(valuation),
        status: "VALUATED",
        containmentBucket: "Melt Crucible B-01",
        receivedAt: "Just now",
      };

      toast.success("Old Gold Buyback Recorded", {
        description: `Net Au ${netGold.toFixed(3)}g valued at ₹${Math.round(valuation).toLocaleString("en-IN")}.`,
      });
      setIsSubmitting(false);
      onClose();
      onCreated?.(newItem, targetBatchId);
    } catch {
      toast.error("Failed to record buyback");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Intake Old Gold Buyback &amp; Scrap</DialogTitle>
              <DialogDescription>
                Customer Exchange / Refining Crucible Registry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Client / Seller Name:
              </label>
              <Input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Target Refining Lot:
              </label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
              >
                <option value="batch-01">
                  Batch #01: 22K Old Jewellery (Crucible A)
                </option>
                <option value="batch-02">
                  Batch #02: 18K Diamond Setting Scrap (Crucible B)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Jewellery Item Description:
            </label>
            <Input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Scale Gross Weight (g):
              </label>
              <Input
                type="number"
                step="0.001"
                required
                value={grossWeightGrams}
                onChange={(e) => setGrossWeightGrams(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Stone / Wax Deduction (g):
              </label>
              <Input
                type="number"
                step="0.001"
                value={stoneWeightDeduction}
                onChange={(e) => setStoneWeightDeduction(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Assayed Purity (%):
              </label>
              <Input
                type="number"
                step="0.01"
                value={assayedFinenessPercent}
                onChange={(e) => setAssayedFinenessPercent(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Hydrostatic Density (SG):
              </label>
              <Input
                type="number"
                step="0.01"
                value={specificGravity}
                onChange={(e) => setSpecificGravity(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Issue Exchange Voucher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
