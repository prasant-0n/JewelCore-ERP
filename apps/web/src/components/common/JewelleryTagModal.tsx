"use client";

import React, { useState } from "react";
import {
  Tag,
  Printer,
  Download,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Maximize2,
  Copy,
  Check,
  Eye,
  Layers,
  ZoomIn,
  X,
} from "lucide-react";
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

export type TagPreset = "STANDARD_50x12" | "FLAGSHIP_68x16" | "RAT_TAIL_45x20";

export function JewelleryTagModal({
  isOpen,
  onClose,
  tags,
}: JewelleryTagModalProps) {
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const [tagPreset, setTagPreset] = useState<TagPreset>("STANDARD_50x12");
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

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

  // Industry Standard QR Code Dimensions (in on-screen preview scale)
  // Standard 50x12mm: 78px (~10mm equivalent physical print)
  // Flagship 68x16mm: 88px (~12mm equivalent physical print)
  // Rat-tail 45x20mm: 94px (~14mm equivalent physical print)
  const qrSize =
    tagPreset === "FLAGSHIP_68x16"
      ? 88
      : tagPreset === "RAT_TAIL_45x20"
      ? 94
      : 78;

  const tagQrPayload = `JEWELCORE:${activeTag.serialNumber}:${activeTag.metalPurity.replace(/\s+/g, "")}:GW=${activeTag.grossWeightGrams.toFixed(3)}g:NW=${activeTag.netWeightGrams.toFixed(3)}g:HUID=${activeTag.hallmarkId || "PENDING"}:MRP=${activeTag.retailPriceInr || 0}`;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(tagQrPayload);
    setCopiedPayload(true);
    toast.success("Tag QR Payload Copied", { description: tagQrPayload });
    setTimeout(() => setCopiedPayload(false), 2000);
  };

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
    toast.success("ZPL Tag Stream Exported", {
      description: "Direct Zebra/Citizen 203 DPI thermal label payload ready.",
    });
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-surface border-surface-border text-foreground">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-xs">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Jewellery RFID / Barcode Tag Printing Station</span>
                  <Badge variant="gold" className="text-[10px] uppercase font-mono">
                    GS1 &amp; ISO 18004
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  High-Density Micro Dumbbell &amp; Butterfly Labels • BIS Statutory HUID &amp; Code-128 Symbology
                </DialogDescription>
              </div>
            </div>

            {/* Tag Format Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-surface-elevated p-1 rounded-lg border border-surface-border text-xs">
              <button
                type="button"
                onClick={() => setTagPreset("STANDARD_50x12")}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  tagPreset === "STANDARD_50x12"
                    ? "bg-gold text-obsidian font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                50×12mm Dumbbell
              </button>
              <button
                type="button"
                onClick={() => setTagPreset("FLAGSHIP_68x16")}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  tagPreset === "FLAGSHIP_68x16"
                    ? "bg-gold text-obsidian font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                68×16mm Butterfly
              </button>
              <button
                type="button"
                onClick={() => setTagPreset("RAT_TAIL_45x20")}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  tagPreset === "RAT_TAIL_45x20"
                    ? "bg-gold text-obsidian font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                45×20mm Ring Wrap
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Tag Selector if multiple tags in batch */}
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
        <div className="bg-obsidian-deep p-6 sm:p-8 rounded-xl border border-surface-border flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
              <span className="text-[11px] font-mono text-neutral-300 font-medium">
                {tagPreset === "FLAGSHIP_68x16"
                  ? "Tag Dimension: 68mm × 16mm Flagship Boutique Butterfly (Cartier / Bvlgari Standard)"
                  : tagPreset === "RAT_TAIL_45x20"
                  ? "Tag Dimension: 45mm × 20mm Ring Shank Wrap (High-Density Rat-Tail Tag)"
                  : "Tag Dimension: 50mm × 12mm Standard Butterfly"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-gold/40 text-gold">
                QR: {qrSize}px (10–12mm Matrix)
              </Badge>
              <Badge variant="gold" className="text-[10px] font-mono">
                203 / 300 DPI High-Precision
              </Badge>
            </div>
          </div>

          {/* Dumbbell / Butterfly Tag Realistic Vector Rendering */}
          <div className="my-2 max-w-full overflow-x-auto p-2">
            <div
              className={`bg-white text-black font-sans rounded-lg shadow-2xl p-3 flex items-center justify-between border-2 border-stone-300 relative select-none transition-all duration-200 ${
                tagPreset === "FLAGSHIP_68x16"
                  ? "w-[660px] h-[170px]"
                  : tagPreset === "RAT_TAIL_45x20"
                  ? "w-[620px] h-[180px]"
                  : "w-[600px] h-[160px]"
              }`}
            >
              {/* Left Wing (Linear Barcode, SKU, Brand) */}
              <div className="w-[45%] h-full flex flex-col justify-between pr-3 border-r-2 border-dashed border-stone-300">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider uppercase text-amber-950 font-serif">
                      JEWELCORE ATELIER
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-amber-100 text-amber-950 px-1 py-0.5 rounded border border-amber-300">
                      BIS 100%
                    </span>
                  </div>
                  <p className="text-xs font-black font-mono tracking-tight text-neutral-950 mt-0.5">
                    {activeTag.serialNumber}
                  </p>
                  <p className="text-[9px] text-neutral-600 truncate max-w-[220px] mt-0.5">
                    {activeTag.itemName}
                  </p>
                </div>

                {/* Industrial Code-128 Linear Barcode with Quiet Zones */}
                <div className="my-1">
                  <div className="h-7 w-full flex items-center justify-center overflow-hidden bg-white">
                    <BarcodeRenderer
                      value={activeTag.serialNumber || activeTag.skuCode}
                      height={26}
                      width={1.2}
                      margin={1}
                      displayValue={false}
                      className="max-h-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-neutral-600 mt-0.5">
                    <span className="font-bold text-neutral-800">{activeTag.skuCode}</span>
                    <span className="bg-neutral-100 text-neutral-700 px-1 rounded font-semibold text-[8px]">
                      {activeTag.epcTag ? "RFID+BARCODE" : "GS1 CODE-128"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Narrow Bridge / Ring String Channel */}
              <div className="w-[8%] flex flex-col items-center justify-center text-stone-400 shrink-0">
                <div className="w-2 h-2 rounded-full border-2 border-stone-400 mb-1 bg-stone-100" />
                <span className="text-[7px] font-mono uppercase tracking-widest rotate-90 whitespace-nowrap text-stone-500 font-bold">
                  BRIDGE
                </span>
                <div className="w-2 h-2 rounded-full border-2 border-stone-400 mt-1 bg-stone-100" />
              </div>

              {/* Right Wing (Prominent Industry Standard QR Matrix + Metrology) */}
              <div className="w-[47%] h-full flex items-center justify-between pl-3 border-l-2 border-dashed border-stone-300 gap-2">
                {/* Metrology & Specification Details */}
                <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-w-0">
                  <div>
                    <span className="text-xs font-black text-amber-950 leading-tight block">
                      {activeTag.metalPurity}
                    </span>
                    <div className="text-[9.5px] font-mono font-bold text-neutral-900 space-x-1 mt-0.5">
                      <span>Gr: {activeTag.grossWeightGrams.toFixed(3)}g</span>
                      <span>•</span>
                      <span>Nt: {activeTag.netWeightGrams.toFixed(3)}g</span>
                    </div>

                    {activeTag.diamondCarat && activeTag.diamondCarat > 0 ? (
                      <p className="text-[8.5px] font-bold text-neutral-800 truncate mt-0.5" title={activeTag.diamondSpecs}>
                        Dia: {activeTag.diamondCarat.toFixed(2)}ct ({activeTag.diamondSpecs?.split(" ")[0] || "VVS"})
                      </p>
                    ) : (
                      <p className="text-[8px] font-medium text-neutral-500 mt-0.5">
                        Fine Certified Bullion
                      </p>
                    )}
                  </div>

                  <div className="border-t border-neutral-200 pt-0.5">
                    {activeTag.hallmarkId && (
                      <p className="text-[8px] font-mono text-neutral-700">
                        HUID: <span className="font-extrabold text-neutral-950">{activeTag.hallmarkId}</span>
                      </p>
                    )}
                    {activeTag.retailPriceInr && (
                      <p className="text-[11px] font-black font-mono text-amber-950 leading-tight">
                        ₹{activeTag.retailPriceInr.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Prominent High-Contrast Industry Standard QR Code Matrix */}
                <div
                  onClick={() => setIsQrZoomOpen(true)}
                  className="shrink-0 flex flex-col items-center justify-center cursor-pointer group/qr p-1 rounded-lg border-2 border-neutral-300 hover:border-gold hover:shadow-md transition-all bg-white relative"
                  title="Click to open 240px HD Optical Test Scan Loupe"
                >
                  <QrCodeRenderer
                    value={tagQrPayload}
                    size={qrSize}
                    margin={1}
                    errorCorrectionLevel="H"
                    centerLogo="jewelcore"
                  />
                  <div className="flex items-center gap-0.5 text-[7px] font-mono font-bold uppercase tracking-wider text-neutral-600 mt-0.5 group-hover/qr:text-gold transition-colors">
                    <ZoomIn className="w-2.5 h-2.5" />
                    <span>BIS &amp; IRN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Technical Specs Footnote */}
          <div className="text-center text-[11px] text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-status-emerald" /> Dual-Sided Thermal Adhesive
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-gold" /> ISO/IEC 18004 Optical Standard (≥10mm Matrix)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> BIS IS 1417:2016 Certified
            </span>
          </div>
        </div>

        {/* QR Code HD Test-Scan Loupe Overlay (When clicked) */}
        {isQrZoomOpen && (
          <div className="p-5 rounded-xl bg-surface-elevated border-2 border-gold/40 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-gold" />
                  <span>HD Optical Test-Scan Loupe (240px ISO/IEC 18004 Standard)</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Point any smartphone camera, Honeywell Xenon, or Zebra 2D imager at the screen to verify instant decode.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsQrZoomOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
              <div className="p-2 bg-white rounded-xl shadow-lg border-2 border-gold/60 shrink-0">
                <QrCodeRenderer
                  value={tagQrPayload}
                  size={210}
                  margin={2}
                  errorCorrectionLevel="H"
                  centerLogo="jewelcore"
                  showToolbar={true}
                  caption="SCAN DIRECTLY OFF SCREEN"
                />
              </div>

              <div className="flex-1 space-y-3 text-xs font-mono w-full">
                <div className="p-3 rounded-lg bg-obsidian-deep border border-surface-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="font-bold text-foreground">{activeTag.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fineness &amp; Metal:</span>
                    <span className="text-gold font-bold">{activeTag.metalPurity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metrology Breakdown:</span>
                    <span className="text-foreground">Gross: {activeTag.grossWeightGrams.toFixed(3)}g • Net: {activeTag.netWeightGrams.toFixed(3)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statutory BIS HUID:</span>
                    <span className="text-emerald-400 font-bold">{activeTag.hallmarkId || "PENDING"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retail Valuation MRP:</span>
                    <span className="text-gold font-bold">₹{activeTag.retailPriceInr?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPayload}
                    className="flex-1 text-xs gap-1.5"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? "Copied" : "Copy Raw Decoded Payload"}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsQrZoomOpen(false)}
                    className="text-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadZpl}
              className="text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-gold" />
              Download Zebra .ZPL Stream
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrintSheet}
              className="text-xs gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              Print Label Sheet (Browser)
            </Button>
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={onClose}
            className="text-xs px-4"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
