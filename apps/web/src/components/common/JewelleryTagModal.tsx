"use client";

import React, { useState } from "react";
import { Tag, Printer, Download, Sparkles, CheckCircle2, ShieldCheck, QrCode } from "lucide-react";
import { BarcodeRenderer } from "@/components/luxury/BarcodeRenderer";
import { QrCodeRenderer } from "@/components/luxury/QrCodeRenderer";
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
  JewelleryTagData,
  generateZplJewelleryTag,
  generateZplBatch,
} from "../../lib/printing/zplBarcodeTagGenerator";
import { toast } from "sonner";

interface JewelleryTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: JewelleryTagData[];
}

export function JewelleryTagModal({
  isOpen,
  onClose,
  tags,
}: JewelleryTagModalProps) {
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

  const defaultTag: JewelleryTagData = {
    serialNumber: "JC-SOL-2026-081",
    skuCode: "SKU-SOL-18KW-150",
    itemName: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)",
    metalPurity: "18K White Gold (Au 750)",
    grossWeightGrams: 5.42,
    netWeightGrams: 5.116,
    diamondCarat: 1.52,
    diamondSpecs: "F-VVS1 Triple Ex (GIA-2210894511)",
    hallmarkId: "BIS-750-MUM-8912",
    retailPriceInr: 485000,
  };

  const activeTags = tags && tags.length > 0 ? tags : [defaultTag];
  const activeTag = activeTags[selectedTagIndex] || activeTags[0];

  const handleDownloadZpl = () => {
    const zpl = generateZplBatch(activeTags);
    const blob = new Blob([zpl], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jewelcore-tags-${activeTag.serialNumber}.zpl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("ZPL Tag File Downloaded", {
      description: "Direct Zebra thermal printer payload ready (203 DPI format).",
    });
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Jewellery RFID / Barcode Tag Printing Station
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                High-Density Micro Dumbbell &amp; Butterfly Labels • BIS Hallmarked &amp; 2D DataMatrix
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tag Selector if multiple tags */}
        {activeTags.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            {activeTags.map((t, idx) => (
              <button
                key={t.serialNumber}
                onClick={() => setSelectedTagIndex(idx)}
                className={`px-3 py-1.5 rounded-md font-mono text-[11px] transition-all whitespace-nowrap border ${
                  selectedTagIndex === idx
                    ? "bg-gold text-black font-semibold border-gold"
                    : "bg-surface-elevated text-muted-foreground hover:text-foreground border-surface-border"
                }`}
              >
                {t.serialNumber} ({t.metalPurity.split(" ")[0]})
              </button>
            ))}
          </div>
        )}

        {/* Visual Realistic Butterfly / Dumbbell Tag Canvas Preview */}
        <div className="bg-obsidian-deep p-6 rounded-xl border border-surface-border flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-3 left-4 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Tag Dimension: 50mm × 12mm Standard Butterfly
            </span>
          </div>

          <div className="absolute top-3 right-4">
            <Badge variant="gold" className="text-[10px]">
              203 DPI Thermal Ready
            </Badge>
          </div>

          {/* Dumbbell Tag SVG Simulation */}
          <div className="mt-8 mb-4">
            <div className="w-[520px] h-[130px] bg-white rounded-lg shadow-2xl p-2.5 flex items-center justify-between text-black font-sans border-2 border-stone-300 relative select-none">
              {/* Left Wing */}
              <div className="w-[210px] h-full flex flex-col justify-between pr-2 border-r border-dashed border-stone-300">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-900">
                      JEWELCORE ATELIER
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-amber-100 text-amber-950 px-1 rounded">
                      BIS 100%
                    </span>
                  </div>
                  <p className="text-[11px] font-bold font-mono tracking-tight text-neutral-900 mt-0.5">
                    {activeTag.serialNumber}
                  </p>
                  <p className="text-[9px] text-neutral-600 truncate max-w-[200px]">
                    {activeTag.itemName}
                  </p>
                </div>

                {/* Industrial Code-128 Barcode */}
                <div className="mt-1">
                  <div className="h-6 w-full flex items-center justify-center overflow-hidden bg-white">
                    <BarcodeRenderer
                      value={activeTag.serialNumber || activeTag.skuCode}
                      height={22}
                      width={1.1}
                      margin={1}
                      displayValue={false}
                      className="max-h-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 mt-0.5">
                    <span className="font-semibold text-neutral-700">{activeTag.skuCode}</span>
                    <span className="bg-neutral-100 text-neutral-700 px-1 rounded font-bold">{activeTag.epcTag ? "RFID+BARCODE" : "GS1 CODE-128"}</span>
                  </div>
                </div>
              </div>

              {/* Center Narrow Bridge (where string wraps through jewellery ring/chain) */}
              <div className="w-[30px] flex flex-col items-center justify-center text-stone-400">
                <div className="w-1.5 h-1.5 rounded-full border border-stone-400 mb-1" />
                <span className="text-[7px] font-mono uppercase tracking-widest rotate-90 whitespace-nowrap">
                  BRIDGE
                </span>
                <div className="w-1.5 h-1.5 rounded-full border border-stone-400 mt-1" />
              </div>

              {/* Right Wing */}
              <div className="w-[210px] h-full flex flex-col justify-between pl-2 border-l border-dashed border-stone-300">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-900">
                      {activeTag.metalPurity}
                    </span>
                    <div className="text-[9px] font-mono font-semibold text-neutral-800 space-x-1 mt-0.5">
                      <span>Gr: {activeTag.grossWeightGrams.toFixed(3)}g</span>
                      <span>•</span>
                      <span>Nt: {activeTag.netWeightGrams.toFixed(3)}g</span>
                    </div>
                  </div>

                  {/* Scannable 2D Tag QR Matrix */}
                  <div className="shrink-0">
                    <QrCodeRenderer
                      value={`JEWELCORE:${activeTag.serialNumber}:${activeTag.metalPurity.replace(/\s+/g, "")}:${activeTag.grossWeightGrams}g:${activeTag.hallmarkId || "HUID-PENDING"}`}
                      size={36}
                      margin={0}
                      errorCorrectionLevel="M"
                      className="border border-neutral-300 rounded shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  {activeTag.diamondCarat && activeTag.diamondCarat > 0 ? (
                    <p className="text-[9px] font-bold text-neutral-800">
                      Dia: {activeTag.diamondCarat.toFixed(2)}ct ({activeTag.diamondSpecs || "VVS-EF"})
                    </p>
                  ) : (
                    <p className="text-[8px] font-medium text-neutral-500">
                      100% Fine Certified Bullion
                    </p>
                  )}
                  {activeTag.hallmarkId && (
                    <p className="text-[8px] font-mono text-neutral-600">
                      HUID: <span className="font-bold">{activeTag.hallmarkId}</span>
                    </p>
                  )}
                  {activeTag.retailPriceInr && (
                    <p className="text-[10px] font-black font-mono text-amber-950 mt-0.5">
                      MRP: ₹{activeTag.retailPriceInr.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center space-x-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-status-emerald" /> Dual-Sided Thermal Adhesive
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-gold" /> Anti-Counterfeit DataMatrix
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> BIS 916/750 Certified
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadZpl}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-gold" />
              Download Zebra .ZPL Stream
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrintSheet}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              Print Label Sheet (Browser)
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
