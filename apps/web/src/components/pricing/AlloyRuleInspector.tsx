"use client";

import React, { useState } from "react";
import { AlloyRuleData } from "./AlloyPricingCard";
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle2,
  Lock,
  X,
  RotateCw,
  Sparkles,
  Calculator,
  Terminal,
  Clock,
  Layers,
} from "lucide-react";

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
  const [lockSuccess, setLockSuccess] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  if (!alloy) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Scale className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Alloy Rule Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any bullion alloy, karat tier, or making charge formula to inspect real-time MCX spot parity, margin hedging, and POS broadcast controls.
        </p>
      </div>
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

  const wastageAmount = (spotPricePerGram * (wastagePercent / 100));
  const makingAmount =
    makingChargePercent > 0
      ? (spotPricePerGram * (makingChargePercent / 100))
      : makingChargeFixedPerGram;
  const subtotalBeforeGst = spotPricePerGram + wastageAmount + makingAmount;
  const gstAmount = subtotalBeforeGst * 0.03;
  const finalConsumerRate = subtotalBeforeGst + gstAmount;

  const handleLockClick = async () => {
    setIsLocking(true);
    await new Promise((res) => setTimeout(res, 600));
    setIsLocking(false);
    setLockSuccess(true);
    setTimeout(() => {
      setLockSuccess(false);
      onLockFix?.(alloy);
    }, 1200);
  };

  const handleSimulate = () => {
    setSimulationActive(true);
    setTimeout(() => setSimulationActive(false), 2500);
    onSimulateImpact?.(alloy);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-gold" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              Rule: {alloyName}
            </h3>
          </div>
          <div className="text-xs text-platinum font-medium">
            {finenessPurity} • {parentGroupName}
          </div>
          <div className="text-[11px] font-mono text-platinum/60">
            Last MCX Tick: {lastUpdated}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Live MCX Peg
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dual Risk & Hedging Gauges */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gauge 1: Volatility Index */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-gold" />
              Volatility Index
            </span>
            <span className="font-bold text-gold tabular-nums">
              {volatilityIndexPercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)] rounded-full"
              style={{ width: `${volatilityIndexPercent * 3}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>Low Spread Band</span>
            <span className="text-slate-100 font-semibold">±0.25% Buffer</span>
          </div>
        </div>

        {/* Gauge 2: Hedging Cover */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Hedging Parity
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {hedgingCoverPercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: `${hedgingCoverPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>MCX Mini Cover</span>
            <span className="text-emerald-400 font-semibold">100% Insured</span>
          </div>
        </div>
      </div>

      {/* Real-Time Price Component Formula Box */}
      <div className="p-4 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            Dynamic Quotation Breakdown Formula
          </span>
          <span className="text-[10px] text-emerald-400">Live Calculated</span>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Base Metal Spot Rate:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              ₹ {spotPricePerGram.toFixed(2)} / g
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>
              Making Surcharge ({makingChargePercent > 0 ? `${makingChargePercent}%` : "Fixed"}):
            </span>
            <span className="text-gold font-semibold tabular-nums">
              + ₹ {makingAmount.toFixed(2)} / g
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Atelier Wastage Loss ({wastagePercent.toFixed(2)}%):</span>
            <span className="text-platinum/90 tabular-nums">
              + ₹ {wastageAmount.toFixed(2)} / g
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70 border-t border-surface-border/60 pt-2">
            <span>Subtotal (Excl. Tax):</span>
            <span className="text-slate-100 font-semibold tabular-nums">
              ₹ {subtotalBeforeGst.toFixed(2)} / g
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/60 text-[11px]">
            <span>GST Statutory Tax (3%):</span>
            <span className="text-platinum/70 tabular-nums">
              + ₹ {gstAmount.toFixed(2)} / g
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-surface-border pt-2 text-sm font-bold">
            <span className="text-slate-100">Final Consumer Billing Rate:</span>
            <span className="text-emerald-400 tabular-nums">
              ₹ {finalConsumerRate.toFixed(2)} / g
            </span>
          </div>
        </div>
      </div>

      {/* POS Distribution & Telemetry */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-platinum/80 font-medium">
          <Terminal className="w-3.5 h-3.5 text-gold" />
          <span>Showroom Terminal Broadcast Target</span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Target Workstations:</span>
            <span className="text-slate-200 font-medium">All 12 Flagship Showroom POS Terminals</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Auto-Refresh Interval:</span>
            <span className="text-slate-200">Every 60s (MCX WebSocket Push)</span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Authorized Officer:</span>
            <span className="text-gold font-medium">Chief Treasury Officer (CTO-912)</span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {simulationActive && (
        <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Simulation Active: +2.5% Spot Shift projected margin delta +₹142,500</span>
        </div>
      )}

      {lockSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Mid-Day Bullion Fix signed and broadcast to 12 POS Terminals!</span>
        </div>
      )}

      {/* Action Deck */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSimulate}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-platinum/70" />
            <span>Simulate Impact</span>
          </button>

          <button
            onClick={() => onSimulateImpact?.(alloy)}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-platinum/70" />
            <span>Sync Live MCX</span>
          </button>
        </div>

        <button
          onClick={handleLockClick}
          disabled={isLocking || lockSuccess}
          className="w-full py-2.5 px-4 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono tracking-wide shadow-lg shadow-gold/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Lock className="w-4 h-4 text-obsidian" />
          <span>{isLocking ? "Signing Cryptographic Fix..." : "Authorize & Lock Mid-Day Bullion Fix"}</span>
        </button>
      </div>
    </div>
  );
}
