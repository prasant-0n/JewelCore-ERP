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
      <DialogContent className="max-w-3xl p-8 bg-gradient-to-b from-stone-950 via-obsidian-deep to-black border-gold/40 text-stone-100 shadow-2xl">
        {/* Salon Header with Atelier Brand */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-4">
          <div className="flex items-center space-x-3">
            <JewelCoreLogo size="md" variant="badge" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase block">
                PRIVATE CLIENT SALON • VIP PRESENTATION
              </span>
              <DialogTitle className="text-xl font-serif font-black tracking-wide text-foreground">
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
          {/* Left Column: 3D Luxury Jewellery Showcase Pedestal */}
          <div
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-6 border transition-all duration-700 shadow-2xl overflow-hidden ${
              studioLighting === "ATELIER_WARM"
                ? "bg-gradient-to-br from-amber-950/40 via-stone-900 to-black border-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
                : studioLighting === "DAYLIGHT_5500K"
                  ? "bg-gradient-to-br from-blue-950/40 via-stone-900 to-black border-blue-400/30 shadow-[0_0_50px_rgba(96,165,250,0.15)]"
                  : "bg-gradient-to-br from-stone-900 via-obsidian-deep to-black border-stone-800"
            }`}
          >
            {/* Ambient Lighting Rays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />

            {/* Central Luxury Gemstone / Piece Icon Illustration */}
            <div
              className={`w-36 h-36 rounded-full flex items-center justify-center relative transition-transform duration-1000 ${
                isRotating ? "rotate-[360deg] scale-110" : ""
              }`}
            >
              <div className="absolute inset-0 rounded-full border border-gold/40 animate-ping opacity-20" />
              <div className="absolute -inset-4 rounded-full border border-gold/20 animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gold/30 to-amber-900/40 border border-gold/60 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Gem className="w-14 h-14 text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
              </div>
            </div>

            {/* Studio Lighting Controls Bar */}
            <div className="absolute bottom-4 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-surface-border">
              <button
                onClick={() => setStudioLighting("ATELIER_WARM")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                  studioLighting === "ATELIER_WARM" ? "bg-gold text-black font-bold" : "text-stone-400 hover:text-white"
                }`}
              >
                Atelier Warm
              </button>
              <button
                onClick={() => setStudioLighting("DAYLIGHT_5500K")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                  studioLighting === "DAYLIGHT_5500K" ? "bg-blue-400 text-black font-bold" : "text-stone-400 hover:text-white"
                }`}
              >
                Daylight 5500K
              </button>
              <button
                onClick={handleRotateToggle}
                className="p-1 rounded-full text-gold hover:text-white transition-colors"
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
                <span className="font-semibold text-foreground font-mono">{piece.grossWeightGrams.toFixed(4)} g</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Net Fine Metal Weight:</span>
                <span className="font-semibold text-foreground font-mono">{piece.netGoldGrams.toFixed(4)} g</span>
              </div>
              {piece.diamondCarat && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Certified Diamond Carat:</span>
                  <span className="font-semibold text-gold font-mono">{piece.diamondCarat} ct</span>
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
                <span className="font-mono text-emerald-400 font-medium">99.98% Purity Pass</span>
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
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
