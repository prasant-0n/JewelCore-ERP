"use client";

import React, { useState } from "react";
import { PosPieceData } from "./PosPieceCard";
import {
  CreditCard,
  Printer,
  CheckCircle2,
  Lock,
  X,
  BadgePercent,
  Wallet,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { JewelCoreLogo } from "../common/JewelCoreLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

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
  const [tenderMethod, setTenderMethod] = useState<
    "RTGS" | "AMEX" | "BULLION_OFFSET" | "SPLIT"
  >("RTGS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Financial calculations
  const totalGrossWeight = cartPieces.reduce(
    (acc, p) => acc + (p.grossWeightGrams || 0),
    0,
  );
  const grossMetalValue = cartPieces.reduce(
    (acc, p) => acc + (p.metalValueInr || 0),
    0,
  );
  const diamondValue = cartPieces.reduce(
    (acc, p) => acc + (p.diamondValueInr || 0),
    0,
  );
  const makingCharges = cartPieces.reduce(
    (acc, p) => acc + (p.makingChargeInr || 0),
    0,
  );

  const discountAmount = discountApplied ? Math.round(makingCharges * 0.15) : 0;
  const taxableSubtotal = Math.max(
    0,
    grossMetalValue +
      diamondValue +
      (makingCharges - discountAmount) -
      oldGoldCreditInr,
  );
  const cgstAmount = taxableSubtotal * 0.015;
  const sgstAmount = taxableSubtotal * 0.015;
  const finalInvoiceTotal = taxableSubtotal + cgstAmount + sgstAmount;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowInvoiceModal(true);
      toast.success("Payment Authorized & Invoice Settled", {
        description: `₹${finalInvoiceTotal.toLocaleString("en-IN")} received via ${tenderMethod}. Tax invoice IRN generated.`,
      });
      onAuthorizePayment?.();
    }, 600);
  };

  const handleDiscountToggle = () => {
    setDiscountApplied(!discountApplied);
    toast.info(
      !discountApplied
        ? "VIP 15% Making Charge Discount Applied"
        : "Discount Removed",
    );
    onApplyDiscount?.();
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
                POS Billing &amp; Settlement
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Client:{" "}
              <span className="font-semibold text-foreground">
                {clientName}
              </span>{" "}
              ({panNumber})
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
            GST E-Invoice Ready
          </Badge>
          <Badge variant="gold">
            <Lock className="w-3 h-3 mr-1" />
            PMLA Compliant
          </Badge>
        </div>
      </CardHeader>

      {/* Financial Decomposition */}
      <CardContent className="p-4 sm:p-5 border-b border-surface-border space-y-3.5">
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              Invoice Net Payable:
            </span>
            <TabularCurrency
              amount={finalInvoiceTotal}
              className="text-gold text-lg font-bold"
            />
          </div>
          <div className="space-y-1 text-xs font-mono text-muted-foreground pt-1 border-t border-surface-border">
            <div className="flex justify-between">
              <span>Gross Metal Value:</span>
              <TabularCurrency amount={grossMetalValue} />
            </div>
            <div className="flex justify-between">
              <span>Diamond &amp; Gemstones:</span>
              <TabularCurrency amount={diamondValue} />
            </div>
            <div className="flex justify-between">
              <span>Making Charges:</span>
              <TabularCurrency amount={makingCharges - discountAmount} />
            </div>
            {oldGoldCreditInr > 0 && (
              <div className="flex justify-between text-status-emerald">
                <span>Old Gold Buyback Credit:</span>
                <span>-₹{oldGoldCreditInr.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] pt-1 border-t border-surface-border">
              <span>GST 3% (CGST 1.5% + SGST 1.5%):</span>
              <TabularCurrency amount={cgstAmount + sgstAmount} />
            </div>
          </div>
        </div>

        {/* Total Weight Load Cell */}
        <MetrologyGauge
          label="Cart Verified Gross Weight"
          currentValue={totalGrossWeight}
          maxValue={totalGrossWeight * 1.02}
          unit="g"
          decimals={3}
          status="passing"
        />

        {/* Tender Method Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Select Settlement Tender:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "RTGS", label: "NEFT / RTGS" },
              { id: "AMEX", label: "Amex Centurion" },
              { id: "SPLIT", label: "Split Tender" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTenderMethod(t.id as any)}
                className={`p-2 rounded-lg border text-xs font-mono font-medium transition-all ${
                  tenderMethod === t.id
                    ? "bg-gold text-black font-semibold shadow-sm"
                    : "bg-surface border-surface-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-surface-elevated/70 border-t border-surface-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleDiscountToggle}
        >
          <BadgePercent className="w-3.5 h-3.5 mr-1" />
          {discountApplied ? "Remove VIP Disc" : "Apply VIP 15%"}
        </Button>
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={handlePay}
          isLoading={isProcessing}
        >
          <CreditCard className="w-3.5 h-3.5 mr-1" />
          Authorize Sale
        </Button>
      </CardFooter>

      {/* Official Tax Invoice & Atelier Authenticity Certificate Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-lg bg-surface border-surface-border p-6 shadow-2xl">
          <DialogHeader className="border-b border-surface-border pb-4">
            <div className="flex items-center justify-between">
              <JewelCoreLogo size="md" variant="full" />
              <div className="text-right font-mono text-[10px] text-muted-foreground">
                <p className="font-semibold text-foreground">
                  TAX INVOICE / IRN
                </p>
                <p>INV-2026-90412</p>
              </div>
            </div>
            <DialogDescription className="text-left text-[11px] text-muted-foreground pt-2">
              JewelCore Luxury Atelier Group • Flagship Salon, Colaba Causeway •
              GSTIN: 27AABCU9603R1ZM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 text-xs py-2">
            {/* Customer & Settlement Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-elevated/70 border border-surface-border font-mono text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Client Context
                </span>
                <span className="font-semibold text-foreground">
                  {clientName}
                </span>
                <p className="text-muted-foreground text-[10px]">
                  {clientVipNumber} • PAN: {panNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Payment Tender
                </span>
                <span className="font-semibold text-gold">
                  {tenderMethod} Authorized
                </span>
                <p className="text-status-emerald text-[10px] flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3" /> PMLA / BIS Hallmarked
                </p>
              </div>
            </div>

            {/* Line Items Decomposition */}
            <div className="border border-surface-border rounded-lg overflow-hidden">
              <div className="bg-surface-elevated px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase flex justify-between">
                <span>Description / Item Spec</span>
                <span>Gross Metal</span>
                <span>Total Amount</span>
              </div>
              <div className="divide-y divide-surface-border text-[11px]">
                {cartPieces.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {p.itemName}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {p.metalPurity} • Gross: {p.grossWeightGrams}g • Net:{" "}
                        {p.netGoldGrams}g
                      </p>
                    </div>
                    <div className="font-mono text-right">
                      <p className="text-muted-foreground text-[10px]">
                        ₹{p.metalValueInr.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="font-mono font-semibold text-foreground text-right">
                      ₹{p.totalPriceInr.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Computation Summary */}
            <div className="space-y-1.5 p-3 rounded-lg bg-surface-elevated/50 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Taxable Subtotal:</span>
                <span>₹{taxableSubtotal.toLocaleString("en-IN")}</span>
              </div>
              {oldGoldCreditInr > 0 && (
                <div className="flex justify-between text-status-emerald">
                  <span>Old Gold Buyback Credit:</span>
                  <span>-₹{oldGoldCreditInr.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>CGST (1.5%) + SGST (1.5%):</span>
                <span>
                  ₹{(cgstAmount + sgstAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-sm pt-1.5 border-t border-surface-border">
                <span>Net Total Settled:</span>
                <span className="text-gold">
                  ₹{finalInvoiceTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success("Sending to Thermal Receipt Printer", {
                  description:
                    "ESC/POS print stream dispatched to Salon-1 Star Micronics printer.",
                });
              }}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              Print Invoice
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setShowInvoiceModal(false)}
            >
              Close &amp; Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
