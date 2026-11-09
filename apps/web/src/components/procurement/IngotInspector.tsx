"use client";

import React, { useState } from "react";
import { IngotBarItem } from "./IngotBarCard";
import {
  Scale,
  ShieldCheck,
  Radio,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  TrendingUp,
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
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";
import { BarcodeRenderer } from "@/components/luxury/BarcodeRenderer";

interface IngotInspectorProps {
  ingot: IngotBarItem | null;
  parentShipmentName?: string;
  onClose?: () => void;
  onAuthorizeSuccess?: (ingot: IngotBarItem) => void;
}

export function IngotInspector({
  ingot,
  parentShipmentName = "Shipment SHP-2026-0842 > Valcambi Suisse",
  onClose,
  onAuthorizeSuccess,
}: IngotInspectorProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!ingot) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <Scale className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">
          No Ingot Lot Selected
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any ingot bar tile from the active shipment directory to
          inspect its dual-scale metrology, purity assay, and landed valuation.
        </p>
      </Card>
    );
  }

  const {
    barCode,
    grossWeightGrams,
    invoiceWeightGrams,
    varianceGrams,
    variancePercent,
    fineness,
  } = ingot;

  // Commercial calculations
  const baseSpotRate = 7450.0;
  const refinerPremium = 12.5;
  const effectiveRate = baseSpotRate + refinerPremium;
  const landedValue = grossWeightGrams * effectiveRate;

  const handleCaptureWeight = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      toast.success(`Mettler Toledo Scale Polled for ${barCode}`, {
        description: `Certified weight captured: ${grossWeightGrams.toFixed(4)}g. Variance within tolerance band.`,
      });
    }, 600);
  };

  const handleAuthorizeGRN = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      toast.success(`GRN Authorization Confirmed for ${barCode}`, {
        description:
          "Assay clearance passed. Lot committed to primary vault ledger.",
      });
      onAuthorizeSuccess?.(ingot);
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
                Ingot Bar {barCode}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parentShipmentName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BarcodeRenderer
              value={barCode}
              height={22}
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
            Dual Scale Calibrated (0.001g)
          </Badge>
          <Badge variant="gold">
            <ShieldCheck className="w-3 h-3 mr-1" />
            LBMA Good Delivery Bar
          </Badge>
          <StatusBadge status={ingot.status} size="sm" />
        </div>
      </CardHeader>

      {/* Dual Weight Metrology Gauges */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <MetrologyGauge
          label="Physical Scale Gross Weight"
          currentValue={grossWeightGrams}
          maxValue={invoiceWeightGrams * 1.002}
          unit="g"
          decimals={3}
          toleranceDelta={varianceGrams}
          secondaryLabel="Invoice Declared"
          secondaryValue={`${invoiceWeightGrams.toFixed(3)}g`}
          status={Math.abs(varianceGrams) <= 0.05 ? "passing" : "warning"}
        />

        {/* Financial Landed Cost Box */}
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              Landed Bullion Valuation:
            </span>
            <TabularCurrency
              amount={landedValue}
              className="text-gold text-sm font-bold"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Locked Rate: ₹{effectiveRate.toFixed(2)}/g</span>
            <span>Fineness: {fineness}</span>
          </div>
        </div>

        {/* Containment Route */}
        <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-xs flex items-center justify-between">
          <span className="text-muted-foreground">Allocated Vault Cell:</span>
          <span className="font-mono text-foreground font-medium">
            {ingot.containmentPath}
          </span>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleCaptureWeight}
          isLoading={isCapturing}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Tare Scale
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={handleAuthorizeGRN}
          isLoading={isAuthorizing}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Authorize GRN
        </Button>
      </CardFooter>
    </Card>
  );
}
