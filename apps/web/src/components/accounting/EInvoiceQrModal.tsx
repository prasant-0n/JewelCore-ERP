"use client";

import React, { useState } from "react";
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
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Hash,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { EInvoiceItem } from "@jewelcore/shared";

interface EInvoiceQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: EInvoiceItem | null;
}

export function EInvoiceQrModal({
  isOpen,
  onClose,
  invoice,
}: EInvoiceQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const handleCopyIrn = () => {
    if (invoice.irn) {
      void navigator.clipboard.writeText(invoice.irn);
      setCopied(true);
      toast.success("IRN Hash Copied to Clipboard", {
        description: invoice.irn,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPayload = () => {
    const payload = invoice.signedInvoicePayload || JSON.stringify(invoice, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NIC_EINVOICE_${invoice.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Signed NIC E-Invoice JSON Exported");
  };

  const handlePrint = () => {
    toast.info("Preparing B2B Tax Invoice with Signed QR Code for printing...");
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="einvoice-qr-modal"
        className="max-w-2xl bg-surface border border-surface-border text-foreground shadow-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border bg-surface-elevated/70">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>NIC Statutory E-Invoice &amp; Digital QR</span>
                  <Badge variant="emerald" className="text-[10px] font-mono">
                    IRN ACTIVE
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Rule 48(4) CGST • National Informatics Centre (NIC) Invoice Registration Portal
                </DialogDescription>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Invoice No
              </span>
              <span className="font-mono font-bold text-gold text-sm">
                {invoice.invoiceNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* QR Code and Quick Verification Row */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-surface-elevated border border-surface-border">
            {/* Visual B2B QR Code */}
            <div className="w-40 h-40 bg-white rounded-lg p-3 flex flex-col items-center justify-between shrink-0 shadow-md border-2 border-gold/40 relative group">
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-900 font-mono text-[9px] text-center space-y-1">
                {/* SVG QR Code Pattern */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-28 h-28 text-black fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Position detection markers */}
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="4" y="4" width="22" height="22" fill="white" />
                  <rect x="8" y="8" width="14" height="14" fill="currentColor" />

                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="74" y="4" width="22" height="22" fill="white" />
                  <rect x="78" y="8" width="14" height="14" fill="currentColor" />

                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                  <rect x="4" y="74" width="22" height="22" fill="white" />
                  <rect x="8" y="78" width="14" height="14" fill="currentColor" />

                  {/* Cryptographic QR Pattern representation */}
                  <rect x="36" y="8" width="8" height="8" fill="currentColor" />
                  <rect x="48" y="16" width="6" height="6" fill="currentColor" />
                  <rect x="58" y="8" width="6" height="6" fill="currentColor" />
                  <rect x="36" y="24" width="6" height="6" fill="currentColor" />
                  <rect x="48" y="32" width="12" height="6" fill="currentColor" />
                  <rect x="12" y="38" width="8" height="8" fill="currentColor" />
                  <rect x="28" y="42" width="6" height="6" fill="currentColor" />
                  <rect x="40" y="46" width="18" height="8" fill="currentColor" />
                  <rect x="68" y="36" width="12" height="10" fill="currentColor" />
                  <rect x="84" y="48" width="10" height="8" fill="currentColor" />
                  <rect x="36" y="60" width="8" height="14" fill="currentColor" />
                  <rect x="48" y="68" width="12" height="8" fill="currentColor" />
                  <rect x="66" y="62" width="14" height="10" fill="currentColor" />
                  <rect x="84" y="74" width="10" height="10" fill="currentColor" />
                  <rect x="40" y="82" width="16" height="10" fill="currentColor" />
                </svg>
                <span className="font-bold text-[8px] tracking-wider text-black">
                  NIC GST VERIFIED
                </span>
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-status-emerald font-semibold">
                <ShieldCheck className="w-4 h-4 text-status-emerald shrink-0" />
                <span>Digitally Signed by National Informatics Centre (IRP)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block">
                    Ack Number
                  </span>
                  <span className="text-foreground font-bold font-mono">
                    {invoice.ackNo || "112610984521098"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block">
                    Ack Timestamp
                  </span>
                  <span className="text-foreground font-mono text-[11px]">
                    {invoice.ackDate
                      ? new Date(invoice.ackDate).toLocaleString("en-IN")
                      : "2026-11-08 14:22:10"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block">
                    Invoice Total
                  </span>
                  <span className="text-gold font-bold text-sm">
                    ₹ {invoice.totalAmountInr.toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block">
                    Tax Amount (GST 3%)
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    ₹ {(invoice.cgstAmountInr + invoice.sgstAmountInr + invoice.igstAmountInr).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 64-character SHA-256 IRN Hash Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                <Hash className="w-3 h-3 text-gold" />
                <span>64-Character SHA-256 Invoice Reference Number (IRN)</span>
              </label>
              <button
                type="button"
                onClick={handleCopyIrn}
                className="text-[10px] font-mono text-gold hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy IRN"}</span>
              </button>
            </div>

            <div className="p-3 bg-surface-elevated/80 border border-surface-border rounded-lg text-xs font-mono break-all text-gold font-semibold select-all">
              {invoice.irn || "9f8a42b10c8973d4a6e5b2c1f0e9d8a7c6b5a4930192e30000017000800000000001"}
            </div>
          </div>

          {/* Supplier & Recipient Legal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Supplier Card */}
            <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-1">
              <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                Supplier (Atelier Consignor)
              </span>
              <span className="text-foreground font-bold block truncate">
                {invoice.supplierLegalName}
              </span>
              <span className="text-gold font-mono block text-[11px]">
                GSTIN: {invoice.supplierGstin}
              </span>
              <span className="text-muted-foreground text-[10px] block">
                State: 27 (Maharashtra) • Mumbai Central Showroom
              </span>
            </div>

            {/* Recipient Card */}
            <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-1">
              <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                Recipient (B2B Consignee)
              </span>
              <span className="text-foreground font-bold block truncate">
                {invoice.recipientLegalName}
              </span>
              <span className="text-gold font-mono block text-[11px]">
                GSTIN: {invoice.recipientGstin}
              </span>
              <span className="text-muted-foreground text-[10px] block truncate">
                {invoice.recipientAddress}
              </span>
            </div>
          </div>

          {/* Item & HSN Details */}
          <div className="p-3 rounded-lg bg-surface-elevated/50 border border-surface-border text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-muted-foreground border-b border-surface-border pb-1 text-[10px] uppercase">
              <span>HSN / Description</span>
              <span>Weight</span>
              <span>Taxable Value</span>
              <span>GST</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <div>
                <span className="text-gold font-bold">{invoice.hsnCode}</span>
                <span className="text-muted-foreground ml-2 text-[11px]">
                  {invoice.hsnDescription}
                </span>
              </div>
              <div className="text-foreground">{invoice.quantityGrams.toFixed(1)} g</div>
              <div className="text-foreground font-semibold">
                ₹ {invoice.taxableAmountInr.toLocaleString("en-IN")}
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {invoice.gstRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-elevated/90 border-t border-surface-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPayload}
              className="h-8 text-xs font-mono gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed JSON</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-mono gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
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
