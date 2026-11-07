"use client";

import React from "react";
import {
  ShoppingBag,
  Gem,
  Scale,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from "lucide-react";

export interface PosPieceData {
  id: string;
  serialNumber: string;
  itemName: string;
  category: string;
  metalPurity: string;
  grossWeightGrams: number;
  netGoldGrams: number;
  diamondCarat?: number;
  diamondSpecs?: string;
  metalValueInr: number;
  diamondValueInr: number;
  makingChargeInr: number;
  totalPriceInr: number;
  status: "IN_CART" | "SAVED_FOR_TRIAL" | "AVAILABLE" | "SOLD";
  epcTag: string;
  hallmarkId: string;
}

interface PosPieceCardProps {
  piece: PosPieceData;
  isSelected?: boolean;
  onSelect?: (piece: PosPieceData) => void;
  onToggleCart?: (piece: PosPieceData) => void;
  onSalonView?: (piece: PosPieceData) => void;
}

export function PosPieceCard({
  piece,
  isSelected = false,
  onSelect,
  onToggleCart,
  onSalonView,
}: PosPieceCardProps) {
  const isInCart = piece.status === "IN_CART";
  const isSaved = piece.status === "SAVED_FOR_TRIAL";

  return (
    <div
      onClick={() => onSelect?.(piece)}
      className={`relative rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
        isSelected
          ? "bg-surface-elevated border-2 border-gold shadow-[0_0_18px_rgba(212,175,55,0.22)]"
          : "bg-surface-card border border-surface-border hover:border-gold/50 hover:bg-surface-elevated/60"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-gold text-obsidian text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
          Selected
        </div>
      )}

      {/* Top Header: Serial & Status Badge */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <ShoppingBag
              className={`w-3.5 h-3.5 ${
                isSelected ? "text-gold" : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors ${
                isSelected
                  ? "text-gold"
                  : "text-foreground group-hover:text-gold"
              }`}
            >
              {piece.serialNumber}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[190px] mt-0.5">
            {piece.itemName}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
            Hallmark: {piece.hallmarkId}
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isInCart
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
              : isSaved
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                : "bg-surface-elevated text-muted-foreground border border-surface-border"
          }`}
        >
          {isInCart ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>IN CART</span>
            </>
          ) : isSaved ? (
            <>
              <Bookmark className="w-2.5 h-2.5" />
              <span>TRIAL</span>
            </>
          ) : (
            <span>AVAILABLE</span>
          )}
        </span>
      </div>

      {/* Middle Specs Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[9px] block uppercase">
            Weight / Alloy
          </span>
          <span className="text-foreground font-semibold tabular-nums">
            {piece.grossWeightGrams.toFixed(3)}g Gross
          </span>
          <span className="text-muted-foreground text-[10px] ml-1">
            ({piece.metalPurity.split(" ")[0]})
          </span>
        </div>

        <div className="text-right">
          <span className="text-muted-foreground text-[9px] block uppercase">
            Certified Gem
          </span>
          {piece.diamondCarat ? (
            <span className="text-gold font-semibold tabular-nums">
              {piece.diamondCarat.toFixed(2)} ct {piece.diamondSpecs || "VVS"}
            </span>
          ) : (
            <span className="text-muted-foreground">Plain Bullion</span>
          )}
        </div>
      </div>

      {/* Footer: Price & Cart Action */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[9px] block uppercase">
            Retail Value:
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs tabular-nums">
            ₹ {piece.totalPriceInr.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {onSalonView && (
            <button
              type="button"
              title="Open VIP Salon Presentation View"
              onClick={(e) => {
                e.stopPropagation();
                onSalonView(piece);
              }}
              className="px-2 py-1 rounded text-[10px] font-medium bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Salon</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCart?.(piece);
            }}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              isInCart
                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                : "bg-gold hover:bg-gold-light text-obsidian font-semibold shadow-sm"
            }`}
          >
            {isInCart ? "Remove" : "+ Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
