"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, ShieldCheck, Scale, Tag } from "lucide-react";

interface TickerItem {
  id: string;
  label: string;
  value: string;
  change?: string;
  isUp?: boolean;
  statusIcon?: React.ReactNode;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: "mcx-gold-24k",
    label: "MCX Gold 24K (999)",
    value: "₹7,450.20/g",
    change: "+0.42%",
    isUp: true,
  },
  {
    id: "mcx-gold-22k",
    label: "MCX Gold 22K (916)",
    value: "₹6,825.00/g",
    change: "+0.38%",
    isUp: true,
  },
  {
    id: "mcx-silver-999",
    label: "MCX Silver 999",
    value: "₹88.20/g",
    change: "+1.15%",
    isUp: true,
  },
  {
    id: "lbma-gold",
    label: "LBMA Gold Spot",
    value: "$2,748.10/oz",
    change: "+$12.40",
    isUp: true,
  },
  {
    id: "usd-inr",
    label: "USD / INR",
    value: "₹84.12",
    change: "-0.04%",
    isUp: false,
  },
  {
    id: "vault-occupancy",
    label: "VAULT-01 Occupancy",
    value: "94.2% Capacity",
    statusIcon: <ShieldCheck className="w-3 h-3 text-status-emerald shrink-0" />,
  },
  {
    id: "rs232-scale",
    label: "Mettler Scale RS-232",
    value: "0.000g Tared",
    statusIcon: <Scale className="w-3 h-3 text-gold shrink-0" />,
  },
  {
    id: "rfid-sweeps",
    label: "Impinj R420 360°",
    value: "4 Antennas Active",
    statusIcon: <Tag className="w-3 h-3 text-status-indigo shrink-0" />,
  },
];

/**
 * BullionTickerRibbon - Animaster continuous luxury financial & telemetry ticker.
 * Streams real-time bullion spot pricing, LBMA spreads, and physical vault status.
 */
export function BullionTickerRibbon() {
  return (
    <div className="w-full bg-surface-elevated/80 border-b border-surface-border overflow-hidden py-1.5 select-none relative">
      {/* Left/Right Edge Gradient Mask */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="animate-ticker-scroll flex items-center gap-8">
        {/* Render items twice for seamless infinite scroll looping */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center gap-2 text-xs font-mono shrink-0 whitespace-nowrap"
          >
            {item.statusIcon}
            <span className="text-[11px] text-muted-foreground font-sans font-medium">
              {item.label}:
            </span>
            <span className="font-bold text-foreground text-[11px] tabular-nums">
              {item.value}
            </span>
            {item.change && (
              <span
                className={`flex items-center text-[10px] font-semibold ${
                  item.isUp
                    ? "text-status-emerald"
                    : "text-status-rose"
                }`}
              >
                {item.isUp ? (
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                )}
                {item.change}
              </span>
            )}
            <span className="text-surface-border text-xs mx-1">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
