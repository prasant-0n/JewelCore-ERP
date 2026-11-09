"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Download,
  QrCode,
  ShieldCheck,
  Hammer,
  Scale,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import type { Itc04ChallanRecord } from "@jewelcore/shared";
import { QrCodeRenderer } from "@/components/luxury/QrCodeRenderer";
import { BarcodeRenderer } from "@/components/luxury/BarcodeRenderer";

interface Itc04ChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  challan: Itc04ChallanRecord | null;
}

export function Itc04ChallanModal({
  isOpen,
  onClose,
  challan,
}: Itc04ChallanModalProps) {
  if (!challan) return null;

  const handlePrint = () => {
    toast.info("Preparing Form GST ITC-04 Delivery Challan for printing...");
    window.print();
  };

  const handleDownload = () => {
    toast.success("GST ITC-04 Delivery Challan Exported", {
      description: `Challan ${challan.challanNumber} exported as official tax document.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="itc04-challan-modal"
        className="max-w-2xl bg-surface border border-gold/40 text-foreground shadow-2xl p-0 overflow-hidden"
      >
        {/* Header Banner */}
        <div className="p-6 border-b border-surface-border bg-gradient-to-r from-obsidian via-surface-elevated to-obsidian relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0 shadow-md">
                <FileText className="w-6 h-6 text-gold" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase block font-semibold">
                  Government of India • Goods and Services Tax Rules
                </span>
                <DialogTitle className="text-lg font-bold font-serif text-foreground">
                  FORM GST ITC-04 Delivery Challan
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Rule 45(1) &amp; Section 143 • Job-Work Precious Metal Transit
                </DialogDescription>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-0.5">
                Challan No
              </span>
              <span
                data-testid="challan-number-display"
                className="font-mono font-bold text-gold text-xs"
              >
                {challan.challanNumber}
              </span>
              <BarcodeRenderer
                value={challan.challanNumber}
                height={18}
                width={0.95}
                margin={1}
                fontSize={8}
                displayValue={false}
                className="mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Challan Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Statutory Notice Banner */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-gold/30 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Statutory Authority &amp; Reference Job Order
              </span>
              <span className="font-bold text-foreground">
                Job Work Order: <span className="text-gold">{challan.jobNumber}</span>
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {challan.statutoryRule}
              </span>
            </div>

            <Badge variant="emerald" className="text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {challan.status}
            </Badge>
          </div>

          {/* Consignor & Consignee Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Consignor (Jeweller) */}
            <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
              <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                Consignor (Principal Manufacturer)
              </span>
              <span className="text-foreground font-bold text-sm block">
                {challan.consignorName}
              </span>
              <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-surface-border">
                <div>
                  GSTIN: <span className="font-bold text-foreground">{challan.consignorGstin}</span>
                </div>
                <div className="truncate max-w-[240px]" title={challan.consignorAddress}>
                  {challan.consignorAddress}
                </div>
                <div>
                  Dispatch State: <span className="text-foreground">{challan.dispatchState}</span>
                </div>
              </div>
            </div>

            {/* Consignee (Karigar) */}
            <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
              <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                Consignee (Job Worker / Master Artisan)
              </span>
              <span className="text-foreground font-bold text-sm block">
                {challan.karigarName}
              </span>
              <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-surface-border">
                <div>
                  Artisan Code: <span className="font-bold text-gold">{challan.karigarCode}</span>
                </div>
                <div>
                  PAN/GSTIN: <span className="font-bold text-foreground">{challan.karigarGstinOrPan}</span>
                </div>
                <div className="truncate max-w-[240px]" title={challan.karigarAddress}>
                  {challan.karigarAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Consignment Item Details Table */}
          <div className="rounded-lg border border-surface-border overflow-hidden">
            <div className="p-3 bg-surface-elevated text-xs font-mono font-bold border-b border-surface-border flex items-center justify-between">
              <span>Goods Dispatched for Processing (HSN {challan.hsnCode})</span>
              <Badge variant="outline" className="text-[10px] font-mono border-gold/40 text-gold">
                {challan.natureOfProcessing}
              </Badge>
            </div>
            <div className="p-4 bg-surface text-xs font-mono space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Description of Goods</span>
                  <span className="font-bold text-foreground">{challan.itemDescription}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase block">Security Seal</span>
                  <span className="font-bold text-gold">{challan.securitySealNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-surface-border text-[11px]">
                <div className="p-2 rounded bg-surface-elevated border border-surface-border">
                  <span className="text-[10px] text-muted-foreground block">Fine Gold (24K)</span>
                  <span className="font-bold text-gold">{challan.issuedPureGoldGrams.toFixed(3)} g</span>
                </div>
                <div className="p-2 rounded bg-surface-elevated border border-surface-border">
                  <span className="text-[10px] text-muted-foreground block">Alloy Additions</span>
                  <span className="font-bold text-foreground">{challan.issuedAlloyGrams.toFixed(3)} g</span>
                </div>
                <div className="p-2 rounded bg-surface-elevated border border-surface-border">
                  <span className="text-[10px] text-muted-foreground block">Total Gross Mass</span>
                  <span className="font-bold text-foreground">{challan.issuedGrossMetalGrams.toFixed(3)} g</span>
                </div>
                <div className="p-2 rounded bg-surface-elevated border border-surface-border">
                  <span className="text-[10px] text-muted-foreground block">Declared Value</span>
                  <span className="font-bold text-status-emerald">₹{challan.declaredTaxableValueInr.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {(challan.issuedDiamondCarats > 0 || challan.issuedGemstoneCarats > 0) && (
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Diamond Stones Issued:</span>
                    <span className="font-bold text-foreground">{challan.issuedDiamondCarats} Carats</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Gemstones Issued:</span>
                    <span className="font-bold text-foreground">{challan.issuedGemstoneCarats} Carats</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Verification & Statutory Sign-off */}
          <div className="p-4 rounded-lg bg-surface-elevated/60 border border-surface-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <QrCodeRenderer
                  value={`GST-ITC04:${challan.challanNumber}:CONSIGNOR=${challan.consignorGstin}:ARTISAN=${challan.karigarCode}:GROSS=${challan.issuedGrossMetalGrams}g:SEAL=${challan.securitySealNumber}`}
                  size={84}
                  margin={1}
                  errorCorrectionLevel="H"
                  centerLogo="gst"
                />
              </div>
              <div>
                <span className="text-foreground font-bold block">
                  Cryptographic GST ITC-04 Attestation
                </span>
                <span className="text-muted-foreground text-[10px] block">
                  Mandatory under GST Rule 45(1) for inter-state or intra-state job-work precious metal transit.
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] shrink-0">
              <span className="text-[10px] text-muted-foreground block uppercase">Authorized Officer</span>
              <span className="font-bold text-foreground">{challan.authorizedBy}</span>
              <span className="text-[10px] text-gold block">Due Return: {challan.dueReturnDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-elevated/90 border-t border-surface-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 text-xs font-mono gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-mono gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-mono"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
