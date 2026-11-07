"use client";

import React, { useState } from "react";
import { FlaskConical } from "lucide-react";
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
  const [batchName, setBatchName] = useState(
    "Inward Gold Casting Grain Lot #B-991",
  );
  const [inspectorName, setInspectorName] = useState("Dr. A. Joshi");
  const [instrument, setInstrument] = useState("Thermo Niton XL5 Plus (COM4)");
  const [alloyKarat, setAlloyKarat] = useState("Au 999.9 Fine Gold (24K)");
  const [itemCount, setItemCount] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName) {
      toast.error("Validation Error", {
        description: "Please specify a batch description.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      toast.success("QC Session Initialized", {
        description: `${batchName} registered for ${inspectorName} using ${instrument}.`,
      });
      setIsSubmitting(false);
      onClose();
      onCreated?.();
    } catch {
      toast.error("Failed to initialize QC session");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Initiate Analytical QC Session</DialogTitle>
              <DialogDescription>
                Flagship Mumbai (INV-11) Metallurgical Lab
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Inspection Batch Description:
            </label>
            <Input
              required
              placeholder="e.g. Inward Cast Dore Bar Lot"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Assaying Metallurgist:
              </label>
              <Input
                required
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                XRF Spectrometer Instrument:
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
              >
                <option value="Thermo Niton XL5 Plus (COM4)">
                  Thermo Niton XL5 Plus (COM4)
                </option>
                <option value="Oxford X-Strata 920 (USB)">
                  Oxford X-Strata 920 (USB)
                </option>
                <option value="Fischer Fischerscope X-RAY XDLM">
                  Fischer XDLM (NABL)
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Declared Alloy / Karat:
              </label>
              <Input
                value={alloyKarat}
                onChange={(e) => setAlloyKarat(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Item / Specimen Count:
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={itemCount}
                onChange={(e) => setItemCount(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Start QC Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
