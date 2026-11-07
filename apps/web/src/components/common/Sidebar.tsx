"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  FileCheck2,
  Gem,
  Tag,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  RotateCcw,
  Truck,
  ArrowRightLeft,
} from "lucide-react";

interface NavSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Control Tower", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "INVENTORY & ATELIER",
    items: [
      { name: "Vault & Storage", href: "/storage", icon: Boxes },
      { name: "Inward Intake", href: "/procurement", icon: ArrowRightLeft },
      { name: "Analytical QC", href: "/qc", icon: FileCheck2, badge: 3 },
      { name: "Piece Master", href: "/inventory", icon: Gem },
      { name: "RFID Kiosk", href: "/rfid", icon: Tag },
      { name: "Stock Gate", href: "/governance", icon: ShieldCheck, badge: 5 },
    ],
  },
  {
    title: "COMMERCIAL & SHOWROOM",
    items: [
      { name: "Bullion & Pricing", href: "/pricing", icon: TrendingUp },
      { name: "POS Cashier", href: "/pos", icon: CreditCard },
      { name: "Returns & Scrap Melt", href: "/returns", icon: RotateCcw },
    ],
  },
  {
    title: "LOGISTICS",
    items: [
      { name: "Store Transfers", href: "/transfers", icon: Truck, badge: 2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-obsidian border-r border-surface-border flex flex-col justify-between h-[calc(100vh-3.5rem)] flex-shrink-0">
      <div className="py-4 px-3 space-y-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-mono tracking-wider text-platinum/60 uppercase font-semibold">
              {section.title}
            </div>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-surface-card text-gold border-l-2 border-gold font-semibold shadow-sm"
                        : "text-slate-300 hover:text-slate-100 hover:bg-surface-card/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-gold" : "text-platinum/70"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                          isActive
                            ? "bg-gold/20 text-gold"
                            : "bg-surface-border text-platinum"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Health Footer */}
      <div className="p-3 border-t border-surface-border bg-obsidian">
        <div className="px-3 py-2 rounded-md bg-surface-card border border-surface-border flex items-center justify-between text-[10px] font-mono text-platinum">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
            <span>Terminal: SHW-01</span>
          </div>
          <span className="text-platinum/60">v0.10</span>
        </div>
      </div>
    </aside>
  );
}
