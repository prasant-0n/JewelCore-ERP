"use client";

import React from "react";
import {
  ShoppingBag,
  Gem,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { TactileCard } from "@/components/luxury/TactileCard";
import { LaserHallmarkBadge } from "@/components/luxury/LaserHallmarkBadge";

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
    <TactileCard
      isSelected={isSelected}
      onClick={() => onSelect?.(piece)}
      className="p-3.5 flex flex-col justify-between"
    >
      {/* Top Header: Serial & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="flex items-center space-x-1.5 min-w-0">
            <ShoppingBag
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected ? "text-gold" : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold transition-colors truncate ${
                isSelected
                  ? "text-gold"
                  : "text-foreground group-hover:text-gold"
              }`}
              title={piece.serialNumber}
            >
              {piece.serialNumber}
            </span>
          </div>
          <div
            className="text-[11px] text-muted-foreground font-medium truncate mt-0.5"
            title={piece.itemName}
          >
            {piece.itemName}
          </div>
          <div className="mt-1">
            <LaserHallmarkBadge
              huid={piece.hallmarkId}
              purity={piece.metalPurity}
              isBisVerified={true}
            />
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 shrink-0 ${
            isInCart
              ? "bg-status-emerald/15 text-status-emerald border border-status-emerald/30"
              : isSaved
                ? "bg-status-amber/15 text-status-amber border border-status-amber/30"
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
      <div className="grid grid-cols-2 gap-2 my-2 py-1.5 border-y border-surface-border/60 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground text-[10px] block">
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
          <span className="text-muted-foreground text-[10px] block">
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
          <span className="text-muted-foreground text-[10px] block">
            Retail Value:
          </span>
          <span className="text-status-emerald font-bold text-xs tabular-nums">
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
              className="px-2 py-1 rounded text-[10px] font-medium bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 flex items-center gap-1 transition-colors duration-150 cursor-pointer"
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
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors duration-150 cursor-pointer ${
              isInCart
                ? "bg-status-rose/10 hover:bg-status-rose/20 text-status-rose border border-status-rose/30"
                : "bg-gold hover:bg-gold-light text-obsidian font-semibold border border-gold/40 shadow-xs"
            }`}
          >
            {isInCart ? "Remove" : "+ Add to Cart"}
          </button>
        </div>
      </div>
    </TactileCard>
  );
}
