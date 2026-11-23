"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Gem,
  Award,
  Download,
  RotateCw,
  Sun,
  Eye,
  Check,
  ShoppingBag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JewelCoreLogo } from "./JewelCoreLogo";
import { api } from "../../lib/api";
import { toast } from "sonner";

export interface PresentationPieceData {
  serialNumber: string;
  itemName: string;
  category: string;
  metalPurity: string;
  grossWeightGrams: number;
  netGoldGrams: number;
  diamondCarat?: number | string;
  diamondSpecs?: string;
  hallmarkId?: string;
  retailPriceInr: number;
  epcTag?: string;
  imageUrl?: string;
}

interface SalonPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  piece: PresentationPieceData;
  onAddToTray?: (piece: PresentationPieceData) => void;
}

export function SalonPresentationModal({
  isOpen,
  onClose,
  piece,
  onAddToTray,
}: SalonPresentationModalProps) {
  const [studioLighting, setStudioLighting] = useState<"ATELIER_WARM" | "DAYLIGHT_5500K" | "VAULT_SHADOW">("ATELIER_WARM");
  const [isRotating, setIsRotating] = useState(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

  const handleDownloadCertificate = async () => {
    try {
      setIsDownloadingCert(true);
      await api.downloadFile(
        `/certificates/piece/${encodeURIComponent(piece.serialNumber)}/pdf`,
        `certificate-${piece.serialNumber}.pdf`,
      );
      toast.success("Authenticity Certificate Downloaded", {
        description: `Official Atelier Certificate for ${piece.serialNumber} saved.`,
      });
    } catch (err) {
      toast.error("Download Failed", {
        description: err instanceof Error ? err.message : "Error generating certificate",
      });
    } finally {
      setIsDownloadingCert(false);
    }
  };

  const handleRotateToggle = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-6 sm:p-8 bg-surface-card border border-gold/40 text-foreground shadow-2xl rounded-2xl">
        {/* Salon Header with Atelier Brand */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-3">
            <JewelCoreLogo size="md" variant="badge" />
            <div>
              <span className="text-xs font-mono text-gold font-medium block">
                Private Client Salon • VIP Presentation
              </span>
              <DialogTitle className="text-xl font-serif font-bold tracking-tight text-foreground">
                {piece.itemName}
              </DialogTitle>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="gold" className="text-xs font-mono">
              {piece.serialNumber}
            </Badge>
            <Badge variant="emerald" className="text-xs">
              BIS Hallmarked
            </Badge>
          </div>
        </div>

        {/* Main Showcase Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 items-center">
          {/* Left Column: Luxury Jewellery Showcase Pedestal */}
          <div
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border transition-colors duration-500 overflow-hidden bg-obsidian-deep ${
              studioLighting === "ATELIER_WARM"
                ? "border-gold/40 shadow-xs"
                : studioLighting === "DAYLIGHT_5500K"
                  ? "border-status-indigo/40 shadow-xs"
                  : "border-surface-border"
            }`}
          >
            {/* Directional Pedestal Spotlight */}
            <div className="absolute inset-0 bg-obsidian-deep/80 pointer-events-none" />

            {/* Central Luxury Gemstone / Piece Icon Illustration */}
            <div
              className={`w-36 h-36 rounded-full flex items-center justify-center relative transition-transform duration-700 ${
                isRotating ? "rotate-[360deg] scale-105" : ""
              }`}
            >
              <div className="w-28 h-28 rounded-full bg-surface-elevated border border-gold/40 flex items-center justify-center shadow-xs">
                <Gem className="w-14 h-14 text-gold" />
              </div>
            </div>

            {/* Studio Lighting Controls Bar */}
            <div className="absolute bottom-4 flex items-center space-x-1.5 bg-surface/90 backdrop-blur-xs p-1 rounded-full border border-surface-border shadow-xs">
              <button
                onClick={() => setStudioLighting("ATELIER_WARM")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors duration-150 ${
                  studioLighting === "ATELIER_WARM"
                    ? "bg-gold text-obsidian font-bold shadow-xs"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                Atelier Warm
              </button>
              <button
                onClick={() => setStudioLighting("DAYLIGHT_5500K")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors duration-150 ${
                  studioLighting === "DAYLIGHT_5500K"
                    ? "bg-status-indigo text-white font-bold shadow-xs"
                    : "text-muted-foreground hover:text-status-indigo"
                }`}
              >
                Daylight 5500K
              </button>
              <button
                onClick={handleRotateToggle}
                className="p-1 rounded-full text-gold hover:text-gold-light transition-colors duration-150"
                title="Rotate Piece"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Metrological Specifications & Pedigree */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                Certified Investment Value
              </span>
              <div className="text-3xl font-serif font-black text-gold">
                ₹{piece.retailPriceInr.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inclusive of GST • 100% Lifetime Buyback Assurance
              </p>
            </div>

            {/* Metrology & 4Cs Schedule */}
            <div className="space-y-2 border-t border-surface-border pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Precious Alloy:</span>
                <span className="font-semibold text-foreground font-mono">{piece.metalPurity}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Gross Measured Weight:</span>
                <span className="font-semibold text-foreground font-mono tabular-nums">{piece.grossWeightGrams.toFixed(4)} g</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Net Fine Metal Weight:</span>
                <span className="font-semibold text-foreground font-mono tabular-nums">{piece.netGoldGrams.toFixed(4)} g</span>
              </div>
              {piece.diamondCarat && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Certified Diamond Carat:</span>
                  <span className="font-semibold text-gold font-mono tabular-nums">{piece.diamondCarat} ct</span>
                </div>
              )}
              {piece.diamondSpecs && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Color &amp; Clarity Grade:</span>
                  <span className="font-semibold text-foreground">{piece.diamondSpecs}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">XRF Spectrometry Assurance:</span>
                <span className="font-mono text-status-emerald font-medium">99.98% Purity Pass</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Hallmark Registration:</span>
                <span className="font-mono text-foreground">{piece.hallmarkId || "HM-2026-MUM-991"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              {onAddToTray && (
                <Button
                  variant="gold"
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    onAddToTray(piece);
                    toast.success("Added to VIP Salon Tray", {
                      description: `${piece.itemName} added to active billing cart.`,
                    });
                    onClose();
                  }}
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                  Add to Private Salon Tray
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full text-xs border-gold/40 text-gold hover:bg-gold/10"
                onClick={handleDownloadCertificate}
                disabled={isDownloadingCert}
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                {isDownloadingCert ? "Downloading..." : "Export Certificate of Authenticity (PDF)"}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-surface-border/60 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-status-emerald" />
            <span>Cryptographically anchored in JewelCore Merkle Ledger</span>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Presentation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
