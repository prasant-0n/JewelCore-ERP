"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JewelCoreLogo } from "./JewelCoreLogo";
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
  Crown,
  Landmark,
  Hammer,
  Coins,
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
    items: [{ name: "Control Tower", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "INVENTORY & ATELIER",
    items: [
      { name: "Vault & Storage", href: "/storage", icon: Boxes },
      { name: "Inward Intake", href: "/procurement", icon: ArrowRightLeft },
      { name: "Analytical QC", href: "/qc", icon: FileCheck2, badge: 3 },
      { name: "Atelier Crafting", href: "/manufacturing", icon: Hammer, badge: 4 },
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
  {
    title: "PRIVATE CLIENTELING",
    items: [
      { name: "VIP Client Portal", href: "/portal", icon: Crown },
      { name: "Gold Savings (SIP)", href: "/schemes", icon: Coins, badge: 3 },
    ],
  },
  {
    title: "FINANCE & STATUTORY",
    items: [
      { name: "Accounting & GST", href: "/accounting", icon: Landmark },
    ],
  },
];

export function SidebarNavList({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="py-4 px-3 space-y-6 overflow-y-auto">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-1">
          <div className="px-3 text-[10px] font-mono tracking-widest text-muted-foreground/90 uppercase font-semibold">
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
                  onClick={onItemClick}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-surface-elevated text-gold border-l-2 border-gold font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-gold" : "text-muted-foreground"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                        isActive
                          ? "bg-gold/20 text-gold"
                          : "bg-surface border border-surface-border text-muted-foreground"
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
  );
}

export function Sidebar() {
  return (
    <aside
      data-testid="sidebar-nav"
      className="hidden md:flex w-60 bg-surface border-r border-surface-border flex-col justify-between h-[calc(100vh-3.5rem)] flex-shrink-0"
    >
      <SidebarNavList />

      {/* Terminal Health Footer */}
      <div className="p-3 border-t border-surface-border bg-surface">
        <div className="px-3 py-2 rounded-md bg-surface-elevated border border-surface-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center space-x-2">
            <JewelCoreLogo size="xs" variant="mark" />
            <span className="text-foreground">Terminal: SHW-01</span>
          </div>
          <span className="text-muted-foreground">v0.10</span>
        </div>
      </div>
    </aside>
  );
}
