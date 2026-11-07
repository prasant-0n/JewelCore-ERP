"use client";

import React, { useState } from "react";
import { ScrapPieceData } from "./ScrapItemCard";
import {
  Flame,
  Scale,
  ShieldCheck,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  RotateCw,
  FlaskConical,
  CreditCard,
  FileText,
  BadgePercent,
  Wallet,
} from "lucide-react";

interface SmeltInspectorProps {
  item: ScrapPieceData | null;
  parentBatchTitle?: string;
  clientName?: string;
  onClose?: () => void;
  onAuthorizePayout?: (item: ScrapPieceData) => void;
  onConvertToCredit?: (item: ScrapPieceData) => void;
}

export function SmeltInspector({
  item,
  parentBatchTitle = "Batch #BB-2026-044: Royal Kundan & Antique 22K Melt Lot",
  clientName = "Mrs. Sunita Verma (KYC Verified)",
  onClose,
  onAuthorizePayout,
  onConvertToCredit,
}: SmeltInspectorProps) {
  const [tenderMethod, setTenderMethod] = useState<"RTGS" | "STORE_CREDIT" | "BULLION_RETURN">("RTGS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [assaySlipSuccess, setAssaySlipSuccess] = useState(false);
  const [storeCreditBonusApplied, setStoreCreditBonusApplied] = useState(false);

  if (!item) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Flame className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Scrap Item Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any old gold buyback item or atelier melt lot to inspect Niton XRF spectral analysis, hydrostatic density, dross burn tolerance, and instant RTGS disbursement.
        </p>
      </div>
    );
  }

  const {
    itemCode,
    description,
    grossWeightGrams,
    netGoldGrams,
    assayedFinenessPercent,
    specificGravity,
    payoutValueInr,
    alloyClassification,
  } = item;

  const spotBenchmark = 7340.5;
  const drossLossWeight = grossWeightGrams * 0.0085;
  const storeCreditValuation = Math.round(payoutValueInr * 1.02);

  const handleAuthorize = async () => {
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsProcessing(false);
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      onAuthorizePayout?.(item);
    }, 1500);
  };

  const handlePrintSlip = () => {
    setAssaySlipSuccess(true);
    setTimeout(() => setAssaySlipSuccess(false), 2000);
  };

  const handleToggleStoreCredit = () => {
    setStoreCreditBonusApplied(!storeCreditBonusApplied);
    setTenderMethod(storeCreditBonusApplied ? "RTGS" : "STORE_CREDIT");
    onConvertToCredit?.(item);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              {itemCode}: {description}
            </h3>
          </div>
          <div className="text-xs text-platinum font-medium">
            {parentBatchTitle}
          </div>
          <div className="text-[11px] font-mono text-platinum/60">
            Client: {clientName} • {alloyClassification}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            XRF Assayed
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

      {/* Dual Gauges: Fineness & Dross Loss */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gauge 1: Assayed Gold Fineness */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              Au Fineness Purity
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {assayedFinenessPercent.toFixed(2)}%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: `${assayedFinenessPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>Standard Au 916.8</span>
            <span className="text-emerald-400 font-semibold">Niton XL5 Certified</span>
          </div>
        </div>

        {/* Gauge 2: Dross Burn Tolerance */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-gold" />
              Dross Loss Tolerance
            </span>
            <span className="font-bold text-gold tabular-nums">
              0.85%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)] rounded-full"
              style={{ width: "85%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>Est. Crucible Burn</span>
            <span className="text-slate-100 font-semibold tabular-nums">{drossLossWeight.toFixed(3)}g Burn</span>
          </div>
        </div>
      </div>

      {/* Niton XRF & Hydrostatic Density Box */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2.5 font-mono">
        <div className="flex items-center justify-between text-xs text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            Niton XL5 Elemental & Hydrostatic Density Readout
          </span>
          <span className="text-[10px] text-emerald-400">Tungsten Clear</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Au (Fine Gold):</div>
            <div className="text-emerald-400 font-bold mt-0.5 tabular-nums">
              {assayedFinenessPercent.toFixed(2)}%
            </div>
          </div>

          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Specific Gravity (Density):</div>
            <div className="text-slate-100 font-bold mt-0.5 tabular-nums">
              {specificGravity.toFixed(2)} g/cm³
            </div>
          </div>

          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Ag (Silver Alloy):</div>
            <div className="text-slate-200 font-semibold mt-0.5 tabular-nums">
              5.12%
            </div>
          </div>

          <div className="p-2 rounded bg-surface-card border border-surface-border/60">
            <div className="text-[10px] text-platinum/60">Cu (Copper Hardener):</div>
            <div className="text-slate-200 font-semibold mt-0.5 tabular-nums">
              2.85%
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Payout Calculation Box */}
      <div className="p-4 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Refining Payout Settlement Calculation
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            MCX Fix Pegged
          </span>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Net Pure Gold Equivalent:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              {netGoldGrams.toFixed(3)} g Fine Au
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>MCX 24K Spot Benchmark:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              ₹ {spotBenchmark.toFixed(2)} / g
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Atelier Refining & Smelt Deduction (1.5%):</span>
            <span className="text-amber-400 font-semibold tabular-nums">
              - ₹ 6,475.00
            </span>
          </div>

          {storeCreditBonusApplied && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>VIP Store Credit Incentive (+2.0% Bonus):</span>
              <span className="font-semibold tabular-nums">
                + ₹ {(storeCreditValuation - payoutValueInr).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-surface-border pt-2 text-base font-bold">
            <span className="text-slate-100">
              {storeCreditBonusApplied ? "Store Credit Total:" : "Total Bank Payout Payable:"}
            </span>
            <span className="text-emerald-400 tabular-nums">
              ₹ {(storeCreditBonusApplied ? storeCreditValuation : payoutValueInr).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Tender Method Selector */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-platinum/80 font-medium">
          <Wallet className="w-3.5 h-3.5 text-gold" />
          <span>Settlement Disbursement Method</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setTenderMethod("RTGS");
              setStoreCreditBonusApplied(false);
            }}
            className={`p-2 rounded-lg border text-left transition-all ${
              tenderMethod === "RTGS"
                ? "bg-gold/15 border-gold text-gold font-bold"
                : "bg-surface-card border-surface-border/70 text-platinum/70 hover:text-slate-100"
            }`}
          >
            <div className="text-[11px]">Immediate RTGS Wire</div>
            <div className="text-[9px] text-platinum/50 mt-0.5">ICICI Treasury Direct</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTenderMethod("STORE_CREDIT");
              setStoreCreditBonusApplied(true);
            }}
            className={`p-2 rounded-lg border text-left transition-all ${
              tenderMethod === "STORE_CREDIT"
                ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold"
                : "bg-surface-card border-surface-border/70 text-platinum/70 hover:text-slate-100"
            }`}
          >
            <div className="text-[11px]">Store Credit (+2%)</div>
            <div className="text-[9px] text-platinum/50 mt-0.5">Instant Showroom Voucher</div>
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {assaySlipSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <Printer className="w-4 h-4" />
          <span>Metallurgical Assay & XRF Certificate PDF dispatched to printer!</span>
        </div>
      )}

      {payoutSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>RTGS Disbursed! Crucible #44 Sealed for Induction Smelting.</span>
        </div>
      )}

      {/* Action Deck */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrintSlip}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-platinum/70" />
            <span>Print Assay Slip</span>
          </button>

          <button
            onClick={handleToggleStoreCredit}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
              storeCreditBonusApplied
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-bold"
                : "bg-surface-elevated hover:bg-surface-border border-surface-border text-slate-200"
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5 text-platinum/70" />
            <span>{storeCreditBonusApplied ? "Bonus Active" : "Store Credit (+2%)"}</span>
          </button>
        </div>

        <button
          onClick={handleAuthorize}
          disabled={isProcessing || payoutSuccess}
          className="w-full py-2.5 px-4 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono tracking-wide shadow-lg shadow-gold/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Lock className="w-4 h-4 text-obsidian" />
          <span>
            {isProcessing
              ? "Authorizing RTGS Wire..."
              : `Authorize Immediate RTGS Payout & Seal Crucible (₹ ${(storeCreditBonusApplied ? storeCreditValuation : payoutValueInr).toLocaleString("en-IN")})`}
          </span>
        </button>
      </div>
    </div>
  );
}
