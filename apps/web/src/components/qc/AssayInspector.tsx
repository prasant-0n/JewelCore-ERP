"use client";

import React, { useState } from "react";
import { QcItemData } from "./QcItemCard";
import {
  Scale,
  Microscope,
  ShieldCheck,
  CheckCircle2,
  X,
  RefreshCw,
  Waves,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetrologyGauge } from "@/components/workstation/MetrologyGauge";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

interface AssayInspectorProps {
  item: QcItemData | null;
  parentSessionName?: string;
  onClose?: () => void;
  onApproveSuccess?: (item: QcItemData) => void;
}

export function AssayInspector({
  item,
  parentSessionName = "Session QC-2026-1188 > Valcambi Ingot Lot",
  onClose,
  onApproveSuccess,
}: AssayInspectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  if (!item) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <Microscope className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">No QC Item Selected</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any fixture tile from the active inspection session to inspect its multi-element XRF decomposition, hydrostatic specific gravity, and hallmarking clearance.
        </p>
      </Card>
    );
  }

  const {
    itemCode,
    parentPieceSerial,
    grossWeightGrams,
    hydrostaticWeightGrams,
    specificGravity,
    standardGrossWeightGrams,
    varianceGrams,
    variancePercent,
    purityPercent,
    finenessString,
    elements,
    destinationPath,
  } = item;

  const handleRetestSpectrum = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success(`XRF Spectrum Recalibrated for ${itemCode}`, {
        description: `Au purity confirmed at ${purityPercent}%. Nitrogen purge active.`,
      });
    }, 700);
  };

  const handleApproveHallmark = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      toast.success(`Hallmark Clearance Approved for ${itemCode}`, {
        description: `Cryptographic assay certificate signed. Asset released to ${destinationPath}.`,
      });
      onApproveSuccess?.(item);
    }, 800);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Inspector Header */}
      <CardHeader className="p-4 sm:p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
              <CardTitle className="text-base font-bold font-mono">
                Assay Testing {itemCode}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Parent Asset: <span className="font-mono text-gold">{parentPieceSerial}</span> • {parentSessionName}
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
            ISO/IEC 17025 Calibrated
          </Badge>
          <Badge variant="gold">
            <ShieldCheck className="w-3 h-3 mr-1" />
            BIS Hallmark Ready
          </Badge>
          <StatusBadge status={item.status} size="sm" />
        </div>
      </CardHeader>

      {/* Dual Metrology & Hydrostatic Gauges */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <MetrologyGauge
          label="Mettler Toledo Gross Balance"
          currentValue={grossWeightGrams}
          maxValue={standardGrossWeightGrams * 1.002}
          unit="g"
          decimals={3}
          toleranceDelta={varianceGrams}
          secondaryLabel="Invoice Standard"
          secondaryValue={`${standardGrossWeightGrams.toFixed(3)}g`}
          status={Math.abs(varianceGrams) <= 0.05 ? "passing" : "warning"}
        />

        {/* Hydrostatic Density */}
        <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Waves className="w-4 h-4 text-status-indigo" />
            <span className="text-muted-foreground">Hydrostatic Density (SG):</span>
          </div>
          <span className="text-foreground font-bold">{specificGravity} g/cm³</span>
        </div>

        {/* Multi-Element XRF Spectrum */}
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">XRF Spectrum Decomposition:</span>
            <Badge variant="gold" size="sm">{finenessString} Fine</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2 rounded bg-surface border border-surface-border">
              <span className="text-[10px] text-muted-foreground block">Gold (Au)</span>
              <span className="text-gold font-bold">{elements.au}%</span>
            </div>
            <div className="p-2 rounded bg-surface border border-surface-border">
              <span className="text-[10px] text-muted-foreground block">Silver (Ag)</span>
              <span className="text-foreground font-bold">{elements.ag}%</span>
            </div>
            <div className="p-2 rounded bg-surface border border-surface-border">
              <span className="text-[10px] text-muted-foreground block">Copper (Cu)</span>
              <span className="text-foreground font-bold">{elements.cu}%</span>
            </div>
          </div>
        </div>

        {/* Destination Path */}
        <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-xs flex items-center justify-between">
          <span className="text-muted-foreground">Post-Assay Destination:</span>
          <span className="font-mono text-foreground font-medium truncate max-w-[200px]">{destinationPath}</span>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleRetestSpectrum}
          isLoading={isScanning}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Retest Spectrum
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={handleApproveHallmark}
          isLoading={isApproving}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Approve Hallmark
        </Button>
      </CardFooter>
    </Card>
  );
}
