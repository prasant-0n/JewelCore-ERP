"use client";

import React, { useState } from "react";
import { AppShell } from "../components/common/AppShell";
import { JewelCoreLogo } from "../components/common/JewelCoreLogo";
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
  Search,
  RefreshCw,
  CheckCircle2,
  Boxes,
  ChevronRight,
  Gem,
} from "lucide-react";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "@/components/workstation/WorkstationLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TabularWeight } from "@/components/workstation/TabularWeight";
import { TabularCurrency } from "@/components/workstation/TabularCurrency";
import { StatusBadge } from "@/components/workstation/StatusBadge";
import { toast } from "sonner";

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

const KPI_ITEMS: KpiItem[] = [
  {
    id: "kpi-val",
    title: "Vault Valuation",
    value: "₹4,28,50,210",
    subValue: "Mark-to-market at 24K spot ₹7,450/g",
    badge: { text: "+1.8%", variant: "emerald" },
    icon: <TrendingUp className="w-3.5 h-3.5 text-status-emerald" />,
  },
  {
    id: "kpi-gold",
    title: "Total Fine Gold Weight",
    value: "5,918.420 g",
    subValue: "99.98% scale reconciliation verified",
    badge: { text: "Au 99.9%", variant: "gold" },
    icon: <Scale className="w-3.5 h-3.5 text-gold" />,
  },
  {
    id: "kpi-inventory",
    title: "Serialized Inventory",
    value: "1,482 Pcs",
    subValue: "1,240 Vault • 194 Display • 48 Transit",
    badge: { text: "99.2% Audit", variant: "secondary" },
    icon: <Gem className="w-3.5 h-3.5 text-foreground" />,
  },
  {
    id: "kpi-gov",
    title: "Governance & Approvals",
    value: "7 Pending",
    subValue: "3 Discounts >5%, 2 Weight alerts, 2 XFR",
    badge: { text: "Action Req", variant: "amber" },
    icon: <ShieldAlert className="w-3.5 h-3.5 text-status-amber" />,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "VAULT" | "DISPLAY" | "TRANSIT" | "QC"
  >("ALL");
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

  const handleSyncScales = () => {
    toast.success("Synchronizing Vault Scales", {
      description:
        "Polled 14 Mettler Toledo load cells. All balances within ±0.002g tolerance.",
    });
  };

  const handleVaultIngestion = () => {
    toast.info("RFID Ingestion Station Ready", {
      description: "Place RFID transport trays on antenna reader to ingest.",
    });
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="flex items-center space-x-3.5">
            <JewelCoreLogo size="md" variant="badge" />
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                <span>Flagship Mumbai (INV-11)</span>
                <span>•</span>
                <span className="text-status-emerald flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-emerald animate-pulse" />
                  Shift Morning-A Active
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Executive Control Tower</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold uppercase tracking-wider font-semibold">
                  Atelier Master
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={handleSyncScales}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Sync All Vault Scales</span>
            </Button>
            <Button variant="gold" size="sm" onClick={handleVaultIngestion}>
              <Boxes className="w-3.5 h-3.5 mr-1" />
              <span>Vault Ingestion (RFID)</span>
            </Button>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <WorkstationKpiGrid items={KPI_ITEMS} />

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <div className="space-y-4">
              {/* Spot Bullion Ticker */}
              <Card>
                <CardHeader className="pb-3 border-b border-surface-border flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
                    <CardTitle className="text-sm font-semibold">
                      Live Bullion Fixing (IBJA)
                    </CardTitle>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    14:50 IST
                  </span>
                </CardHeader>
                <CardContent className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Gold 24K (999)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Per 10 Grams
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-gold tabular-nums block">
                        ₹74,500.00
                      </span>
                      <span className="text-[10px] font-mono text-status-emerald flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +0.42%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Gold 22K (916)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Per 10 Grams
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-foreground tabular-nums block">
                        ₹68,240.00
                      </span>
                      <span className="text-[10px] font-mono text-status-emerald flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +0.40%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Platinum 950
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Per 10 Grams
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-foreground tabular-nums block">
                        ₹31,120.00
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        0.00%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-surface-border">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Silver 999
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Per 1 Kilogram
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-foreground tabular-nums block">
                        ₹88,200.00
                      </span>
                      <span className="text-[10px] font-mono text-status-emerald flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +1.12%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shift Rebalancing & Immediate Actions */}
              <Card>
                <CardHeader className="pb-3 border-b border-surface-border">
                  <CardTitle className="text-sm font-semibold">
                    Shift Status & Reconciliation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  <div className="p-3 rounded-lg bg-status-emeraldBg border border-status-emerald/30 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-status-emerald shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-medium text-status-emerald">
                        Vault Balance Verified
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        Physical scale balance matches ledger (tolerance
                        &plusmn;0.002 g).
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      variant="secondary"
                      className="w-full justify-between text-xs h-auto py-2.5"
                      onClick={() =>
                        toast.info("Opening 3 pending discount approvals...")
                      }
                    >
                      <span className="flex items-center space-x-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-status-amber" />
                        <span>Review Pending Discounts (3)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full justify-between text-xs h-auto py-2.5"
                      onClick={() =>
                        toast.info("Navigating to Inter-Branch Transit...")
                      }
                    >
                      <span className="flex items-center space-x-2">
                        <Boxes className="w-3.5 h-3.5 text-gold" />
                        <span>Authorize Outbound Transit (2)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        >
          {/* Main 65% Column: Custody Feed Table */}
          <Card>
            <CardHeader className="pb-4 border-b border-surface-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Live Custody & Inventory Feed
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Track individual serialized assets across safes, display
                    trays, and inter-branch transit.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-surface-elevated p-1 rounded-lg border border-surface-border text-xs">
                  {(["ALL", "VAULT", "DISPLAY", "TRANSIT", "QC"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          activeTab === tab
                            ? "bg-surface text-gold shadow-sm font-semibold border border-surface-border"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === "ALL"
                          ? "All"
                          : tab.charAt(0) + tab.slice(1).toLowerCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Serial Number, item name, or safe location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead className="text-right">Gross Wt</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Custody</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => setSelectedPiece(item)}
                      className="cursor-pointer group"
                    >
                      <TableCell className="font-mono text-gold group-hover:text-gold-light font-medium">
                        {item.serialNumber}
                      </TableCell>
                      <TableCell className="font-medium text-foreground max-w-[220px] truncate">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.metalPurity}
                      </TableCell>
                      <TableCell className="text-right">
                        <TabularWeight
                          grams={item.grossWeightGrams}
                          decimals={3}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs truncate max-w-[160px]">
                        {item.custodyLocation}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.custodyState} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPiece(item);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </WorkstationLayout>
      </div>

      {/* Piece Inspector Drawer */}
      <PieceInspectorDrawer
        piece={selectedPiece}
        onClose={() => setSelectedPiece(null)}
      />
    </AppShell>
  );
}
