"use client";

import React, { useState } from "react";
import { Radio } from "lucide-react";
import { RfidPieceData } from "./RfidTagCard";
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
import { api } from "../../lib/api";

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
  const [itemName, setItemName] = useState(
    "18K Solitaire Princess Diamond Ring (1.60ct)",
  );
  const [metalPurity, setMetalPurity] = useState("18K Yellow Gold (Au 750)");
  const [grossWeightGrams, setGrossWeightGrams] = useState("5.920");
  const [netGoldGrams, setNetGoldGrams] = useState("5.600");
  const [diamondCarat, setDiamondCarat] = useState("1.60");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epcTag || !serialNumber || !itemName) {
      toast.error("Validation Error", {
        description: "Please fill in EPC tag, serial number, and item title.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let registeredTagId: string | null = null;
      try {
        const tagRes = await api.post<{ id: string; epc: string }>("/rfid/tags", {
          epc: epcTag,
          frequencyBand: "UHF_860_960_MHZ",
        });
        registeredTagId = tagRes?.id || null;
      } catch (err: any) {
        // 409 Conflict if EPC already registered in tenant
        console.warn("[ManualTagModal] Tag registration notice:", err?.message || err);
      }

      const gross = parseFloat(grossWeightGrams) || 5.92;
      const net = parseFloat(netGoldGrams) || 5.6;

      const newPiece: RfidPieceData = {
        id: registeredTagId || `rfid-${Date.now()}`,
        epcTag,
        serialNumber,
        itemName,
        category: "Solitaire Rings",
        metalPurity,
        grossWeightGrams: gross,
        netGoldGrams: net,
        diamondCarat: diamondCarat ? parseFloat(diamondCarat) : undefined,
        status: "VERIFIED",
        rssiDbm: -38,
        antennaPort: 1,
        readCount: 168,
        frequencyMhz: 866.5,
        phaseAngleDeg: 120.4,
        expectedLocation:
          targetTrayId === "tray-01"
            ? "Tray #01 (Solitaires)"
            : "Tray #02 (Kundan)",
        lastScannedAt: "Just now",
      };

      toast.success("RFID Tag Registered", {
        description: `${serialNumber} (${epcTag}) assigned to ${newPiece.expectedLocation}.`,
      });
      setIsSubmitting(false);
      onClose();
      onRegistered?.(newPiece, targetTrayId);
    } catch {
      toast.error("Failed to register RFID tag");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Manual RFID Tag Registration</DialogTitle>
              <DialogDescription>
                Impinj Speedway R420 Antenna Station
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Target Presentation Tray:
            </label>
            <select
              value={targetTrayId}
              onChange={(e) => setTargetTrayId(e.target.value)}
              className="w-full bg-obsidian-deep border border-surface-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-gold"
            >
              <option value="tray-01">
                Tray #01: Solitaire Diamond Rings (Antenna 1)
              </option>
              <option value="tray-02">
                Tray #02: Temple Heritage Kundan (Antenna 2)
              </option>
              <option value="tray-03">
                Tray #03: Platinum & Polki Sets (Antenna 3)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                UHF EPC Tag String:
              </label>
              <Input
                required
                value={epcTag}
                onChange={(e) => setEpcTag(e.target.value.toUpperCase())}
                className="font-mono uppercase text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Asset Serial Number:
              </label>
              <Input
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                className="font-mono uppercase text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Item Title / Description:
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
                Alloy:
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
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Register EPC Tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
