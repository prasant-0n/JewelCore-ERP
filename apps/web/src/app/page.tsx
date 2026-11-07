"use client";

import React, { useState } from "react";
import { AppShell } from "../components/common/AppShell";
import {
  PieceInspectorDrawer,
  PieceDetail,
} from "../components/dashboard/PieceInspectorDrawer";
import {
  TrendingUp,
  Scale,
  ShieldAlert,
  ArrowUpRight,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Boxes,
  Eye,
  ChevronRight,
} from "lucide-react";

interface InventoryRow {
  id: string;
  serialNumber: string;
  itemName: string;
  category: string;
  metalPurity: string;
  grossWeightGrams: number;
  custodyLocation: string;
  currentCompartment: string;
  custodyState: "VAULT" | "DISPLAY" | "TRANSIT" | "QC";
  qualityState: string;
  approvalState: string;
  commercialState: string;
  diamondCarat?: number;
  diamondClarity?: string;
  lastUpdated: string;
}

const MOCK_INVENTORY: InventoryRow[] = [
  {
    id: "pc-101",
    serialNumber: "JWL-2026-08912",
    itemName: "Solitaire Diamond Engagement Ring 1.25ct",
    category: "Rings",
    metalPurity: "18K Yellow Gold",
    grossWeightGrams: 5.421,
    custodyLocation: "Main Showroom - Counter A",
    currentCompartment: "TRAY-04-SLOT-02",
    custodyState: "DISPLAY",
    qualityState: "HALLMARKED",
    approvalState: "APPROVED",
    commercialState: "AVAILABLE_FOR_SALE",
    diamondCarat: 1.25,
    diamondClarity: "VVS1 / E",
    lastUpdated: "4 mins ago",
  },
  {
    id: "pc-102",
    serialNumber: "JWL-2026-08913",
    itemName: "Temple Antique Kundan Choker Necklace",
    category: "Necklaces",
    metalPurity: "22K Gold (916)",
    grossWeightGrams: 48.65,
    custodyLocation: "Primary Vault - Safe 01",
    currentCompartment: "LOCKER-02-B1",
    custodyState: "VAULT",
    qualityState: "HALLMARKED",
    approvalState: "APPROVED",
    commercialState: "AVAILABLE_FOR_SALE",
    lastUpdated: "12 mins ago",
  },
  {
    id: "pc-103",
    serialNumber: "JWL-2026-08914",
    itemName: "Handcrafted Filigree Bridal Bangles (Set of 2)",
    category: "Bangles",
    metalPurity: "22K Gold (916)",
    grossWeightGrams: 32.18,
    custodyLocation: "Transit to Bandra Branch",
    currentCompartment: "BOX-XFR-8921",
    custodyState: "TRANSIT",
    qualityState: "HALLMARKED",
    approvalState: "APPROVED",
    commercialState: "IN_TRANSIT",
    lastUpdated: "35 mins ago",
  },
  {
    id: "pc-104",
    serialNumber: "JWL-2026-08915",
    itemName: "Platinum Diamond Eternity Band 0.85ct",
    category: "Rings",
    metalPurity: "Pt 950",
    grossWeightGrams: 6.84,
    custodyLocation: "Metrology & Assay Lab",
    currentCompartment: "ASSAY-TRAY-01",
    custodyState: "QC",
    qualityState: "INSPECTION_PENDING",
    approvalState: "PENDING_APPROVAL",
    commercialState: "QUARANTINED",
    diamondCarat: 0.85,
    diamondClarity: "VS1 / F",
    lastUpdated: "1 hour ago",
  },
  {
    id: "pc-105",
    serialNumber: "JWL-2026-08916",
    itemName: "Polki Heritage Royal Jhumka Earrings",
    category: "Earrings",
    metalPurity: "22K Gold (916)",
    grossWeightGrams: 24.31,
    custodyLocation: "Primary Vault - Safe 02",
    currentCompartment: "LOCKER-01-A4",
    custodyState: "VAULT",
    qualityState: "HALLMARKED",
    approvalState: "APPROVED",
    commercialState: "AVAILABLE_FOR_SALE",
    lastUpdated: "2 hours ago",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "VAULT" | "DISPLAY" | "TRANSIT" | "QC">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPiece, setSelectedPiece] = useState<PieceDetail | null>(null);

  const filteredInventory = MOCK_INVENTORY.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.custodyState === activeTab;
    const matchesSearch =
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.custodyLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/70 uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Shift Morning-A Active
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Executive Control Tower
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-3.5 py-1.5 rounded-md bg-surface-card border border-surface-border text-xs font-medium text-slate-200 hover:border-gold/50 hover:text-gold flex items-center space-x-2 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync All Vault Scales</span>
            </button>
            <button className="px-3.5 py-1.5 rounded-md bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center space-x-1.5 shadow-sm transition-colors">
              <Boxes className="w-3.5 h-3.5" />
              <span>Vault Ingestion (RFID)</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Vault Valuation */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm hover:border-surface-border/80 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span>Real-Time Vault Valuation</span>
              <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +1.8%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-100">
                ₹42,850,210.00
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                Mark-to-market at 24K spot ₹7,240/g
              </p>
            </div>
          </div>

          {/* Card 2: Fine Gold Equivalent */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm hover:border-surface-border/80 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span>Total Fine Gold Weight</span>
              <span className="text-gold bg-gold/10 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-0.5">
                <Scale className="w-3 h-3" />
                Au 99.9%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-gold-light">
                5,918.420 <span className="text-base font-sans font-normal text-platinum">g</span>
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                99.98% scale reconciliation verified
              </p>
            </div>
          </div>

          {/* Card 3: Active Serialized Pieces */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm hover:border-surface-border/80 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span>Serialized Inventory</span>
              <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded text-[11px] font-mono">
                1,482 Total
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-100">
                1,240 <span className="text-sm font-sans font-normal text-platinum">in Vault</span>
              </div>
              <p className="mt-1 text-xs text-platinum/60 flex items-center gap-2">
                <span>194 Display</span>
                <span>•</span>
                <span>48 In-Transit</span>
              </p>
            </div>
          </div>

          {/* Card 4: Governance Approvals Queue */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm hover:border-surface-border/80 transition-all">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span>Governance & Approvals</span>
              <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Action Req.
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-amber-300">
                7 Pending
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                3 Discounts &gt;5%, 2 Weight alerts, 2 XFR
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: Left = Custody Feed, Right = Spot Rates & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2 spans): Real-Time Custody & Piece Directory */}
          <div className="lg:col-span-2 space-y-4">
            {/* Feed Header & Filters */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Live Custody & Inventory Feed
                  </h2>
                  <p className="text-xs text-platinum/70">
                    Track individual serialized assets across safes, display trays, and inter-branch transit.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-obsidian-deep p-1 rounded-lg border border-surface-border text-xs">
                  {(["ALL", "VAULT", "DISPLAY", "TRANSIT", "QC"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeTab === tab
                          ? "bg-surface-elevated text-gold shadow-sm font-semibold"
                          : "text-platinum/70 hover:text-slate-100"
                      }`}
                    >
                      {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-platinum/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Serial Number, item name, or safe location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-obsidian-deep border border-surface-border rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-platinum/40 focus:outline-none focus:border-gold/60 transition-colors"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-border text-platinum/60 font-mono uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-medium">Serial #</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Purity</th>
                      <th className="pb-3 font-medium text-right">Gross Wt</th>
                      <th className="pb-3 font-medium">Location</th>
                      <th className="pb-3 font-medium">Custody</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedPiece(item)}
                        className="hover:bg-surface-elevated/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 font-mono text-gold-light group-hover:text-gold font-medium">
                          {item.serialNumber}
                        </td>
                        <td className="py-3.5 font-medium text-slate-100 max-w-[220px] truncate">
                          {item.itemName}
                        </td>
                        <td className="py-3.5 text-platinum/80">{item.metalPurity}</td>
                        <td className="py-3.5 font-mono tabular-nums text-right text-slate-100">
                          {item.grossWeightGrams.toFixed(3)} g
                        </td>
                        <td className="py-3.5 text-platinum/80 text-[11px] truncate max-w-[160px]">
                          {item.custodyLocation}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              item.custodyState === "VAULT"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : item.custodyState === "DISPLAY"
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : item.custodyState === "TRANSIT"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                item.custodyState === "VAULT"
                                  ? "bg-emerald-400"
                                  : item.custodyState === "DISPLAY"
                                  ? "bg-cyan-400"
                                  : item.custodyState === "TRANSIT"
                                  ? "bg-blue-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            {item.custodyState}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPiece(item);
                            }}
                            className="p-1 rounded text-platinum/60 hover:text-gold hover:bg-gold/10 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Bullion Spot Rates & Shift Rebalancing */}
          <div className="space-y-6">
            {/* Spot Bullion Ticker */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-semibold text-slate-100">
                    Live Bullion Fixing (IBJA)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-platinum/60">14:50 IST</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian-deep border border-surface-border">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">Gold 24K (999)</span>
                    <span className="text-[10px] text-platinum/60">Per 10 Grams</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-gold-light tabular-nums block">
                      ₹72,400.00
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +0.42%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian-deep border border-surface-border">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">Gold 22K (916)</span>
                    <span className="text-[10px] text-platinum/60">Per 10 Grams</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-slate-100 tabular-nums block">
                      ₹66,350.00
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +0.40%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian-deep border border-surface-border">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">Platinum 950</span>
                    <span className="text-[10px] text-platinum/60">Per 10 Grams</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-slate-100 tabular-nums block">
                      ₹31,120.00
                    </span>
                    <span className="text-[10px] font-mono text-platinum/70 block">0.00%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian-deep border border-surface-border">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">Silver 999</span>
                    <span className="text-[10px] text-platinum/60">Per 1 Kilogram</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-slate-100 tabular-nums block">
                      ₹88,200.00
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +1.12%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Rebalancing & Immediate Actions */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-100">
                Shift Status & Reconciliation
              </h3>

              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-emerald-300">Vault Balance Verified</div>
                  <div className="text-platinum/70 mt-0.5">
                    Physical scale balance matches ledger (tolerance &plusmn;0.002 g).
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button className="w-full px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-between transition-colors">
                  <span className="flex items-center space-x-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Review Pending Discounts (3)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-platinum/60" />
                </button>

                <button className="w-full px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-slate-200 hover:text-slate-100 flex items-center justify-between transition-colors">
                  <span className="flex items-center space-x-2">
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>Authorize Outbound Transit (2)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-platinum/60" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Piece Inspector Drawer Modal */}
      <PieceInspectorDrawer
        piece={selectedPiece}
        onClose={() => setSelectedPiece(null)}
      />
    </AppShell>
  );
}
