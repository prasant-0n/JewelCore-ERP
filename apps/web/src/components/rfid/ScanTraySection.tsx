"use client";

import React, { useState } from "react";
import { RfidTagCard, RfidPieceData } from "./RfidTagCard";
import {
  ChevronDown,
  ChevronRight,
  Radio,
  Scale,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export interface ScanTrayData {
  id: string;
  trayNumber: string;
  trayName: string;
  location: string;
  expectedCount: number;
  detectedCount: number;
  totalWeightGrams: number;
  status: "SYNCHRONIZED" | "DISCREPANCY" | "SEALED" | "RESTRICTED";
  pieces: RfidPieceData[];
}

interface ScanTraySectionProps {
  tray: ScanTrayData;
  selectedTagId?: string;
  onSelectPiece?: (piece: RfidPieceData, tray: ScanTrayData) => void;
  defaultExpanded?: boolean;
}

export function ScanTraySection({
  tray,
  selectedTagId,
  onSelectPiece,
  defaultExpanded = false,
}: ScanTraySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const hasDiscrepancy = tray.expectedCount !== tray.detectedCount;

  return (
    <div
      className={`border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all ${
        hasDiscrepancy ? "border-rose-500/40" : "border-surface-border"
      }`}
    >
      {/* Tray Header Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
          hasDiscrepancy
            ? "bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/30"
            : "bg-surface-elevated/70 hover:bg-surface-elevated border-surface-border"
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className={hasDiscrepancy ? "text-rose-400" : "text-gold"}>
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                {tray.trayName}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-platinum/80 text-[9px] font-mono uppercase font-semibold">
                {tray.location}
              </span>
            </div>

            <div className="text-xs text-platinum/70 flex items-center space-x-2 mt-0.5 font-mono">
              <span
                className={`font-semibold ${
                  hasDiscrepancy ? "text-rose-400" : "text-slate-100"
                }`}
              >
                {tray.detectedCount} / {tray.expectedCount} Detected
              </span>
              <span>•</span>
              <span className="text-slate-100 font-bold tabular-nums">
                {tray.totalWeightGrams.toFixed(3)} g Load Cell
              </span>
              <span>•</span>
              <span
                className={`flex items-center gap-1 ${
                  hasDiscrepancy ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasDiscrepancy
                      ? "bg-rose-400 animate-ping"
                      : "bg-emerald-400 animate-pulse"
                  }`}
                />
                {hasDiscrepancy ? "Discrepancy Flagged" : "Live Mesh Synced"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              hasDiscrepancy
                ? "bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {hasDiscrepancy
              ? `${tray.expectedCount - tray.detectedCount} Missing Piece`
              : "100% Match"}
          </span>
        </div>
      </div>

      {/* Expanded Piece Matrix */}
      {isOpen && (
        <div className="p-5 bg-obsidian-deep/50">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-platinum/70 uppercase text-[10px] tracking-wider font-medium">
              Array Sensors Active ({tray.pieces.length} Tagged Items)
            </span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Multiplexing 48 Sw/sec
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tray.pieces.map((piece) => (
              <RfidTagCard
                key={piece.id}
                item={piece}
                isSelected={selectedTagId === piece.id}
                onSelect={(p) => onSelectPiece?.(p, tray)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
