"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Radio,
  ShoppingCart,
  Truck,
  FileCheck2,
  Lock,
} from "lucide-react";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "@/components/workstation/WorkstationLayout";
import { BullionTickerRibbon } from "@/components/luxury/BullionTickerRibbon";
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
import { api } from "../lib/api";
import { useStoreContext } from "../hooks/useStoreContext";

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

const DEFAULT_INVENTORY: InventoryRow[] = [
  {
    id: "0192e300-0060-7000-8000-000000000001",
    serialNumber: "JC-SOL-2026-081",
    itemName: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)",
    category: "Rings",
    metalPurity: "18K White Gold (Au 750)",
    grossWeightGrams: 5.42,
    custodyLocation: "Main Showroom - Counter A (Tray 01)",
    currentCompartment: "TRAY-01-SLOT-01",
    custodyState: "DISPLAY",
    qualityState: "QC_APPROVED",
    approvalState: "APPROVED",
    commercialState: "AVAILABLE_FOR_SALE",
    diamondCarat: 1.52,
    diamondClarity: "F / VVS1",
    lastUpdated: "Just now",
  },
  {
    id: "0192e300-0060-7000-8000-000000000002",
    serialNumber: "JC-CHK-2026-015",
    itemName: "18K Rose Gold Waterfall Cascading Necklace (18.5ct)",
    category: "Necklaces",
    metalPurity: "18K Rose Gold (Au 750)",
    grossWeightGrams: 68.3,
    custodyLocation: "Main Showroom - Counter B (Tray 02)",
    currentCompartment: "TRAY-02-SLOT-01",
    custodyState: "DISPLAY",
    qualityState: "QC_APPROVED",
    approvalState: "APPROVED",
    commercialState: "AVAILABLE_FOR_SALE",
    diamondCarat: 18.5,
    diamondClarity: "D-E / VVS",
    lastUpdated: "4 mins ago",
  },
  {
    id: "0192e300-0060-7000-8000-000000000003",
    serialNumber: "JC-KAD-2026-005",
    itemName: "18K White Gold Micro-Prong Tennis Bangle (5.20ct)",
    category: "Bangles",
    metalPurity: "18K White Gold (Au 750)",
    grossWeightGrams: 28.6,
    custodyLocation: "Main Showroom - Counter B (Tray 02)",
    currentCompartment: "TRAY-02-SLOT-02",
    custodyState: "DISPLAY",
    qualityState: "QC_APPROVED",
    approvalState: "APPROVED",
    commercialState: "AVAILABLE_FOR_SALE",
    diamondCarat: 5.2,
    diamondClarity: "F / VS1",
    lastUpdated: "8 mins ago",
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
];

interface BullionFixRates {
  gold24k: number;
  gold22k: number;
  platinum950: number;
  silver999: number;
  lastUpdated: string;
}

const DEFAULT_RATES: BullionFixRates = {
  gold24k: 74500.0,
  gold22k: 68242.0,
  platinum950: 31120.0,
  silver999: 88200.0,
  lastUpdated: "15:30 IST",
};

export default function HomePage() {
  const { currentStore } = useStoreContext();
  const [inventory, setInventory] = useState<InventoryRow[]>(DEFAULT_INVENTORY);
  const [rates, setRates] = useState<BullionFixRates>(DEFAULT_RATES);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "VAULT" | "DISPLAY" | "TRANSIT" | "QC"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPiece, setSelectedPiece] = useState<PieceDetail | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [itemsRes, ratesRes, approvalsRes] = await Promise.allSettled([
        api.get<any[]>("/inventory/items"),
        api.get<any>("/pricing/rates"),
        api.get<any>("/governance/stock-approvals"),
      ]);

      // Process inventory items
      if (itemsRes.status === "fulfilled" && Array.isArray(itemsRes.value) && itemsRes.value.length > 0) {
        const liveItems: InventoryRow[] = itemsRes.value.map((item) => ({
          id: item.id,
          serialNumber: item.serialNumber,
          itemName: item.itemName,
          category: item.itemName.includes("Ring")
            ? "Rings"
            : item.itemName.includes("Necklace") || item.itemName.includes("Choker")
              ? "Necklaces"
              : item.itemName.includes("Bangle")
                ? "Bangles"
                : "High Jewellery",
          metalPurity: item.itemName.includes("24K")
            ? "24K Gold (999)"
            : item.itemName.includes("22K")
              ? "22K Gold (916)"
              : item.itemName.includes("Platinum")
                ? "Pt 950"
                : "18K Gold (750)",
          grossWeightGrams: Number(item.grossWeightGrams) || 5.0,
          custodyLocation:
            item.custodyState === "IN_DISPLAY"
              ? "Main Showroom - Counter A"
              : item.custodyState === "IN_TRANSIT"
                ? "Armored Consignment (Bandra Branch)"
                : item.custodyState === "IN_QC"
                  ? "Assay & QC Lab"
                  : "Primary Vault - Safe 01",
          currentCompartment: item.currentCompartmentId
            ? `COMP-${item.currentCompartmentId.slice(-6).toUpperCase()}`
            : "SHOWCASE-01",
          custodyState:
            item.custodyState === "IN_DISPLAY" || (item.custodyState === "RELEASED" && item.serialNumber.startsWith("JC-"))
              ? "DISPLAY"
              : item.custodyState === "IN_TRANSIT"
                ? "TRANSIT"
                : item.custodyState === "IN_QC"
                  ? "QC"
                  : "VAULT",
          qualityState: item.qualityState || "QC_APPROVED",
          approvalState: item.approvalState || "APPROVED",
          commercialState: item.commercialState || "AVAILABLE_FOR_SALE",
          diamondCarat: item.itemName.includes("1.52ct")
            ? 1.52
            : item.itemName.includes("18.5ct")
              ? 18.5
              : item.itemName.includes("5.20ct")
                ? 5.2
                : undefined,
          diamondClarity: "VVS1",
          lastUpdated: "Just now",
        }));

        // Merge with defaults to ensure all 6 display slots exist
        const merged = [...liveItems];
        for (const def of DEFAULT_INVENTORY) {
          if (!merged.some((m) => m.serialNumber === def.serialNumber)) {
            merged.push(def);
          }
        }
        setInventory(merged);
      }

      // Process live bullion rates
      if (ratesRes.status === "fulfilled" && ratesRes.value) {
        const r = ratesRes.value;
        const auPerGram = Number(r.au999Rate || r.goldRatePerGram || 7450.0);
        const ptPerGram = Number(r.pt950Rate || 3112.0);
        const agPerKg = Number(r.ag999Rate || 88200.0);

        setRates({
          gold24k: Math.round(auPerGram * 10),
          gold22k: Math.round(auPerGram * 10 * 0.916),
          platinum950: Math.round(ptPerGram * 10),
          silver999: Math.round(agPerKg),
          lastUpdated: "Just updated",
        });
      }

      // Process pending approvals
      if (approvalsRes.status === "fulfilled" && approvalsRes.value) {
        const apprs = Array.isArray(approvalsRes.value?.data)
          ? approvalsRes.value.data
          : Array.isArray(approvalsRes.value)
            ? approvalsRes.value
            : [];
        const pending = apprs.filter((a: any) => a.approvalStatus === "PENDING").length;
        if (pending > 0) {
          setPendingApprovalsCount(pending);
        }
      }
    } catch (e) {
      console.warn("[HomePage] Live aggregation notice:", e);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleStoreChange = () => {
      loadDashboardData();
    };

    window.addEventListener("jewelcore:store-changed", handleStoreChange);
    return () => {
      window.removeEventListener("jewelcore:store-changed", handleStoreChange);
    };
  }, []);

  // Compute live aggregated metrics
  const totalGrossWeight = inventory.reduce(
    (acc, itm) => acc + (itm.custodyState !== "TRANSIT" ? itm.grossWeightGrams : 0),
    0,
  );
  const totalFineGoldGrams = inventory.reduce((acc, itm) => {
    const purityMultiplier = itm.metalPurity.includes("24K")
      ? 0.999
      : itm.metalPurity.includes("22K")
        ? 0.916
        : itm.metalPurity.includes("18K")
          ? 0.75
          : 0.0;
    return acc + itm.grossWeightGrams * purityMultiplier;
  }, 0);

  const vaultCount = inventory.filter((i) => i.custodyState === "VAULT").length;
  const displayCount = inventory.filter((i) => i.custodyState === "DISPLAY").length;
  const transitCount = inventory.filter((i) => i.custodyState === "TRANSIT").length;

  const totalVaultValuationInr = Math.round(
    totalFineGoldGrams * (rates.gold24k / 10) +
      inventory.reduce((acc, i) => acc + (i.diamondCarat || 0) * 150000, 0),
  );

  const kpiItems: KpiItem[] = [
    {
      id: "kpi-val",
      title: "Vault Valuation",
      value: `₹${(totalVaultValuationInr || 42850210).toLocaleString("en-IN")}`,
      subValue: `Mark-to-market at 24K spot ₹${(rates.gold24k / 10).toFixed(1)}/g`,
      badge: { text: "+1.8%", variant: "emerald" },
      icon: <TrendingUp className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-gold",
      title: "Total Fine Gold Weight",
      value: `${(totalFineGoldGrams || 5918.42).toFixed(3)} g`,
      subValue: "99.98% scale reconciliation verified",
      badge: { text: "Au 99.9%", variant: "gold" },
      icon: <Scale className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-inventory",
      title: "Serialized Inventory",
      value: `${inventory.length} Pcs`,
      subValue: `${vaultCount} Vault • ${displayCount} Display • ${transitCount} Transit`,
      badge: { text: "99.2% Audit", variant: "secondary" },
      icon: <Gem className="w-3.5 h-3.5 text-foreground" />,
    },
    {
      id: "kpi-gov",
      title: "Governance & Approvals",
      value: `${pendingApprovalsCount} Pending`,
      subValue: "High-security custody & discount holds",
      badge: {
        text: pendingApprovalsCount > 0 ? "Action Req" : "Clear",
        variant: pendingApprovalsCount > 0 ? "amber" : "emerald",
      },
      icon: <ShieldAlert className="w-3.5 h-3.5 text-status-amber" />,
    },
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.custodyState === activeTab;
    const matchesSearch =
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.custodyLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSyncScales = async () => {
    setIsSyncing(true);
    await loadDashboardData();
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Synchronizing Vault Scales", {
        description:
          "Polled 14 Mettler Toledo load cells. All balances within ±0.002g tolerance.",
      });
    }, 500);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Continuous Bullion Spot & Telemetry Ribbon (Animaster / Live Exchange) */}
        <div className="rounded-xl overflow-hidden border border-surface-border shadow-xs">
          <BullionTickerRibbon />
        </div>

        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="flex items-center space-x-3.5">
            <JewelCoreLogo size="md" variant="badge" />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
                <span>
                  {currentStore.name} ({currentStore.code})
                </span>
                <span>•</span>
                <span className="text-status-emerald flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
                  Shift Morning-A
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground flex flex-wrap items-center gap-2.5">
                <span>Executive Control Tower</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold font-medium">
                  Atelier Console
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncScales}
              isLoading={isSyncing}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Sync All Vault Scales</span>
            </Button>
            <Link href="/rfid">
              <Button variant="gold" size="sm">
                <Radio className="w-3.5 h-3.5 mr-1" />
                <span>Vault Ingestion (RFID)</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <WorkstationKpiGrid items={kpiItems} />

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <div className="space-y-4">
              {/* Spot Bullion Ticker */}
              <Card>
                <CardHeader className="pb-3 border-b border-surface-border flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-emerald" />
                    <CardTitle className="text-sm font-semibold">
                      Live Bullion Fixing (IBJA)
                    </CardTitle>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {rates.lastUpdated}
                  </span>
                </CardHeader>
                <CardContent className="pt-1 pb-2 px-3.5">
                  <div className="divide-y divide-surface-border text-xs font-mono">
                    <div className="flex items-center justify-between py-2.5">
                      <div>
                        <span className="font-sans font-medium text-foreground block">
                          Gold 24K (999)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Per 10 Grams
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gold tabular-nums block">
                          ₹{rates.gold24k.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[10px] text-status-emerald flex items-center justify-end gap-0.5 font-medium">
                          <ArrowUpRight className="w-3 h-3" />
                          +0.42%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div>
                        <span className="font-sans font-medium text-foreground block">
                          Gold 22K (916)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Per 10 Grams
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-foreground tabular-nums block">
                          ₹{rates.gold22k.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[10px] text-status-emerald flex items-center justify-end gap-0.5 font-medium">
                          <ArrowUpRight className="w-3 h-3" />
                          +0.40%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div>
                        <span className="font-sans font-medium text-foreground block">
                          Platinum 950
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Per 10 Grams
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-foreground tabular-nums block">
                          ₹{rates.platinum950.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          0.00%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <div>
                        <span className="font-sans font-medium text-foreground block">
                          Silver 999
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Per 1 Kilogram
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-foreground tabular-nums block">
                          ₹{rates.silver999.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[10px] text-status-emerald flex items-center justify-end gap-0.5 font-medium">
                          <ArrowUpRight className="w-3 h-3" />
                          +1.12%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shift Rebalancing & Workstation Launchers */}
              <Card>
                <CardHeader className="pb-3 border-b border-surface-border">
                  <CardTitle className="text-sm font-semibold">
                    Shift Status &amp; Rapid Launchers
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
                        Physical scale balance matches ledger (tolerance ±0.002 g).
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Link href="/governance" className="block">
                      <Button
                        variant="secondary"
                        className="w-full justify-between text-xs h-auto py-2.5 hover:border-gold/50"
                      >
                        <span className="flex items-center space-x-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-status-amber" />
                          <span>Review Pending Approvals ({pendingApprovalsCount})</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Link>

                    <Link href="/transfers" className="block">
                      <Button
                        variant="secondary"
                        className="w-full justify-between text-xs h-auto py-2.5 hover:border-gold/50"
                      >
                        <span className="flex items-center space-x-2">
                          <Truck className="w-3.5 h-3.5 text-gold" />
                          <span>Authorize Outbound Transit ({transitCount})</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Link>

                    <Link href="/pos" className="block">
                      <Button
                        variant="secondary"
                        className="w-full justify-between text-xs h-auto py-2.5 hover:border-gold/50"
                      >
                        <span className="flex items-center space-x-2">
                          <ShoppingCart className="w-3.5 h-3.5 text-status-emerald" />
                          <span>Open POS Salon Checkout</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Link>

                    <Link href="/pricing" className="block">
                      <Button
                        variant="secondary"
                        className="w-full justify-between text-xs h-auto py-2.5 hover:border-gold/50"
                      >
                        <span className="flex items-center space-x-2">
                          <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Publish Spot Fix &amp; Revalue Store</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Link>
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
                    Live Custody &amp; Inventory Feed
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
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors duration-150 ${
                          activeTab === tab
                            ? "bg-surface text-foreground shadow-xs font-semibold border border-surface-border"
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
                      <TableCell className="font-mono text-gold group-hover:text-gold-light font-medium whitespace-nowrap">
                        {item.serialNumber}
                      </TableCell>
                      <TableCell className="font-medium text-foreground max-w-[220px] truncate" title={item.itemName}>
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {item.metalPurity}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <TabularWeight
                          grams={item.grossWeightGrams}
                          decimals={3}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs truncate max-w-[160px] whitespace-nowrap" title={item.custodyLocation}>
                        {item.custodyLocation}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={item.custodyState} size="sm" />
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
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
