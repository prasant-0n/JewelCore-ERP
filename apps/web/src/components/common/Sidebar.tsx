"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  PanelLeftClose,
  PanelLeftOpen,
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

export function SidebarNavList({
  onItemClick,
  isCollapsed = false,
}: {
  onItemClick?: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "py-4 space-y-6 overflow-y-auto overflow-x-hidden",
        isCollapsed ? "px-2" : "px-3",
      )}
    >
      {NAV_SECTIONS.map((section, idx) => (
        <div key={section.title} className="space-y-1">
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-mono tracking-widest text-muted-foreground/90 uppercase font-semibold truncate">
              {section.title}
            </div>
          ) : (
            idx > 0 && <div className="h-px bg-surface-border/60 mx-1 my-2" />
          )}
          <div className="space-y-0.5 pt-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  title={
                    isCollapsed
                      ? `${item.name}${item.badge !== undefined ? ` (${item.badge})` : ""}`
                      : undefined
                  }
                  className={cn(
                    "flex items-center rounded-md text-xs font-medium transition-all relative",
                    isCollapsed
                      ? "justify-center p-2.5 hover:bg-surface-elevated/80"
                      : "justify-between px-3 py-2",
                    isActive
                      ? isCollapsed
                        ? "bg-surface-elevated text-gold shadow-sm ring-1 ring-gold/40"
                        : "bg-surface-elevated text-gold border-l-2 border-gold font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      isCollapsed ? "justify-center relative" : "space-x-2.5",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-gold" : "text-muted-foreground",
                      )}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
                    )}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold shrink-0 ${
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      data-testid="sidebar-nav"
      className={cn(
        "hidden lg:flex bg-surface border-r border-surface-border flex-col justify-between h-[calc(100vh-3.5rem)] flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <SidebarNavList isCollapsed={isCollapsed} />

      {/* Terminal Health Footer & Rail Collapse Button */}
      <div className="p-2.5 border-t border-surface-border bg-surface">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="px-2.5 py-1.5 rounded-md bg-surface-elevated border border-surface-border flex items-center space-x-2 text-[10px] font-mono text-muted-foreground flex-1 mr-1.5 min-w-0">
              <JewelCoreLogo size="xs" variant="mark" />
              <span className="text-foreground truncate">SHW-01</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-md hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Collapse sidebar rail (Expand canvas)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-md hover:bg-surface-elevated text-muted-foreground hover:text-gold transition-colors"
              title="Expand full sidebar"
              aria-label="Expand full sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
