"use client";

import React, { useState } from "react";
import { InventoryPieceData } from "./PieceCard";
import {
  Gem,
  Scale,
  ShieldCheck,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRightLeft,
  ShoppingBag,
  Clock,
  Radio,
  X,
  RefreshCw,
} from "lucide-react";

interface PieceLineageInspectorProps {
  piece: InventoryPieceData | null;
  parentCategoryName?: string;
  onClose?: () => void;
  onCheckoutClick?: (piece: InventoryPieceData) => void;
  onTransferClick?: (piece: InventoryPieceData) => void;
}

export function PieceLineageInspector({
  piece,
  parentCategoryName = "High-Jewellery Solitaire Rings",
  onClose,
  onCheckoutClick,
  onTransferClick,
}: PieceLineageInspectorProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [soldSuccess, setSoldSuccess] = useState(false);

  if (!piece) {
    return (
      <div className="h-full bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-platinum/50 shadow-sm">
        <Gem className="w-12 h-12 text-platinum/30 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-medium text-slate-200">No Piece Selected</h4>
        <p className="text-xs text-platinum/60 mt-1 max-w-[260px]">
          Select any serialized jewellery piece from the category matrix to view its 4-dimensional state machine, GIA diamond specs, and cryptographic lineage ledger.
        </p>
      </div>
    );
  }

  const {
    serialNumber,
    itemName,
    metalPurity,
    grossWeightGrams,
    netGoldGrams,
    diamondCarat,
    diamondClarity,
    diamondColor,
    giaCertNumber,
    custodyState,
    qualityState,
    approvalState,
    commercialState,
    priceInr,
    currentLocation,
    epcRfidTag,
    provenance,
  } = piece;

  const handleSellClick = () => {
    setSoldSuccess(true);
    onCheckoutClick?.(piece);
    setTimeout(() => setSoldSuccess(false), 3500);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Inspector Header */}
      <div className="p-5 bg-surface-elevated/70 border-b border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
              <h3 className="text-base font-bold text-slate-100 font-mono">
                Piece {serialNumber}
              </h3>
            </div>
            <p className="text-xs text-platinum/70 mt-1">
              {itemName} • {metalPurity}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-platinum/60 hover:text-slate-100 hover:bg-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Hallmarked Approved
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-gold/10 text-gold-light border border-gold/30">
            <Radio className="w-3 h-3" />
            RFID Tag Sealed #{epcRfidTag}
          </span>
        </div>
      </div>

      {/* 4-Dimensional State Quadrant */}
      <div className="p-4 border-b border-surface-border bg-obsidian-deep/40 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium">
          4-Dimensional State Machine Matrix
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <div className="text-platinum/60 text-[9px]">Custody State:</div>
            <div className="font-bold text-cyan-400 mt-0.5 text-[11px] truncate">
              {custodyState}
            </div>
            <div className="text-[9px] text-platinum/50 truncate mt-0.5">
              {currentLocation}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <div className="text-platinum/60 text-[9px]">Quality State:</div>
            <div className="font-bold text-emerald-400 mt-0.5 text-[11px]">
              {qualityState}
            </div>
            <div className="text-[9px] text-platinum/50 mt-0.5">
              BIS 18K 750 Stamp
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <div className="text-platinum/60 text-[9px]">Approval State:</div>
            <div className="font-bold text-slate-100 mt-0.5 text-[11px]">
              {approvalState}
            </div>
            <div className="text-[9px] text-platinum/50 mt-0.5">
              Dual-Custody Sign-Off
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <div className="text-platinum/60 text-[9px]">Commercial State:</div>
            <div className="font-bold text-gold-light mt-0.5 text-[11px]">
              {commercialState}
            </div>
            <div className="text-[9px] text-platinum/50 mt-0.5">
              ₹{priceInr.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Metrological & Gemological Specs */}
      <div className="p-4 border-b border-surface-border space-y-3">
        {/* Metric 1: Weight Specs */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-platinum/70 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-platinum/50" />
              Weight Breakdown:
            </span>
            <span className="font-mono text-slate-100 tabular-nums">
              <strong className="text-gold-light font-semibold">
                {grossWeightGrams.toFixed(3)} g
              </strong>{" "}
              Gross
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-platinum/60 mt-1">
            <span>Net Fine Gold: {netGoldGrams.toFixed(3)} g</span>
            <span>Stone: {diamondCarat ? `${diamondCarat} ct` : "None"}</span>
          </div>
        </div>

        {/* Metric 2: Diamond Gemology */}
        {diamondCarat && (
          <div className="pt-2 border-t border-surface-border/50">
            <div className="flex justify-between items-center text-xs">
              <span className="text-platinum/70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-platinum/50" />
                GIA Solitaire Certification:
              </span>
              <span className="font-mono text-cyan-400 font-semibold">
                {diamondCarat} ct / {diamondClarity} / {diamondColor}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-platinum/60 mt-1">
              <span>Cert #{giaCertNumber || "GIA-22891"}</span>
              <span className="text-emerald-400">Triple Excellent Cut</span>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic Lineage Audit Timeline */}
      <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-platinum/70 font-medium flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-platinum/50" />
          Cryptographic Lineage Ledger
        </div>

        <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-surface-border">
          {provenance.map((step, idx) => (
            <div key={idx} className="relative text-xs font-mono">
              <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-gold ring-4 ring-obsidian" />
              <div className="flex items-center justify-between text-platinum/80">
                <span className="font-semibold text-slate-200">{step.stage}</span>
                <span className="text-[10px] text-platinum/50">{step.timestamp}</span>
              </div>
              <div className="text-[11px] text-platinum/60 mt-0.5">{step.detail}</div>
              <div className="text-[10px] text-gold/80">{step.actor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Deck Toolbar */}
      <div className="p-4 bg-surface-elevated/70 border-t border-surface-border space-y-2.5">
        {soldSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Piece dispatched to POS Checkout! Invoicing locked.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTransferClick?.(piece)}
            className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Initiate Transfer</span>
          </button>

          <button
            onClick={() => alert(`Printing replacement EPC RFID Tag for ${serialNumber}`)}
            className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-platinum/60" />
            <span>Print RFID Tag</span>
          </button>
        </div>

        <button
          onClick={handleSellClick}
          className="w-full px-4 py-2.5 rounded-lg bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Showroom POS Checkout / Sell Piece (₹{priceInr.toLocaleString("en-IN")})</span>
        </button>
      </div>
    </div>
  );
}
