"use client";

import React, { useState } from "react";
import { QcItemData } from "./QcItemCard";
import {
  Scale,
  Microscope,
  ShieldCheck,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  TrendingUp,
  X,
  RefreshCw,
  Waves,
} from "lucide-react";

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
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  if (!item) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Microscope className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No QC Item Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any fixture tile from the active inspection session to inspect its multi-element XRF decomposition, hydrostatic specific gravity, and hallmarking clearance.
        </p>
      </div>
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
    }, 700);
  };

  const handleApproveHallmark = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setApprovedSuccess(true);
      onApproveSuccess?.(item);
      setTimeout(() => setApprovedSuccess(false), 3500);
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
                {itemCode} ({parentPieceSerial})
              </h3>
            </div>
            <p className="text-xs text-platinum/70 mt-1">
              {parentSessionName} • 24K Cast Bar
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
            <Microscope className="w-3 h-3" />
            Spectrometer Calibrated
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-gold/10 text-gold-light border border-gold/30">
            <ShieldCheck className="w-3 h-3" />
            Gravimetric Tolerance OK
          </span>
        </div>
      </div>

      {/* Dual Metrological Gauges */}
      <div className="p-5 border-b border-surface-border space-y-4">
        {/* Gauge 1: Certified Gross Weight */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-platinum/50" />
              Certified Gross Weight:
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
            <span>Std: {standardGrossWeightGrams.toFixed(3)} g</span>
            <span className="text-emerald-400 font-medium">
              +{varianceGrams.toFixed(3)}g / +{variancePercent.toFixed(3)}% Tolerance OK
            </span>
          </div>
        </div>

        {/* Gauge 2: XRF Spectrometric Fineness */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-platinum/50" />
              XRF Spectrometric Fineness:
            </span>
            <span className="font-mono text-gold-light font-semibold">
              {finenessString} / 1000 Au
            </span>
          </div>
          <div className="w-full bg-obsidian-deep h-1.5 rounded-full overflow-hidden mt-2 border border-surface-border/50">
            <div
              style={{ width: `${Math.min(purityPercent, 100)}%` }}
              className="bg-gold h-full rounded-full transition-all duration-300"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-platinum/60 mt-1">
            <span>
              Au: {elements.au}% • Ag: {elements.ag}% • Cu: {elements.cu}%
            </span>
            <span className="text-gold font-medium">
              {purityPercent.toFixed(2)}% Hallmark Standard
            </span>
          </div>
        </div>
      </div>

      {/* Hydrostatic Specific Gravity Module */}
      <div className="p-5 border-b border-surface-border space-y-3 bg-obsidian-deep/40">
        <div className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Waves className="w-3 h-3 text-cyan-400" />
            Hydrostatic Specific Gravity Module
          </span>
          <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Archimedes Passed
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-center">
            <div className="text-platinum/60 text-[9px]">Air Wt:</div>
            <div className="font-bold text-slate-100 tabular-nums mt-0.5 text-[11px]">
              {grossWeightGrams.toFixed(2)}g
            </div>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-center">
            <div className="text-platinum/60 text-[9px]">Water Wt:</div>
            <div className="font-bold text-slate-100 tabular-nums mt-0.5 text-[11px]">
              {hydrostaticWeightGrams.toFixed(2)}g
            </div>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-center">
            <div className="text-platinum/60 text-[9px]">Calculated:</div>
            <div className="font-bold text-gold-light tabular-nums mt-0.5 text-[11px]">
              {specificGravity.toFixed(2)} g/cm³
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-platinum/60 flex items-center justify-between pt-1">
          <span>Pure Au 24K Benchmark:</span>
          <span className="text-slate-200 font-semibold">19.30 – 19.32 g/cm³</span>
        </div>
      </div>

      {/* Target Containment Destination */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-platinum/50" />
            Vault Release Destination Target
          </span>

          <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border text-xs font-mono">
            <div className="text-gold-light font-semibold">
              {destinationPath}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cleared for Commercial Vault Transfer</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="space-y-2.5 pt-4">
          {approvedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Assay Verified! Hallmarked &amp; released from quarantine to Vault 01.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRetestSpectrum}
              disabled={isScanning}
              className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning..." : "Re-Test Spectrum"}</span>
            </button>

            <button
              onClick={() => alert(`Printing Official Assay Certificate for ${itemCode}`)}
              className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-platinum/60" />
              <span>Print Certificate</span>
            </button>
          </div>

          <button
            onClick={handleApproveHallmark}
            disabled={isApproving}
            className="w-full px-4 py-2.5 rounded-lg bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center justify-center space-x-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isApproving
                ? "Cryptographically Authorizing..."
                : "Approve Quality Hallmark & Release from Quarantine"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
