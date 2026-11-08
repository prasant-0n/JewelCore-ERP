"use client";

import React, { useState } from "react";
import { PieceCard, InventoryPieceData } from "./PieceCard";
import { ChevronDown, ChevronRight, Gem, Sparkles } from "lucide-react";

export interface InventoryCategoryData {
  id: string;
  categoryName: string;
  vaultLocation: string;
  totalPieces: number;
  totalGrossWeightGrams: number;
  status: "LIVE_IN_STOCK" | "LOW_STOCK" | "TRANSIT_REBALANCING";
  pieces: InventoryPieceData[];
}

interface CategorySectionProps {
  category: InventoryCategoryData;
  selectedPieceId?: string;
  onSelectPiece?: (
    piece: InventoryPieceData,
    category: InventoryCategoryData,
  ) => void;
  defaultExpanded?: boolean;
}

export function CategorySection({
  category,
  selectedPieceId,
  onSelectPiece,
  defaultExpanded = false,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Category Header Banner */}
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
                {category.categoryName}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-gold text-[9px] font-mono uppercase font-semibold">
                {category.vaultLocation}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{category.pieces.length} Pieces Loaded</span>
              <span>•</span>
              <span className="text-foreground font-bold tabular-nums">
                {category.totalGrossWeightGrams.toFixed(3)} g Gross
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live In Stock
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Tag */}
        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            {category.totalPieces} Pieces Tracked
          </span>
        </div>
      </div>

      {/* Expanded Piece Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              Pieces in Active Allocation ({category.pieces.length} Units)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              RFID Auto-Mesh Tracked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5">
            {category.pieces.map((piece) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                isSelected={selectedPieceId === piece.id}
                onSelect={(p) => onSelectPiece?.(p, category)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
