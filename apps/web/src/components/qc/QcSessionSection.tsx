"use client";

import React, { useState } from "react";
import { QcItemCard, QcItemData } from "./QcItemCard";
import {
  ChevronDown,
  ChevronRight,
  FlaskConical,
  BadgeCheck,
  UserCheck,
} from "lucide-react";

export interface QcSessionData {
  id: string;
  sessionNumber: string;
  batchName: string;
  inspectorName: string;
  instrumentModel: string;
  itemsCount: number;
  status: "UNDER_INSPECTION" | "PASSED" | "QUARANTINED";
  isIsoCertified: boolean;
  items: QcItemData[];
}

interface QcSessionSectionProps {
  session: QcSessionData;
  selectedItemId?: string;
  onSelectItem?: (item: QcItemData, session: QcSessionData) => void;
  defaultExpanded?: boolean;
}

export function QcSessionSection({
  session,
  selectedItemId,
  onSelectItem,
  defaultExpanded = false,
}: QcSessionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden mb-4 shadow-sm transition-all">
      {/* Session Header Banner */}
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
                {session.sessionNumber}: {session.batchName}
              </span>
              {session.isIsoCertified && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-mono uppercase font-semibold">
                  ISO 17025 Certified
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5 font-mono">
              <span>{session.items.length} Fixture Items</span>
              <span>•</span>
              <span className="text-foreground font-medium">
                Lead: {session.inspectorName}
              </span>
              <span>•</span>
              <span className="text-gold flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                {session.instrumentModel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Pill */}
        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
              session.status === "UNDER_INSPECTION"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                : session.status === "PASSED"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30"
            }`}
          >
            {session.status === "UNDER_INSPECTION"
              ? "Under Inspection"
              : session.status === "PASSED"
                ? "Hallmark Cleared"
                : "Quarantined Hold"}
          </span>
        </div>
      </div>

      {/* Expanded Fixture Matrix */}
      {isOpen && (
        <div className="p-5 bg-surface-elevated/40">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              Items in QC Fixture Tray ({session.items.length} Loaded on
              Spectrometer Stage)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Thermo Niton XL5 Plus Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3.5">
            {session.items.map((item) => (
              <QcItemCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={(itm) => onSelectItem?.(itm, session)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
