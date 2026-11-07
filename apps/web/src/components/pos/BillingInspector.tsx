"use client";

import React, { useState } from "react";
import { PosPieceData } from "./PosPieceCard";
import {
  ShoppingBag,
  CreditCard,
  Scale,
  ShieldCheck,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  RotateCw,
  QrCode,
  FileText,
  BadgePercent,
  Wallet,
} from "lucide-react";

interface BillingInspectorProps {
  cartPieces: PosPieceData[];
  selectedPiece: PosPieceData | null;
  clientName?: string;
  clientVipNumber?: string;
  panNumber?: string;
  oldGoldCreditInr?: number;
  onClose?: () => void;
  onAuthorizePayment?: () => void;
  onApplyDiscount?: () => void;
}

export function BillingInspector({
  cartPieces,
  selectedPiece,
  clientName = "Mrs. Radhika Singhania",
  clientVipNumber = "VIP-9021",
  panNumber = "AAAPS9012K (Verified)",
  oldGoldCreditInr = 124500,
  onClose,
  onAuthorizePayment,
  onApplyDiscount,
}: BillingInspectorProps) {
  const [tenderMethod, setTenderMethod] = useState<"RTGS" | "AMEX" | "BULLION_OFFSET" | "SPLIT">("RTGS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [proformaSuccess, setProformaSuccess] = useState(false);

  // Financial calculations
  const totalGrossWeight = cartPieces.reduce((acc, p) => acc + (p.grossWeightGrams || 0), 0);
  const totalNetGoldWeight = cartPieces.reduce((acc, p) => acc + (p.netGoldGrams || 0), 0);
  const grossMetalValue = cartPieces.reduce((acc, p) => acc + (p.metalValueInr || 0), 0);
  const diamondValue = cartPieces.reduce((acc, p) => acc + (p.diamondValueInr || 0), 0);
  const makingCharges = cartPieces.reduce((acc, p) => acc + (p.makingChargeInr || 0), 0);

  const discountAmount = discountApplied ? Math.round(makingCharges * 0.15) : 0;
  const taxableSubtotal = Math.max(0, grossMetalValue + diamondValue + (makingCharges - discountAmount) - oldGoldCreditInr);
  const cgstAmount = taxableSubtotal * 0.015;
  const sgstAmount = taxableSubtotal * 0.015;
  const totalPayable = taxableSubtotal + cgstAmount + sgstAmount;

  const handleAuthorize = async () => {
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsProcessing(false);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      onAuthorizePayment?.();
    }, 1500);
  };

  const handleToggleDiscount = () => {
    setDiscountApplied(!discountApplied);
    onApplyDiscount?.();
  };

  const handlePrintProforma = () => {
    setProformaSuccess(true);
    setTimeout(() => setProformaSuccess(false), 2000);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-gold" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              Order #TXN-2026-9811
            </h3>
          </div>
          <div className="text-xs text-platinum font-medium">
            Client: {clientName} • {clientVipNumber}
          </div>
          <div className="text-[11px] font-mono text-platinum/60">
            PAN: {panNumber} • Flagship Salon Suite 1
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AML Verified
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

      {/* Dual Gauges: Weight & Tax Compliance */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gauge 1: Cart Gross Metal Weight */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-gold" />
              Cart Metal Load
            </span>
            <span className="font-bold text-slate-100 tabular-nums">
              {totalGrossWeight.toFixed(3)}g
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)] rounded-full"
              style={{ width: `${Math.min(100, (totalGrossWeight / 150) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>Net Au: {totalNetGoldWeight.toFixed(3)}g</span>
            <span className="text-emerald-400 font-semibold">Load Cell Synced</span>
          </div>
        </div>

        {/* Gauge 2: Statutory Tax Compliance */}
        <div className="p-3 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tax Compliance
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">
              100%
            </span>
          </div>

          <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-platinum/60">
            <span>BIS Hallmarked</span>
            <span className="text-emerald-400 font-semibold">3% GST Stamped</span>
          </div>
        </div>
      </div>

      {/* Itemized Tax Invoice Breakdown Box */}
      <div className="p-4 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-gold font-medium">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Itemized GST Tax Invoice Calculation
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {cartPieces.length} Items Locked
          </span>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between text-platinum/70">
            <span>Gross Bullion Metal Value:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              ₹ {grossMetalValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Certified Solitaire & Diamond Value:</span>
            <span className="text-slate-100 font-bold tabular-nums">
              ₹ {diamondValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/70">
            <span>Handcrafted Atelier Making Charge:</span>
            <span className="text-gold font-semibold tabular-nums">
              ₹ {makingCharges.toLocaleString("en-IN")}
            </span>
          </div>

          {discountApplied && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>VIP Privilege Making Discount (-15%):</span>
              <span className="font-semibold tabular-nums">
                - ₹ {discountAmount.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {oldGoldCreditInr > 0 && (
            <div className="flex items-center justify-between text-amber-400">
              <span>Less Old Gold Buyback Trade-In Credit:</span>
              <span className="font-semibold tabular-nums">
                - ₹ {oldGoldCreditInr.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-platinum/70 border-t border-surface-border/60 pt-2">
            <span>Taxable Net Subtotal:</span>
            <span className="text-slate-100 font-semibold tabular-nums">
              ₹ {taxableSubtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-platinum/60 text-[11px]">
            <span>CGST (1.5%) + SGST (1.5%):</span>
            <span className="text-platinum/70 tabular-nums">
              + ₹ {(cgstAmount + sgstAmount).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-surface-border pt-2 text-base font-bold">
            <span className="text-slate-100">Net Payable Total:</span>
            <span className="text-emerald-400 tabular-nums">
              ₹ {Math.round(totalPayable).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Tender Method Selector */}
      <div className="p-3.5 bg-surface-elevated/40 border border-surface-border rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-platinum/80 font-medium">
          <Wallet className="w-3.5 h-3.5 text-gold" />
          <span>Payment Settlement Tender</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setTenderMethod("RTGS")}
            className={`p-2 rounded-lg border text-left transition-all ${
              tenderMethod === "RTGS"
                ? "bg-gold/15 border-gold text-gold font-bold"
                : "bg-surface-card border-surface-border/70 text-platinum/70 hover:text-slate-100"
            }`}
          >
            <div className="text-[11px]">RTGS / NEFT Wire</div>
            <div className="text-[9px] text-platinum/50 mt-0.5">HDFC Escrow Vault</div>
          </button>

          <button
            type="button"
            onClick={() => setTenderMethod("AMEX")}
            className={`p-2 rounded-lg border text-left transition-all ${
              tenderMethod === "AMEX"
                ? "bg-gold/15 border-gold text-gold font-bold"
                : "bg-surface-card border-surface-border/70 text-platinum/70 hover:text-slate-100"
            }`}
          >
            <div className="text-[11px]">AMEX Centurion Card</div>
            <div className="text-[9px] text-platinum/50 mt-0.5">Ingenico Terminal #01</div>
          </button>

          <button
            type="button"
            onClick={() => setTenderMethod("BULLION_OFFSET")}
            className={`p-2 rounded-lg border text-left transition-all ${
              tenderMethod === "BULLION_OFFSET"
                ? "bg-gold/15 border-gold text-gold font-bold"
                : "bg-surface-card border-surface-border/70 text-platinum/70 hover:text-slate-100"
            }`}
          >
            <div className="text-[11px]">Bullion Bar Offset</div>
            <div className="text-[9px] text-platinum/50 mt-0.5">Assayed 24K Ingot Offset</div>
          </button>

          <button
            type="button"
            onClick={() => setTenderMethod("SPLIT")}
            className={`p-2 rounded-lg border text-left transition-all ${
              tenderMethod === "SPLIT"
                ? "bg-gold/15 border-gold text-gold font-bold"
                : "bg-surface-card border-surface-border/70 text-platinum/70 hover:text-slate-100"
            }`}
          >
            <div className="text-[11px]">Split Tender</div>
            <div className="text-[9px] text-platinum/50 mt-0.5">Card + RTGS + Credit</div>
          </button>
        </div>
      </div>

      {/* Feedback Notifications */}
      {proformaSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <Printer className="w-4 h-4" />
          <span>Proforma GST Invoice PDF generated & sent to VIP salon tablet!</span>
        </div>
      )}

      {paymentSuccess && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Payment Authorized! Vault Security Lock Released for Order #TXN-9811.</span>
        </div>
      )}

      {/* Action Deck */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrintProforma}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-platinum/70" />
            <span>Print Proforma</span>
          </button>

          <button
            onClick={handleToggleDiscount}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
              discountApplied
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-surface-elevated hover:bg-surface-border border-surface-border text-slate-200"
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5 text-platinum/70" />
            <span>{discountApplied ? "Discount Applied" : "VIP Discount"}</span>
          </button>
        </div>

        <button
          onClick={handleAuthorize}
          disabled={isProcessing || paymentSuccess || cartPieces.length === 0}
          className="w-full py-2.5 px-4 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono tracking-wide shadow-lg shadow-gold/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Lock className="w-4 h-4 text-obsidian" />
          <span>
            {isProcessing
              ? "Authorizing Settlement Gateway..."
              : `Authorize Payment & Release Vault Custody (₹ ${Math.round(totalPayable).toLocaleString("en-IN")})`}
          </span>
        </button>
      </div>
    </div>
  );
}
