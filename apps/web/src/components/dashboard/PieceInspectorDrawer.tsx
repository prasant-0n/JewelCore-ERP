"use client";

import React from "react";
import { X, Gem, ShieldCheck, MapPin, Scale, Clock, Sparkles } from "lucide-react";

export interface PieceDetail {
  id: string;
  serialNumber: string;
  itemName: string;
  metalPurity: string;
  grossWeightGrams: number;
  currentCompartment: string;
  qualityState: string;
  approvalState: string;
  custodyState: string;
  commercialState: string;
  diamondCarat?: number;
  diamondClarity?: string;
  lastUpdated: string;
}

interface PieceInspectorDrawerProps {
  piece: PieceDetail | null;
  onClose: () => void;
}

export function PieceInspectorDrawer({ piece, onClose }: PieceInspectorDrawerProps) {
  if (!piece) return null;

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-surface-card border-l border-surface-border h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-platinum/70 uppercase tracking-wider block">
                  Serialized Asset Lineage
                </span>
                <h3 className="text-sm font-semibold text-slate-100">
                  {piece.serialNumber}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-surface-elevated text-platinum hover:text-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Item Name & Specs */}
          <div>
            <h4 className="text-base font-medium text-slate-100 leading-snug">
              {piece.itemName}
            </h4>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-xs font-mono text-gold font-medium">
                {piece.metalPurity}
              </span>
              {piece.diamondCarat && (
                <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-xs font-mono text-platinum">
                  {piece.diamondCarat} ct {piece.diamondClarity}
                </span>
              )}
            </div>
          </div>

          {/* 4-Dimension Audit State Matrix */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2.5">
            <span className="text-[10px] font-mono text-platinum uppercase tracking-wider block">
              Governance & State Matrix (INV-01)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-surface-card border border-surface-border/60">
                <span className="text-[10px] text-platinum/60 block">QUALITY</span>
                <span className="text-status-emerald font-semibold">{piece.qualityState}</span>
              </div>
              <div className="p-2 rounded bg-surface-card border border-surface-border/60">
                <span className="text-[10px] text-platinum/60 block">APPROVAL</span>
                <span className="text-status-emerald font-semibold">{piece.approvalState}</span>
              </div>
              <div className="p-2 rounded bg-surface-card border border-surface-border/60">
                <span className="text-[10px] text-platinum/60 block">CUSTODY</span>
                <span className="text-gold font-semibold">{piece.custodyState}</span>
              </div>
              <div className="p-2 rounded bg-surface-card border border-surface-border/60">
                <span className="text-[10px] text-platinum/60 block">COMMERCIAL</span>
                <span className="text-slate-100 font-semibold">{piece.commercialState}</span>
              </div>
            </div>
          </div>

          {/* Physical Metrology & Compartment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-surface-border text-xs">
              <div className="flex items-center space-x-2 text-platinum">
                <Scale className="w-4 h-4 text-gold" />
                <span>Gross Weight</span>
              </div>
              <span className="font-mono text-slate-100 font-semibold tabular-nums">
                {piece.grossWeightGrams.toFixed(4)} g
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-surface-border text-xs">
              <div className="flex items-center space-x-2 text-platinum">
                <MapPin className="w-4 h-4 text-status-emerald" />
                <span>Assigned Location</span>
              </div>
              <span className="font-mono text-slate-100 font-semibold">
                {piece.currentCompartment}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-surface-border text-xs">
              <div className="flex items-center space-x-2 text-platinum">
                <Clock className="w-4 h-4 text-platinum" />
                <span>Last Custody Transition</span>
              </div>
              <span className="font-mono text-platinum text-[11px]">
                {piece.lastUpdated}
              </span>
            </div>
          </div>

          {/* Security Hash Proof */}
          <div className="p-3 rounded-lg bg-obsidian border border-surface-border text-[10px] font-mono text-platinum/70 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-status-emerald flex-shrink-0" />
            <span className="truncate">
              Cryptographic Hash: 0x8f2d...41a9 (Audit Proof Verified)
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-surface-border flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs font-medium text-slate-200 transition-colors"
          >
            Close Inspector
          </button>
          <button
            onClick={() => {
              alert(`Initiated audit recount for ${piece.serialNumber}`);
              onClose();
            }}
            className="flex-1 h-9 rounded-md bg-gold hover:bg-gold-light text-xs font-semibold text-obsidian transition-colors shadow-sm"
          >
            Request Movement
          </button>
        </div>
      </div>
    </div>
  );
}
