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
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!ingot) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Scale className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Ingot Lot Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any ingot bar tile from the active shipment directory to inspect its dual-scale metrology, purity assay, and landed valuation.
        </p>
      </div>
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
  const baseSpotRate = 7240.0; // ₹/g
  const refinerPremium = 12.5; // ₹/g
  const effectiveRate = baseSpotRate + refinerPremium;
  const landedValue = grossWeightGrams * effectiveRate;

  const handleCaptureWeight = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
    }, 600);
  };

  const handleAuthorizeGRN = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthSuccess(true);
      onAuthorizeSuccess?.(ingot);
      setTimeout(() => setAuthSuccess(false), 3500);
    }, 1000);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Inspector Header */}
      <div className="p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
              <h3 className="text-base font-bold text-slate-100 font-mono">
                Ingot Bar {barCode}
              </h3>
            </div>
            <p className="text-xs text-platinum/70 mt-1">
              {parentShipmentName} • 24K Cast Bar
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-3 h-3" />
            Dual-Scale Verified
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-gold/10 text-gold-light border border-gold/30">
            <ShieldCheck className="w-3 h-3" />
            Tamper Seal #TS-8821 Intact
          </span>
        </div>
      </div>

      {/* Dual Metrological Gauges */}
      <div className="p-5 border-b border-surface-border space-y-4">
        {/* Gauge 1: Certified Weight Load */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-platinum/50" />
              Certified Weight Load:
            </span>
            <span className="font-mono text-slate-100 tabular-nums">
              <strong className="text-gold-light font-semibold">
                {grossWeightGrams.toFixed(3)} g
              </strong>
            </span>
          </div>
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden mt-2 border border-surface-border/50">
            <div className="bg-emerald-400 h-full rounded-full w-full" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-platinum/60 mt-1">
            <span>Inv: {invoiceWeightGrams.toFixed(3)} g</span>
            <span className="text-emerald-400 font-medium">
              +{varianceGrams.toFixed(3)}g / +{variancePercent.toFixed(3)}% Tolerance OK
            </span>
          </div>
        </div>

        {/* Gauge 2: Spectrometric Fineness */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-platinum/50" />
              Spectrometric Fineness:
            </span>
            <span className="font-mono text-gold-light font-semibold">
              {fineness} / 1000 Au
            </span>
          </div>
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden mt-2 border border-surface-border/50">
            <div className="bg-gold h-full rounded-full w-[99.99%]" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-platinum/60 mt-1">
            <span>Standard: 999.0 Min</span>
            <span className="text-gold font-medium">99.99% Ultra Fine Hallmark</span>
          </div>
        </div>
      </div>

      {/* Commercial Landed Cost Card */}
      <div className="p-5 border-b border-surface-border space-y-3 bg-obsidian-deep/40">
        <div className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium flex items-center justify-between">
          <span>Commercial Spot Rate Lock</span>
          <span className="text-gold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            IBJA Market Fixing
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <div className="text-platinum/60 text-[10px]">Base Spot 24K:</div>
            <div className="font-bold text-slate-100 tabular-nums mt-0.5">
              ₹{baseSpotRate.toFixed(2)}/g
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <div className="text-platinum/60 text-[10px]">Refiner Premium:</div>
            <div className="font-bold text-slate-100 tabular-nums mt-0.5">
              +₹{refinerPremium.toFixed(2)}/g
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-platinum/80 uppercase block">
              Computed Landed Lot Value
            </span>
            <span className="text-base font-mono font-bold text-gold-light tabular-nums">
              ₹{landedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Auto-Calculated
          </span>
        </div>
      </div>

      {/* Target Containment Route */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-platinum/50" />
            Target Containment Allocation
          </span>

          <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-xs font-mono">
            <div className="text-gold-light font-semibold">
              Vault 03 (QC Safe) &gt; Locker 05 &gt; Tray Q1
            </div>
            <div className="text-[11px] text-platinum/60 mt-1">
              Quarantine Slot 04 • Metrology Isolation Holding
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="space-y-2.5 pt-4">
          {authSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GRN Authorised! Tag RFID-Au-994821 spooled &amp; quarantined.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCaptureWeight}
              disabled={isCapturing}
              className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCapturing ? "animate-spin" : ""}`} />
              <span>{isCapturing ? "Streaming..." : "Capture Scale Weight"}</span>
            </button>

            <button
              onClick={() => alert(`Printing Metrological Weight Slip for ${barCode}`)}
              className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-platinum/60" />
              <span>Print Weight Slip</span>
            </button>
          </div>

          <button
            onClick={handleAuthorizeGRN}
            disabled={isAuthorizing}
            className="w-full px-4 py-2.5 rounded-lg bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center justify-center space-x-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isAuthorizing ? "Generating Cryptographic RFID..." : "Authorize GRN & Issue Serialized RFID Tag"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
