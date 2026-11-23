"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface LaserHallmarkBadgeProps {
  huid?: string;
  purity?: string;
  isBisVerified?: boolean;
  className?: string;
  showSweepAnimation?: boolean;
}

/**
 * LaserHallmarkBadge - Animaster inspired statutory laser engraving badge.
 * Renders an authentic Bureau of Indian Standards (BIS) triangular emblem
 * alongside the 6-character alphanumeric HUID with micro-shimmer effects.
 */
export function LaserHallmarkBadge({
  huid = "JC8921",
  purity = "Au 750",
  isBisVerified = true,
  className,
  showSweepAnimation = true,
}: LaserHallmarkBadgeProps) {
  // Normalize 6-char HUID
  const cleanHuid = huid.replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase();

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono overflow-hidden select-none",
        "bg-surface-elevated/80 border border-gold/30 text-foreground",
        className,
      )}
      title={`BIS Hallmark Unique Identification (HUID): ${cleanHuid} • Purity: ${purity}`}
    >
      {/* Animaster Laser Sweep Light Highlight */}
      {showSweepAnimation && (
        <span
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gold/15 to-transparent pointer-events-none animate-laser-sweep"
          aria-hidden="true"
        />
      )}

      {/* BIS Triangular Hallmark Emblem */}
      <div className="flex items-center gap-1 shrink-0 text-gold">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 text-gold shrink-0"
          aria-label="BIS Triangular Hallmark"
        >
          <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
        </svg>
        <span className="font-bold text-[9px] text-gold tracking-tight">BIS</span>
      </div>

      <span className="text-muted-foreground/60 text-[9px]">|</span>

      {/* Alloy Purity Stamp */}
      <span className="text-[9px] font-semibold text-muted-foreground">
        {purity.includes("916")
          ? "22K 916"
          : purity.includes("750")
          ? "18K 750"
          : purity.includes("999")
          ? "24K 999"
          : "18K 750"}
      </span>

      <span className="text-muted-foreground/60 text-[9px]">|</span>

      {/* 6-Char Alphanumeric HUID Laser Engraving */}
      <span className="font-bold tracking-widest text-foreground text-[10px]">
        {cleanHuid}
      </span>

      {isBisVerified && (
        <ShieldCheck className="w-3 h-3 text-status-emerald ml-0.5 shrink-0" />
      )}
    </div>
  );
}
