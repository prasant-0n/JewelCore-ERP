"use client";

import React, { useState } from "react";
import { InventoryPieceData } from "./PieceCard";
import {
  Gem,
  Scale,
  ShieldCheck,
  Printer,
  Sparkles,
  ShoppingBag,
  Clock,
  Radio,
  X,
  ArrowRightLeft,
  Tag,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetrologyGauge } from "@/components/workstation/MetrologyGauge";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";
import { BarcodeRenderer } from "@/components/luxury/BarcodeRenderer";
import { JewelleryTagModal } from "@/components/common/JewelleryTagModal";

interface PieceLineageInspectorProps {
  piece: InventoryPieceData | null;
  parentCategoryName?: string;
  onClose?: () => void;
  onCheckoutClick?: (piece: InventoryPieceData) => void;
  onTransferClick?: (piece: InventoryPieceData) => void;
}

export function PieceLineageInspector({
  piece,
  parentCategoryName = "High-Jewellery Solitaire Rings",
  onClose,
  onCheckoutClick,
  onTransferClick,
}: PieceLineageInspectorProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  if (!piece) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <Gem className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">
          No Piece Selected
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any serialized jewellery piece from the category matrix to view
          its 4-dimensional state machine, GIA diamond specs, and cryptographic
          lineage ledger.
        </p>
      </Card>
    );
  }

  const {
    serialNumber,
    itemName,
    metalPurity,
    grossWeightGrams,
    netGoldGrams,
    diamondCarat,
    diamondClarity,
    diamondColor,
    giaCertNumber,
    custodyState,
    qualityState,
    approvalState,
    commercialState,
    priceInr,
    currentLocation,
    epcRfidTag,
    provenance,
  } = piece;

  const handleSellClick = () => {
    toast.success(`Sent to POS Checkout: ${serialNumber}`, {
      description:
        "Added to active cashier cart. Calculating dynamic bullion rate and margin.",
    });
    onCheckoutClick?.(piece);
  };

  const handleTransferClick = () => {
    toast.info(`Custody Transfer Request: ${serialNumber}`, {
      description:
        "Inter-branch transfer requisition logged for armored courier manifest.",
    });
    onTransferClick?.(piece);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Inspector Header */}
      <CardHeader className="p-4 sm:p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              <CardTitle className="text-base font-bold font-mono">
                {serialNumber}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[240px]">
              {itemName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BarcodeRenderer
              value={serialNumber}
              height={20}
              width={1.0}
              margin={2}
              fontSize={8}
              displayValue={false}
              showToolbar={true}
            />
            {onClose && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="emerald" dot>
            RFID Tag Synced
          </Badge>
          <Badge variant="gold">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {qualityState}
          </Badge>
          <StatusBadge status={commercialState} size="sm" />
        </div>
      </CardHeader>

      {/* 4-Dimension State Matrix & Specifications */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-surface-elevated border border-surface-border">
            <span className="text-[10px] text-muted-foreground block">
              CUSTODY STATE
            </span>
            <StatusBadge status={custodyState} size="sm" />
          </div>
          <div className="p-2 rounded bg-surface-elevated border border-surface-border">
            <span className="text-[10px] text-muted-foreground block">
              APPROVAL STATE
            </span>
            <StatusBadge status={approvalState} size="sm" />
          </div>
        </div>

        <MetrologyGauge
          label="Certified Gross Weight"
          currentValue={grossWeightGrams}
          maxValue={grossWeightGrams * 1.1}
          unit="g"
          decimals={3}
          secondaryLabel="Net Fine Au"
          secondaryValue={`${netGoldGrams.toFixed(3)}g`}
        />

        {/* Diamond / Gemstone Specs */}
        {diamondCarat && (
          <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gem className="w-4 h-4 text-gold" />
              <span className="text-muted-foreground">Diamond Spec:</span>
            </div>
            <span className="font-mono text-foreground font-semibold">
              {diamondCarat} ct • {diamondClarity || "VVS"} /{" "}
              {diamondColor || "E"} ({giaCertNumber || "GIA"})
            </span>
          </div>
        )}

        {/* Valuation & Current Location */}
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              Showroom Retail Tag:
            </span>
            <TabularCurrency
              amount={priceInr}
              className="text-gold text-sm font-bold"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Location: {currentLocation}</span>
            <span>RFID: {epcRfidTag.substring(0, 14)}...</span>
          </div>
        </div>
      </CardContent>

      {/* Provenance Lineage Timeline */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 bg-obsidian-deep border-b border-surface-border flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground font-medium">
            Cryptographic Provenance ({provenance.length} Events)
          </span>
          <span className="text-[10px] font-mono text-status-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
            Verified
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-48">
          {provenance.map((ev, idx) => (
            <div key={idx} className="flex gap-2.5 items-start text-xs">
              <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5" />
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground">{ev.stage}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {ev.actor} • {ev.timestamp}
                </div>
                <div className="text-xs text-muted-foreground">{ev.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="px-2.5 text-gold border-gold/30 hover:bg-gold/10"
          title="Print 50×12mm Jewellery Dumbbell Tag"
          onClick={() => setIsTagModalOpen(true)}
        >
          <Tag className="w-3.5 h-3.5 mr-1" />
          Tag
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleTransferClick}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
          Transfer
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={handleSellClick}
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1" />
          POS Checkout
        </Button>
      </CardFooter>

      {/* Jewellery Barcode & RFID Tag Printing Station */}
      <JewelleryTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={[
          {
            serialNumber,
            skuCode: `SKU-${metalPurity.split(" ")[0]}`,
            itemName,
            metalPurity,
            grossWeightGrams,
            netWeightGrams: netGoldGrams,
            diamondCarat,
            diamondSpecs: diamondClarity && diamondColor ? `${diamondClarity}-${diamondColor}` : undefined,
            hallmarkId: giaCertNumber || `BIS-${serialNumber.slice(-6)}`,
            retailPriceInr: priceInr,
            epcTag: epcRfidTag,
          },
        ]}
      />
    </Card>
  );
}
