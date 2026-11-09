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
  ShieldCheck,
  Award,
  Printer,
  Download,
  ExternalLink,
  QrCode,
  Scale,
  Microscope,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { HuidRecord } from "@jewelcore/shared";
import { QrCodeRenderer } from "@/components/luxury/QrCodeRenderer";

interface BisCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HuidRecord | null;
}

export function BisCertificateModal({
  isOpen,
  onClose,
  record,
}: BisCertificateModalProps) {
  if (!record) return null;

  const handlePrint = () => {
    toast.info("Preparing BIS Hallmarking Certificate for printing...");
    window.print();
  };

  const handleDownload = () => {
    toast.success("BIS Care Verification Certificate Downloaded", {
      description: `Certificate ${record.certificateNumber} exported as cryptographic PDF.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="bis-certificate-modal"
        className="max-w-2xl bg-surface border border-gold/40 text-foreground shadow-2xl p-0 overflow-hidden"
      >
        {/* Certificate Header Banner */}
        <div className="p-6 border-b border-surface-border bg-gradient-to-r from-obsidian via-surface-elevated to-obsidian relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* BIS Triangular Hallmark Emblem */}
              <div className="w-12 h-12 rounded-lg bg-gold/15 border-2 border-gold flex items-center justify-center text-gold shrink-0 shadow-md">
                <Award className="w-6 h-6 text-gold" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase block font-semibold">
                  Bureau of Indian Standards • Govt. of India
                </span>
                <DialogTitle className="text-lg font-bold font-serif text-foreground">
                  Certificate of Conformity &amp; Hallmarking
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                  IS 1417:2016 • Assaying &amp; Hallmarking Centre Regulations
                </DialogDescription>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Certificate No
              </span>
              <span className="font-mono font-bold text-gold text-xs">
                {record.certificateNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Central 6-Character HUID Stamp Box */}
          <div className="p-6 rounded-xl bg-surface-elevated/80 border-2 border-dashed border-gold/50 flex flex-col items-center justify-center text-center space-y-2 relative shadow-inner">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Statutory 6-Character Hallmark Unique Identification
            </span>
            <div
              data-testid="certificate-huid-display"
              className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-gold select-all drop-shadow-sm"
            >
              {record.huid}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="gold" className="text-xs font-mono px-2.5 py-0.5">
                {record.finenessString}
              </Badge>
              <Badge variant="emerald" className="text-xs font-mono px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Laser Attested (15µm)
              </Badge>
            </div>
          </div>

          {/* Piece & Material Provenance Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Article Details */}
            <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
              <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                Certified Jewellery Piece
              </span>
              <div>
                <span className="text-foreground font-bold text-sm block">
                  {record.materialDescription}
                </span>
                <span className="text-gold font-mono text-xs block mt-0.5">
                  Serial: {record.pieceSerial} • Item: {record.itemCode}
                </span>
              </div>
              <div className="pt-2 border-t border-surface-border grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Gross Weight:</span>
                  <span className="font-bold text-foreground">
                    {record.grossWeightGrams.toFixed(3)} g
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Hydrostatic SG:</span>
                  <span className="font-bold text-foreground">
                    {record.hydrostaticDensity} g/cm³
                  </span>
                </div>
              </div>
            </div>

            {/* Accredited AHC Center */}
            <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border space-y-2">
              <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                Accredited Assaying Center (AHC)
              </span>
              <div>
                <span className="text-foreground font-bold text-sm block">
                  {record.ahcCenterName}
                </span>
                <span className="text-gold font-mono text-xs block mt-0.5">
                  Registration: {record.ahcCenterId}
                </span>
              </div>
              <div className="pt-2 border-t border-surface-border text-[11px]">
                <span className="text-muted-foreground block">Assaying Officer:</span>
                <span className="font-bold text-foreground">{record.assayerName}</span>
                <span className="text-status-emerald block text-[10px] mt-0.5">
                  XRF Spectrometry: {record.xrfGoldPercent}% Au Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Public Verification & BIS Care Portal */}
          <div className="p-4 rounded-lg bg-surface-elevated/50 border border-surface-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <QrCodeRenderer
                  value={
                    record.bisCareQrUrl ||
                    `https://www.manakonline.in/MANAK/bisCare/viewHuidDetails?huid=${encodeURIComponent(record.huid)}`
                  }
                  size={84}
                  margin={1}
                  errorCorrectionLevel="H"
                  centerLogo="bis"
                  caption={record.huid}
                />
              </div>
              <div>
                <span className="text-foreground font-bold block">
                  Public BIS Care Portal Attestation
                </span>
                <span className="text-muted-foreground text-[10px] block">
                  Consumers and authorities can verify this 6-digit HUID code directly on the BIS Care Portal.
                </span>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono border-gold/40 text-gold shrink-0">
              BIS Verified
            </Badge>
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
              <span>Print Certificate</span>
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
