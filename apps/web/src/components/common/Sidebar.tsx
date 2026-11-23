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
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { checkRouteAccess } from "@/lib/pbac";

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
    title: "Overview",
    items: [{ name: "Control Tower", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Inventory & Atelier",
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
    title: "Commercial & Showroom",
    items: [
      { name: "Bullion & Pricing", href: "/pricing", icon: TrendingUp },
      { name: "POS Cashier", href: "/pos", icon: CreditCard },
      { name: "Returns & Scrap Melt", href: "/returns", icon: RotateCcw },
    ],
  },
  {
    title: "Logistics",
    items: [
      { name: "Store Transfers", href: "/transfers", icon: Truck, badge: 2 },
    ],
  },
  {
    title: "Private Clienteling",
    items: [
      { name: "VIP Client Portal", href: "/portal", icon: Crown },
      { name: "Gold Savings (SIP)", href: "/schemes", icon: Coins, badge: 3 },
    ],
  },
  {
    title: "Finance & Statutory",
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
  const { user } = useAuth();

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
            <div className="px-3 text-[11px] font-sans text-muted-foreground/80 font-medium truncate">
              {section.title}
            </div>
          ) : (
            idx > 0 && <div className="h-px bg-surface-border/60 mx-1 my-2" />
          )}
          <div className="space-y-0.5 pt-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const access = checkRouteAccess(item.href, user);
              const isRestricted = !access.allowed;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-md text-xs font-medium transition-colors duration-150 relative",
                    isCollapsed
                      ? "justify-center p-2.5 hover:bg-surface-elevated/80"
                      : "justify-between px-3 py-2",
                    isActive
                      ? isCollapsed
                        ? "bg-surface-elevated text-gold shadow-sm ring-1 ring-gold/40"
                        : "bg-surface-elevated text-gold border-l-2 border-gold font-semibold shadow-sm"
                      : isRestricted
                      ? "text-muted-foreground/70 hover:text-foreground hover:bg-surface-elevated/40"
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
                        isActive
                          ? "text-gold"
                          : isRestricted
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground",
                      )}
                    />
                    {!isCollapsed && (
                      <span className={cn(isRestricted && "text-muted-foreground/80")}>
                        {item.name}
                      </span>
                    )}
                    {isCollapsed && isRestricted && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-status-amber/80" />
                    )}
                    {isCollapsed && !isRestricted && item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
                    )}
                  </div>

                  {!isCollapsed && isRestricted && (
                    <span
                      title="Access Restricted (PBAC Locked)"
                      aria-label="Locked"
                      className="p-1 rounded-md text-muted-foreground/60 hover:text-gold shrink-0 bg-surface border border-surface-border/60 flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Lock className="w-3 h-3 text-gold/80" />
                    </span>
                  )}

                  {!isCollapsed && !isRestricted && item.badge !== undefined && (
                    <span
                      aria-hidden="true"
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
