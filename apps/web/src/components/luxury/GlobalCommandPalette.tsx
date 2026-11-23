"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  FileCheck2,
  Hammer,
  Gem,
  Tag,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  RotateCcw,
  Truck,
  Crown,
  Landmark,
  Coins,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

interface WorkstationCommand {
  id: string;
  name: string;
  route?: string;
  action?: () => void;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  description: string;
}

const COMMANDS: WorkstationCommand[] = [
  {
    id: "cmd-dash",
    name: "Executive Control Tower",
    route: "/",
    category: "Overview",
    icon: <LayoutDashboard className="w-4 h-4 text-gold" />,
    shortcut: "G D",
    description: "Live bullion tickers, vault status & showroom metrics",
  },
  {
    id: "cmd-pos",
    name: "POS Cashier & Salon Checkout",
    route: "/pos",
    category: "Commercial",
    icon: <CreditCard className="w-4 h-4 text-gold" />,
    shortcut: "G P",
    description: "VIP billing, split tenders, old gold & GST E-Invoice",
  },
  {
    id: "cmd-inv",
    name: "Piece Master & Asset Lineage",
    route: "/inventory",
    category: "Inventory",
    icon: <Gem className="w-4 h-4 text-gold" />,
    shortcut: "G I",
    description: "Multi-vault piece ledger, laser hallmark & lineage",
  },
  {
    id: "cmd-qc",
    name: "Analytical QC & BIS Hallmarking",
    route: "/qc",
    category: "Quality",
    icon: <FileCheck2 className="w-4 h-4 text-gold" />,
    shortcut: "G Q",
    description: "XRF spectrometry, 4Cs diamond grading & 6-char HUID",
  },
  {
    id: "cmd-mfg",
    name: "Atelier Manufacturing & Karigar Orders",
    route: "/manufacturing",
    category: "Atelier",
    icon: <Hammer className="w-4 h-4 text-gold" />,
    shortcut: "G M",
    description: "Job-work orders, mass balance & Form GST ITC-04",
  },
  {
    id: "cmd-storage",
    name: "Vault & Physical Compartments",
    route: "/storage",
    category: "Vault",
    icon: <Boxes className="w-4 h-4 text-gold" />,
    shortcut: "G S",
    description: "Vault → Locker → Tray multi-tier physical hierarchy",
  },
  {
    id: "cmd-rfid",
    name: "UHF RFID Antenna Sweeps",
    route: "/rfid",
    category: "IoT",
    icon: <Tag className="w-4 h-4 text-gold" />,
    shortcut: "G R",
    description: "Impinj Speedway 360° sweeps and tag encoding",
  },
  {
    id: "cmd-gate",
    name: "Stock Approval Gate & Quorum",
    route: "/governance",
    category: "Governance",
    icon: <ShieldCheck className="w-4 h-4 text-gold" />,
    shortcut: "G G",
    description: "HSM dual-custody authorization and forensic audit",
  },
  {
    id: "cmd-pricing",
    name: "Bullion Market & Spot Pricing",
    route: "/pricing",
    category: "Treasury",
    icon: <TrendingUp className="w-4 h-4 text-gold" />,
    shortcut: "G B",
    description: "Real-time MCX/LBMA rate boards & making charge tiers",
  },
  {
    id: "cmd-transfers",
    name: "Armored Consignment Transfers",
    route: "/transfers",
    category: "Logistics",
    icon: <Truck className="w-4 h-4 text-gold" />,
    shortcut: "G T",
    description: "Inter-branch armored transit & electronic seals",
  },
  {
    id: "cmd-acct",
    name: "General Ledger & Statutory Tax",
    route: "/accounting",
    category: "Finance",
    icon: <Landmark className="w-4 h-4 text-gold" />,
    shortcut: "G A",
    description: "Chart of accounts, balance sheet & tax filings",
  },
  {
    id: "cmd-schemes",
    name: "Gold Savings & SIP Plans",
    route: "/schemes",
    category: "Client",
    icon: <Coins className="w-4 h-4 text-gold" />,
    description: "Chit schemes, gold accumulation ledgers & bonuses",
  },
  {
    id: "cmd-portal",
    name: "VIP Client Digital Vault",
    route: "/portal",
    category: "Client",
    icon: <Crown className="w-4 h-4 text-gold" />,
    description: "Client digital vault, certificates & reservations",
  },
  {
    id: "cmd-lock",
    name: "Lock Workstation Terminal",
    action: () => {
      window.dispatchEvent(new CustomEvent("jewelcore:lock-terminal"));
    },
    category: "Security",
    icon: <Lock className="w-4 h-4 text-gold" />,
    shortcut: "Alt L",
    description: "Instantly lock showroom display behind PIN authorization",
  },
];

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalCommandPalette({
  isOpen,
  onClose,
}: GlobalCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1,
      );
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    }
  };

  const handleSelect = (cmd: WorkstationCommand) => {
    if (cmd.action) {
      cmd.action();
    } else if (cmd.route) {
      router.push(cmd.route);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-surface dark:bg-surface-elevated/95 backdrop-blur-2xl border-surface-border shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Workstation Navigation</DialogTitle>
        </DialogHeader>

        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-surface-border gap-3">
          <Search className="w-4 h-4 text-gold shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search workstations, SKU, HUID, or commands... (e.g. /pos)"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none font-sans"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-elevated border border-surface-border text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No matching workstations or commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gold/15 text-gold border border-gold/40 shadow-xs"
                      : "text-foreground hover:bg-surface-elevated/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-gold/20 border-gold/50"
                          : "bg-surface-elevated border-surface-border"
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{cmd.name}</span>
                        <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-surface-elevated border border-surface-border text-muted-foreground">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface border border-surface-border text-muted-foreground">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-surface-elevated/60 border-t border-surface-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="flex items-center gap-1 text-gold font-medium">
            <Sparkles className="w-3 h-3" /> JewelCore Atelier OS
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
