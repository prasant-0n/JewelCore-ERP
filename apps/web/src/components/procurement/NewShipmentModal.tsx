"use client";

import React, { useState } from "react";
import { Truck } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) {
      toast.error("Validation Error", {
        description: "Please provide an Air Waybill or Tracking Number.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      toast.success("Shipment Logged Successfully", {
        description: `${supplier} shipment (${trackingNumber}) registered with declared weight ${declaredWeight}g.`,
      });
      setIsSubmitting(false);
      onClose();
      onCreated?.();
    } catch {
      toast.error("Failed to log shipment");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Log Inbound Bullion Shipment</DialogTitle>
              <DialogDescription>
                Flagship Mumbai (INV-11) Receiving Bay
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Accredited Refiner / Supplier:
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
            >
              <option value="Valcambi Suisse">
                Valcambi Suisse (LBMA Good Delivery)
              </option>
              <option value="MMTC-PAMP India">
                MMTC-PAMP India (NABL Accredited)
              </option>
              <option value="Argor-Heraeus SA">
                Argor-Heraeus SA (Switzerland)
              </option>
              <option value="PAMP SA">PAMP SA (Suisse)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Air Waybill / Seal #:
              </label>
              <Input
                required
                placeholder="e.g. LX-94022"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Security Tamper Seal:
              </label>
              <Input
                required
                placeholder="e.g. TS-8824"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Bar Count:
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={barCount}
                onChange={(e) => setBarCount(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Invoice Declared Weight (g):
              </label>
              <Input
                type="number"
                step="0.001"
                value={declaredWeight}
                onChange={(e) => setDeclaredWeight(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Register Inbound Lot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
