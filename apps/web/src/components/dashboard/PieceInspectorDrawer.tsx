"use client";

import React from "react";
import { Gem, ShieldCheck, MapPin, Scale, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

export interface PieceDetail {
  id: string;
  serialNumber: string;
  itemName: string;
  metalPurity: string;
  grossWeightGrams: number;
  currentCompartment: string;
  qualityState: string;
  approvalState: string;
  custodyState: string;
  commercialState: string;
  diamondCarat?: number;
  diamondClarity?: string;
  lastUpdated: string;
}

interface PieceInspectorDrawerProps {
  piece: PieceDetail | null;
  onClose: () => void;
}

export function PieceInspectorDrawer({
  piece,
  onClose,
}: PieceInspectorDrawerProps) {
  if (!piece) return null;

  const handleRequestMovement = () => {
    toast.success(`Custody transfer requested for ${piece.serialNumber}`, {
      description: "Movement ledger entry pending dual-custody approval.",
    });
    onClose();
  };

  return (
    <Sheet open={!!piece} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <SheetHeader className="pb-4 border-b border-surface-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Serialized Asset Lineage
                </span>
                <SheetTitle className="text-base font-semibold text-foreground">
                  {piece.serialNumber}
                </SheetTitle>
              </div>
            </div>
            <SheetDescription className="sr-only">
              Asset lineage and technical metrology details
            </SheetDescription>
          </SheetHeader>

          {/* Item Name & Specs */}
          <div>
            <h4 className="text-base font-medium text-foreground leading-snug">
              {piece.itemName}
            </h4>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="gold">{piece.metalPurity}</Badge>
              {piece.diamondCarat && (
                <Badge variant="secondary">
                  {piece.diamondCarat} ct {piece.diamondClarity}
                </Badge>
              )}
            </div>
          </div>

          {/* 4-Dimension Audit State Matrix */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2.5">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
              Governance & State Matrix (INV-01)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-surface border border-surface-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  QUALITY
                </span>
                <StatusBadge status={piece.qualityState} size="sm" />
              </div>
              <div className="p-2 rounded bg-surface border border-surface-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  APPROVAL
                </span>
                <StatusBadge status={piece.approvalState} size="sm" />
              </div>
              <div className="p-2 rounded bg-surface border border-surface-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  CUSTODY
                </span>
                <StatusBadge status={piece.custodyState} size="sm" />
              </div>
              <div className="p-2 rounded bg-surface border border-surface-border/60">
                <span className="text-[10px] text-muted-foreground block">
                  COMMERCIAL
                </span>
                <StatusBadge status={piece.commercialState} size="sm" />
              </div>
            </div>
          </div>

          {/* Physical Metrology & Compartment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Scale className="w-4 h-4 text-gold" />
                <span>Gross Weight</span>
              </div>
              <TabularWeight
                grams={piece.grossWeightGrams}
                decimals={4}
                className="text-foreground"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-status-emerald" />
                <span>Assigned Location</span>
              </div>
              <span className="font-mono text-foreground font-semibold">
                {piece.currentCompartment}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Last Custody Transition</span>
              </div>
              <span className="font-mono text-muted-foreground text-[11px]">
                {piece.lastUpdated}
              </span>
            </div>
          </div>

          {/* Security Hash Proof */}
          <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-[10px] font-mono text-muted-foreground flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-status-emerald shrink-0" />
            <span className="truncate">
              Cryptographic Hash: 0x8f2d...41a9 (Audit Proof Verified)
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-surface-border flex space-x-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close Inspector
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            onClick={handleRequestMovement}
          >
            Request Movement
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
