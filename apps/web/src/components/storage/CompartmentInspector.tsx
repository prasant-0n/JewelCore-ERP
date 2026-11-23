"use client";

import React, { useState } from "react";
import type { CompartmentWithOccupancy } from "@jewelcore/shared";
import {
  ShieldCheck,
  Radio,
  Boxes,
  Printer,
  ArrowRightLeft,
  CheckCircle2,
  X,
  RefreshCw,
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
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { JewelleryTagModal } from "../common/JewelleryTagModal";
import { JewelleryTagData } from "../../lib/printing/zplBarcodeTagGenerator";
import { StepUpVerificationModal } from "../auth/StepUpVerificationModal";
import { toast } from "sonner";

interface StoredItemMock {
  serialNumber: string;
  name: string;
  purity: string;
  weightGrams: number;
  slotNumber: string;
}

const SAMPLE_STORED_ITEMS: Record<string, StoredItemMock[]> = {
  default: [
    {
      serialNumber: "JWL-2026-08912",
      name: "Solitaire Diamond Ring 1.25ct",
      purity: "18K Yellow Gold",
      weightGrams: 4.821,
      slotNumber: "Slot 1",
    },
    {
      serialNumber: "JWL-2026-08913",
      name: "Royal Heritage Kundan Choker",
      purity: "22K Gold (916)",
      weightGrams: 26.31,
      slotNumber: "Slot 2",
    },
    {
      serialNumber: "JWL-2026-08918",
      name: "Pavé Diamond Bangle",
      purity: "Pt 950",
      weightGrams: 38.4,
      slotNumber: "Slot 3",
    },
    {
      serialNumber: "JWL-2026-08922",
      name: "Colombian Emerald Earstuds",
      purity: "18K Yellow Gold",
      weightGrams: 6.15,
      slotNumber: "Slot 4",
    },
  ],
};

interface CompartmentInspectorProps {
  compartment: CompartmentWithOccupancy | null;
  parentLockerName?: string;
  parentVaultName?: string;
  onClose?: () => void;
  onAuditClick?: () => void;
  onTransferClick?: () => void;
}

export function CompartmentInspector({
  compartment,
  parentLockerName = "Locker 02: High-Jewellery Trays",
  parentVaultName = "Vault 01: Primary Bullion & Diamond Safe",
  onClose,
  onAuditClick,
  onTransferClick,
}: CompartmentInspectorProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isStepUpModalOpen, setIsStepUpModalOpen] = useState(false);
  const [stepUpToken, setStepUpToken] = useState<string | null>(null);

  if (!compartment) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <Boxes className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">
          No Compartment Selected
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any compartment cell from the 3-tier hierarchy matrix to
          inspect its live occupancy, weight load, and stored inventory.
        </p>
      </Card>
    );
  }

  const {
    code,
    name,
    compartmentNumber,
    maxItemCapacity = 20,
    maxWeightCapacityGrams = 5000,
    occupiedItemCount = 0,
    occupancyPercentage,
    status,
  } = compartment;

  const currentWeightGrams = occupiedItemCount * 18.52;
  const items = SAMPLE_STORED_ITEMS[code] || SAMPLE_STORED_ITEMS.default;
  const estimatedValuationUsd = Math.round(currentWeightGrams * 95);
  const isHighValue = estimatedValuationUsd >= 50000 || occupiedItemCount >= 10;
  const valuation = isHighValue ? Math.max(84500, estimatedValuationUsd) : estimatedValuationUsd;

  const handleSimulateAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      toast.success(`RFID & Weight Audit Verified for ${code}`, {
        description: `Verified ${occupiedItemCount} pieces, total weight ${currentWeightGrams.toFixed(2)}g against scale ledger.`,
      });
      onAuditClick?.();
    }, 800);
  };

  const handlePrintManifest = () => {
    setIsTagModalOpen(true);
    toast.info(`Opening Barcode Tag Printing Station for ${code}`, {
      description: `Loaded ${items.length} items for thermal label and ZPL generation.`,
    });
  };

  const handleTransfer = () => {
    if (isHighValue && !stepUpToken) {
      setIsStepUpModalOpen(true);
      return;
    }

    toast.info(`Initiating Transfer Request for ${code}`, {
      description: "Opening inter-locker custody dispatch workflow.",
    });
    onTransferClick?.();
  };

  const handleStepUpVerified = (proof: { stepUpToken: string; method: string }) => {
    setStepUpToken(proof.stepUpToken);
    toast.success(`Custody Transfer Authorized for ${code}`, {
      description: `High-value transfer verified via ${proof.method}. Token proof: ${proof.stepUpToken.substring(0, 16)}...`,
    });
    onTransferClick?.();
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Inspector Header */}
      <CardHeader className="p-4 sm:p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              <CardTitle className="text-base font-semibold font-mono">
                {code}
              </CardTitle>
              {compartmentNumber && (
                <span className="text-xs font-mono text-muted-foreground">
                  (Tray #{compartmentNumber})
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parentLockerName} &gt; {parentVaultName}
            </p>
          </div>

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

        {/* Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="emerald" dot>
            Active RFID Mesh
          </Badge>
          <Badge variant="gold">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Tamper Seal Intact
          </Badge>
          {stepUpToken && (
            <Badge
              variant="emerald"
              data-testid="step-up-verified-badge"
              className="font-mono text-[10px]"
            >
              <ShieldCheck className="w-3 h-3 mr-1 text-status-emerald" />
              Step-Up Authorized
            </Badge>
          )}
          <StatusBadge status={status || "AVAILABLE"} size="sm" />
        </div>
      </CardHeader>

      {/* Dual Utilization Gauges */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <MetrologyGauge
          label="Weight Load Capacity"
          currentValue={currentWeightGrams}
          maxValue={maxWeightCapacityGrams || 5000}
          unit="g"
          decimals={2}
          status={
            currentWeightGrams / (maxWeightCapacityGrams || 5000) > 0.85
              ? "warning"
              : "normal"
          }
        />

        <MetrologyGauge
          label="Compartment Slot Occupancy"
          currentValue={occupiedItemCount}
          maxValue={maxItemCapacity || 25}
          unit="pcs"
          decimals={0}
          status={
            occupiedItemCount / (maxItemCapacity || 25) >= 0.9
              ? "warning"
              : "passing"
          }
        />

        {/* Audit Timestamp */}
        <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Last Audit: Today 14:15 IST</span>
          <span className="text-foreground">Inspector K. Mehta</span>
        </div>
      </CardContent>

      {/* Stored Items Micro-Manifest */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 bg-obsidian-deep border-b border-surface-border flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground font-medium">
            Stored Items Manifest ({occupiedItemCount} Pieces)
          </span>
          <span className="text-[10px] font-mono text-status-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
            Live Sync
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-surface-border/40 max-h-60">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 hover:bg-surface-elevated/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-gold">
                  {item.serialNumber}
                </span>
                <Badge variant="secondary" size="sm">
                  {item.slotNumber}
                </Badge>
              </div>
              <div className="text-xs text-foreground font-medium mt-1 truncate">
                {item.name}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-muted-foreground">
                <span>{item.purity}</span>
                <TabularWeight grams={item.weightGrams} decimals={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleSimulateAudit}
          isLoading={isAuditing}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Audit Scales
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handlePrintManifest}
        >
          <Printer className="w-3.5 h-3.5 mr-1" />
          Print
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          data-testid="transfer-compartment-btn"
          onClick={handleTransfer}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
          Transfer
        </Button>
      </CardFooter>

      {/* Jewellery Barcode & RFID Tag Printing Station */}
      <JewelleryTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={items.map((it) => ({
          serialNumber: it.serialNumber,
          skuCode: `SKU-${it.purity.split(" ")[0]}`,
          itemName: it.name,
          metalPurity: it.purity,
          grossWeightGrams: it.weightGrams,
          netWeightGrams: Math.round(it.weightGrams * 0.92 * 1000) / 1000,
          hallmarkId: `BIS-${code.replace(/[^a-zA-Z0-9]/g, "")}`,
          retailPriceInr: Math.round(it.weightGrams * 7450),
        }))}
      />

      {/* Step-Up High-Assurance Vault Custody Modal */}
      <StepUpVerificationModal
        isOpen={isStepUpModalOpen}
        onClose={() => setIsStepUpModalOpen(false)}
        action="VAULT_HIGH_VALUE_TRANSFER"
        actionTitle="High-Value Vault Custody Transfer"
        resourceId={code}
        resourceValue={valuation}
        resourceDescription={`${parentVaultName} > ${parentLockerName} > ${code} (${occupiedItemCount} items, ${currentWeightGrams.toFixed(1)}g)`}
        thresholdNotice="Custody operations exceeding $50,000 threshold require dual-key supervisor quorum or FIDO2 hardware passkey touch."
        onVerified={handleStepUpVerified}
      />
    </Card>
  );
}
