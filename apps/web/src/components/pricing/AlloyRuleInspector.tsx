"use client";

import React, { useState } from "react";
import { AlloyRuleData } from "./AlloyPricingCard";
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  Radio,
  CheckCircle2,
  Lock,
  X,
  RotateCw,
  Calculator,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetrologyGauge } from "@/components/workstation/MetrologyGauge";
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

interface AlloyRuleInspectorProps {
  alloy: AlloyRuleData | null;
  parentGroupName?: string;
  onClose?: () => void;
  onLockFix?: (alloy: AlloyRuleData) => void;
  onSimulateImpact?: (alloy: AlloyRuleData) => void;
}

export function AlloyRuleInspector({
  alloy,
  parentGroupName = "Gold Alloy Fixing Matrix",
  onClose,
  onLockFix,
  onSimulateImpact,
}: AlloyRuleInspectorProps) {
  const [isLocking, setIsLocking] = useState(false);

  if (!alloy) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <Scale className="w-12 h-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-foreground">No Alloy Rule Selected</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          Select any bullion alloy, karat tier, or making charge formula to inspect real-time MCX spot parity, margin hedging, and POS broadcast controls.
        </p>
      </Card>
    );
  }

  const {
    alloyName,
    finenessPurity,
    spotPricePerGram,
    makingChargePercent,
    makingChargeFixedPerGram,
    wastagePercent,
    calculatedRetailPerGram,
    status,
    volatilityIndexPercent,
    hedgingCoverPercent,
    targetTerminalsCount,
    lastUpdated,
  } = alloy;

  const handleLockRate = () => {
    setIsLocking(true);
    setTimeout(() => {
      setIsLocking(false);
      toast.success(`Spot Rate Locked for ${alloyName}`, {
        description: `Base rate ₹${spotPricePerGram}/g broadcasted to ${targetTerminalsCount ?? 14} cashier POS terminals.`,
      });
      onLockFix?.(alloy);
    }, 700);
  };

  const handleSimulate = () => {
    toast.info(`Simulating Margin Impact for ${alloyName}`, {
      description: `Hedging coverage: ${hedgingCoverPercent}%. Projected store gross margin: 18.4%.`,
    });
    onSimulateImpact?.(alloy);
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
                {alloyName}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parentGroupName} • {finenessPurity}
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
            MCX Live Feed Sync
          </Badge>
          <Badge variant="gold">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {hedgingCoverPercent}% Hedged
          </Badge>
          <StatusBadge status={status} size="sm" />
        </div>
      </CardHeader>

      {/* Spot Price Decomposition & Formula Engine */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">Published Retail Rate:</span>
            <TabularCurrency amount={calculatedRetailPerGram} className="text-gold text-lg font-bold" />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-surface-border">
            <span>Base Spot Rate:</span>
            <TabularCurrency amount={spotPricePerGram} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Making Charges:</span>
            <span className="text-foreground">{makingChargePercent}% ({makingChargeFixedPerGram ? `₹${makingChargeFixedPerGram}/g` : "Dynamic"})</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Melting Wastage:</span>
            <span className="text-foreground">{wastagePercent}%</span>
          </div>
        </div>

        {/* Volatility & Tolerance Band Gauge */}
        <MetrologyGauge
          label="Hedging Cover Ratio"
          currentValue={hedgingCoverPercent}
          maxValue={100}
          unit="%"
          decimals={1}
          status="passing"
          secondaryLabel="Volatility Index"
          secondaryValue={`±${volatilityIndexPercent}%`}
        />

        {/* Target Terminal Broadcast */}
        <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-xs flex items-center justify-between">
          <span className="text-muted-foreground">Active Terminals:</span>
          <span className="font-mono text-foreground font-medium">{targetTerminalsCount ?? 14} Terminals Broadcasted</span>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleSimulate}
        >
          <Calculator className="w-3.5 h-3.5 mr-1" />
          Simulate
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={handleLockRate}
          isLoading={isLocking}
        >
          <Lock className="w-3.5 h-3.5 mr-1" />
          Broadcast Spot
        </Button>
      </CardFooter>
    </Card>
  );
}
