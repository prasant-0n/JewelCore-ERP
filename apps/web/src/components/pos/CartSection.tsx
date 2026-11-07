"use client";

import React, { useState } from "react";
import { PosPieceCard, PosPieceData } from "./PosPieceCard";
import {
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Scale,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface PosSectionGroupData {
  id: string;
  sectionTitle: string;
  clientTag: string;
  description: string;
  status: "CART_SECURED" | "VITRINE_LIVE" | "TRADE_IN" | "CUSTOM_MTO";
  pieces: PosPieceData[];
}

interface CartSectionProps {
  group: PosSectionGroupData;
  selectedPieceId?: string;
  onSelectPiece?: (piece: PosPieceData, group: PosSectionGroupData) => void;
  onToggleCart?: (piece: PosPieceData) => void;
  defaultExpanded?: boolean;
}

export function CartSection({
  group,
  selectedPieceId,
  onSelectPiece,
  onToggleCart,
  defaultExpanded = false,
}: CartSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const totalValue = group.pieces.reduce(
    (acc, p) => acc + (p.totalPriceInr || 0),
    0
  );
  const totalGrossWeight = group.pieces.reduce(
    (acc, p) => acc + (p.grossWeightGrams || 0),
    0
  );

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Section Header Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-surface-elevated/70 hover:bg-surface-elevated border-b border-surface-border flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-gold">
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-foreground font-mono tracking-tight">
                {group.sectionTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                {group.clientTag}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{group.pieces.length} Items Listed</span>
              <span>•</span>
              <span className="text-foreground font-bold tabular-nums">
                {totalGrossWeight.toFixed(3)} g Gross
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums">
                ₹ {totalValue.toLocaleString("en-IN")}
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {group.status === "CART_SECURED" ? "Cart Secured" : "Live Vitrine"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            {group.pieces.length} Units Assigned
          </span>
        </div>
      </div>

      {/* Expanded Piece Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              Jewellery Units in Section ({group.pieces.length} Active Items)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              RFID EPC Near-Field Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {group.pieces.map((piece) => (
              <PosPieceCard
                key={piece.id}
                piece={piece}
                isSelected={selectedPieceId === piece.id}
                onSelect={(p) => onSelectPiece?.(p, group)}
                onToggleCart={onToggleCart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
