"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import { PosPieceCard, PosPieceData } from "../../components/pos/PosPieceCard";
import {
  CartSection,
  PosSectionGroupData,
} from "../../components/pos/CartSection";
import { BillingInspector } from "../../components/pos/BillingInspector";
import {
  ClientSelectModal,
  ClientProfileData,
} from "../../components/pos/ClientSelectModal";
import {
  SalonPresentationModal,
  PresentationPieceData,
} from "../../components/common/SalonPresentationModal";
import {
  ShoppingBag,
  CreditCard,
  Scale,
  ShieldCheck,
  Search,
  Plus,
  Scan,
  TrendingUp,
  UserCheck,
  Sparkles,
} from "lucide-react";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "@/components/workstation/WorkstationLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const INITIAL_POS_GROUPS: PosSectionGroupData[] = [
  {
    id: "grp-active-cart",
    sectionTitle: "Active Salon Cart: Mrs. Radhika Singhania",
    clientTag: "VIP Client #9021",
    description: "Private Salon Suite 1 • AML Stamped",
    status: "CART_SECURED",
    pieces: [
      {
        id: "pc-sol-01",
        serialNumber: "JC-SOL-2026-081",
        itemName: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)",
        category: "Solitaire Rings",
        metalPurity: "18K White Gold (Au 750)",
        grossWeightGrams: 5.42,
        netGoldGrams: 5.116,
        diamondCarat: 1.52,
        diamondSpecs: "F-VVS1 Triple Ex (GIA-2210894511)",
        metalValueInr: 37550.0,
        diamondValueInr: 415000.0,
        makingChargeInr: 32450.0,
        totalPriceInr: 485000.0,
        status: "IN_CART",
        epcTag: "EPC-E280-1160-9941",
        hallmarkId: "BIS-750-MUM-8912",
      },
      {
        id: "pc-nk-02",
        serialNumber: "JC-CHK-2026-015",
        itemName: "18K Rose Gold Waterfall Cascading Necklace (18.5ct)",
        category: "Necklaces & Chokers",
        metalPurity: "18K Rose Gold (Au 750)",
        grossWeightGrams: 68.3,
        netGoldGrams: 52.1,
        diamondCarat: 18.5,
        diamondSpecs: "F-G Color VVS-VS (IGI-DIA-44102)",
        metalValueInr: 382400.0,
        diamondValueInr: 1265000.0,
        makingChargeInr: 202600.0,
        totalPriceInr: 1850000.0,
        status: "IN_CART",
        epcTag: "EPC-E280-1160-8813",
        hallmarkId: "BIS-750-MUM-4412",
      },
      {
        id: "pc-bg-02",
        serialNumber: "JC-KAD-2026-005",
        itemName: "18K White Gold Micro-Prong Tennis Bangle (5.20ct)",
        category: "Bangles & Kadas",
        metalPurity: "18K White Gold (Au 750)",
        grossWeightGrams: 28.6,
        netGoldGrams: 27.56,
        diamondCarat: 5.2,
        diamondSpecs: "E-F VVS Syndicate (HRD-ANT-8819)",
        metalValueInr: 198200.0,
        diamondValueInr: 380000.0,
        makingChargeInr: 46800.0,
        totalPriceInr: 625000.0,
        status: "IN_CART",
        epcTag: "EPC-E280-1160-7714",
        hallmarkId: "BIS-750-MUM-1102",
      },
    ],
  },
  {
    id: "grp-showroom-showcase",
    sectionTitle: "High-Jewellery Vitrine Counter Showcase",
    clientTag: "Salon Floor",
    description: "Inspected Pieces Available for Immediate Billing",
    status: "VITRINE_LIVE",
    pieces: [
      {
        id: "pc-sol-02",
        serialNumber: "JC-SOL-2026-082",
        itemName: "18K Yellow Gold Cushion Halo Ring (2.01ct D-VVS2)",
        category: "Solitaire Rings",
        metalPurity: "18K Yellow Gold (Au 750)",
        grossWeightGrams: 6.84,
        netGoldGrams: 6.438,
        diamondCarat: 2.01,
        diamondSpecs: "D-VVS2 GIA Laser-Inscribed (GIA-5591230044)",
        metalValueInr: 47200.0,
        diamondValueInr: 785000.0,
        makingChargeInr: 57800.0,
        totalPriceInr: 890000.0,
        status: "AVAILABLE",
        epcTag: "EPC-E280-1160-9942",
        hallmarkId: "BIS-750-MUM-8913",
      },
      {
        id: "pc-chk-01",
        serialNumber: "JC-CHK-2026-014",
        itemName: "22K Antique Heritage Jadau Polki Choker",
        category: "Necklaces & Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 54.2,
        netGoldGrams: 46.85,
        diamondCarat: 6.5,
        diamondSpecs: "Syndicate Natural Uncut Polki Diamonds",
        metalValueInr: 324500.0,
        diamondValueInr: 780000.0,
        makingChargeInr: 145500.0,
        totalPriceInr: 1250000.0,
        status: "AVAILABLE",
        epcTag: "EPC-E280-1160-9951",
        hallmarkId: "BIS-916-MUM-0014",
      },
    ],
  },
];

export default function PosTerminalPage() {
  const [groups, setGroups] =
    useState<PosSectionGroupData[]>(INITIAL_POS_GROUPS);
  const [activeClient, setActiveClient] = useState<ClientProfileData>({
    id: "cli-01",
    name: "Mrs. Radhika Singhania",
    vipTier: "Ultra High Net Worth (UHNW)",
    panNumber: "AAAPS9012K",
    phone: "+91 98201 44892",
    lifetimeSpendInr: 24500000,
    assignedSalon: "Private Salon Suite 1",
    relationshipManager: "N. Mehta",
  });
  const [selectedPiece, setSelectedPiece] = useState<PosPieceData | null>(
    INITIAL_POS_GROUPS[0].pieces[0],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isScanningScale, setIsScanningScale] = useState(false);
  const [salonPiece, setSalonPiece] = useState<PresentationPieceData | null>(null);
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);

  const openSalonView = (piece: PosPieceData) => {
    setSalonPiece({
      serialNumber: piece.serialNumber,
      itemName: piece.itemName,
      category: piece.category,
      metalPurity: piece.metalPurity,
      grossWeightGrams: piece.grossWeightGrams,
      netGoldGrams: piece.netGoldGrams,
      diamondCarat: piece.diamondCarat,
      diamondSpecs: piece.diamondSpecs,
      hallmarkId: piece.hallmarkId,
      retailPriceInr: piece.totalPriceInr,
      epcTag: piece.epcTag,
    });
    setIsSalonModalOpen(true);
  };

  // Listen to mobile camera barcode scans dispatched from TopHeader
  useEffect(() => {
    const handlePieceScanned = (e: Event) => {
      const customEvent = e as CustomEvent<{ barcode: string }>;
      const barcode = customEvent.detail?.barcode;
      if (!barcode) return;

      // Search existing groups for matching piece
      let found: PosPieceData | undefined;
      for (const group of groups) {
        found = group.pieces.find(
          (p) =>
            p.serialNumber.toLowerCase() === barcode.toLowerCase() ||
            p.epcTag.toLowerCase() === barcode.toLowerCase() ||
            p.id.toLowerCase() === barcode.toLowerCase(),
        );
        if (found) break;
      }

      if (found) {
        setSelectedPiece(found);
        openSalonView(found);
        toast.success(`Piece Scanned: ${found.serialNumber}`, {
          description: `${found.itemName} loaded in VIP Salon Presentation Mode.`,
        });
      } else {
        // If simulated or new tag scanned, create showcase piece
        const newPiece: PosPieceData = {
          id: `pc-${Date.now()}`,
          serialNumber: barcode,
          itemName: "18K Royal Solitaire Ring (2.05ct Flawless D)",
          category: "Solitaire Rings",
          metalPurity: "18K Yellow Gold (Au 750)",
          grossWeightGrams: 6.85,
          netGoldGrams: 6.44,
          diamondCarat: 2.05,
          diamondSpecs: "D-FL Hearts & Arrows (GIA-90412851)",
          metalValueInr: 48500,
          diamondValueInr: 890000,
          makingChargeInr: 51500,
          totalPriceInr: 990000,
          status: "AVAILABLE",
          epcTag: `EPC-E280-${barcode.replace(/[^0-9]/g, "").slice(-4) || "9041"}`,
          hallmarkId: `BIS-750-MUM-${barcode.replace(/[^0-9]/g, "").slice(-4) || "9041"}`,
        };
        setGroups((prev) => [
          ...prev,
          {
            id: `grp-scanned-${Date.now()}`,
            sectionTitle: `Scanned Unit (${barcode})`,
            clientTag: "Camera Scanned",
            description: "Floor Camera Barcode Ingestion",
            status: "VITRINE_LIVE",
            pieces: [newPiece],
          },
        ]);
        setSelectedPiece(newPiece);
        openSalonView(newPiece);
        toast.success(`New Barcode Tag Scanned: ${barcode}`, {
          description: "Authenticated & presented on VIP Salon Pedestal.",
        });
      }
    };

    window.addEventListener("jewelcore:piece-scanned", handlePieceScanned);
    return () => {
      window.removeEventListener("jewelcore:piece-scanned", handlePieceScanned);
    };
  }, [groups]);

  // Cart pieces
  const activeCartGroup = groups.find((g) => g.id === "grp-active-cart");
  const cartPieces = activeCartGroup
    ? activeCartGroup.pieces.filter((p) => p.status === "IN_CART")
    : [];

  const todayGrossInr = 4280000;
  const activeCartsCount = 3;
  const averageTicketSizeInr = 985000;

  const posKpis: KpiItem[] = [
    {
      id: "kpi-today-gross",
      title: "Today's Showroom Gross",
      value: `₹ ${(todayGrossInr / 100000).toFixed(1)} Lakh`,
      subValue: "+14.2% vs Daily Target",
      badge: { text: "+14.2%", variant: "emerald" },
      icon: <TrendingUp className="w-3.5 h-3.5 text-status-emerald" />,
    },
    {
      id: "kpi-open-carts",
      title: "Active Client Sessions",
      value: `${activeCartsCount} Open Carts`,
      subValue: "VIP Private Salon Reserved",
      badge: { text: "VIP Salon", variant: "gold" },
      icon: <ShoppingBag className="w-3.5 h-3.5 text-gold" />,
    },
    {
      id: "kpi-atv",
      title: "Average Ticket Size (ATV)",
      value: `₹ ${(averageTicketSizeInr / 100000).toFixed(2)} L`,
      subValue: "High Jewellery Segment",
      badge: { text: "High Tier", variant: "secondary" },
      icon: <Scale className="w-3.5 h-3.5 text-foreground" />,
    },
    {
      id: "kpi-bullion-lock",
      title: "Live Bullion Lock",
      value: "Au 24K: ₹7,450/g",
      subValue: "Mid-Day MCX Fix Synced",
      badge: { text: "Fixed", variant: "emerald" },
      icon: <ShieldCheck className="w-3.5 h-3.5 text-status-emerald" />,
    },
  ];

  const filteredGroups = groups.map((group) => {
    let pieces = group.pieces;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pieces = pieces.filter(
        (p) =>
          p.serialNumber.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.epcTag.toLowerCase().includes(q),
      );
    }
    if (filterState === "CART") {
      pieces = pieces.filter((p) => p.status === "IN_CART");
    } else if (filterState === "SOLITAIRE") {
      pieces = pieces.filter((p) => p.category.includes("Solitaire"));
    }
    return { ...group, pieces };
  });

  const handleSelectPiece = (
    piece: PosPieceData,
    group: PosSectionGroupData,
  ) => {
    setSelectedPiece(piece);
  };

  const handleToggleCart = (piece: PosPieceData) => {
    const pieceId = piece.id;
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        pieces: g.pieces.map((p) =>
          p.id === pieceId
            ? { ...p, status: p.status === "IN_CART" ? "AVAILABLE" : "IN_CART" }
            : p,
        ),
      })),
    );
    toast.info("Cart Updated", {
      description: "Piece added/removed from active checkout session.",
    });
  };

  const handleSelectClient = (client: ClientProfileData) => {
    setActiveClient(client);
  };

  const handleWeighCart = () => {
    setIsScanningScale(true);
    setTimeout(() => {
      setIsScanningScale(false);
      const wt = cartPieces.reduce((acc, p) => acc + p.grossWeightGrams, 0);
      toast.success("Scale Gravimetric Sweep Completed", {
        description: `Verified ${cartPieces.length} pieces on Mettler Toledo balance: Total ${wt.toFixed(3)}g (0.000g variance).`,
      });
    }, 600);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Atmospheric Luxury Hero Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-sm">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <span>Flagship Mumbai (INV-11)</span>
                <span>&gt;</span>
                <span className="text-gold font-medium">Showroom POS &amp; Clienteling</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
                  Point of Sale (POS) Showroom Terminal &amp; Clienteling
                </h1>
                <Badge variant="emerald" dot className="text-xs font-mono font-bold">
                  Terminal POS-01 Online
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10 text-xs font-mono">
                  Tax Invoice &amp; PMLA Compliant
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Ultra-High Metrology Point of Sale, Split-Tender Settlement, Gravimetric Mettler Toledo Scale Verification &amp; NIC E-Invoice Generation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedPiece) {
                    openSalonView(selectedPiece);
                  } else if (groups[0]?.pieces[0]) {
                    openSalonView(groups[0].pieces[0]);
                  }
                }}
                className="border-gold/30 hover:bg-gold/10 text-xs font-mono"
                title="Open Client-Facing VIP Salon Presentation View"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-gold" />
                <span>Salon View</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsClientModalOpen(true)}
                className="text-xs font-mono"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                <span>Select Client ({activeClient.name.split(" ")[1]})</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleWeighCart}
                isLoading={isScanningScale}
                className="text-xs font-mono shadow-md hover:shadow-lg transition-all"
              >
                <Scale className="w-3.5 h-3.5 mr-1" />
                <span>Weigh Cart on Scale</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Tactile Precision KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Today's Showroom Gross
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              ₹ {(todayGrossInr / 100000).toFixed(1)}{" "}
              <span className="text-sm text-gold font-normal font-sans">Lakh</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>+14.2% vs Daily Target</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Active Client Sessions
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <ShoppingBag className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {activeCartsCount}{" "}
              <span className="text-sm text-muted-foreground font-normal font-sans">Open Carts</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gold font-medium font-mono">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>VIP Private Salon Reserved</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Average Ticket Size (ATV)
              </span>
              <div className="p-1.5 rounded-lg bg-surface-elevated text-foreground border border-surface-border">
                <Scale className="h-4 w-4 text-foreground" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              ₹ {(averageTicketSizeInr / 100000).toFixed(2)}{" "}
              <span className="text-sm text-gold font-normal font-sans">Lakh</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium font-mono">
              <span>High Jewellery Segment</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Live Bullion Lock
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              Au 24K: ₹7,450<span className="text-xs text-muted-foreground font-normal font-sans">/g</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <span>Mid-Day MCX Fix Synced</span>
            </div>
          </Card>
        </div>

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <BillingInspector
              cartPieces={cartPieces}
              selectedPiece={selectedPiece}
              clientId={activeClient.id}
              clientName={activeClient.name}
              clientVipNumber={`VIP-${activeClient.id.slice(-4)}`}
              panNumber={`${activeClient.panNumber} (Verified)`}
              oldGoldCreditInr={124500}
              onClose={() => setSelectedPiece(null)}
              onAuthorizePayment={() => {
                setGroups((prev) =>
                  prev.map((g) => ({
                    ...g,
                    pieces: g.pieces.map((p) =>
                      p.status === "IN_CART"
                        ? { ...p, status: "AVAILABLE" as const }
                        : p,
                    ),
                  })),
                );
              }}
            />
          }
        >
          {/* Left Column (65%): Showcase & Cart Sections */}
          <div className="space-y-4">
            {/* Search & Segmented Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-surface-border bg-surface-card/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Serial #, Title, Diamond Carat, or EPC Tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-surface-elevated/60 text-xs font-mono"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated/70 border border-surface-border shrink-0 overflow-x-auto">
                {[
                  { id: "ALL", label: "All Vitrine Items" },
                  { id: "CART", label: `Cart (${cartPieces.length})` },
                  { id: "SOLITAIRE", label: "Solitaires" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFilterState(id)}
                    className={`px-3 py-1 rounded-lg font-mono text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      filterState === id
                        ? "bg-gold text-obsidian font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Hierarchical Showcase & Cart */}
            <div className="space-y-4">
              {filteredGroups.map((grp, idx) => (
                <CartSection
                  key={grp.id}
                  group={grp}
                  defaultExpanded={idx === 0}
                  selectedPieceId={selectedPiece?.id}
                  onSelectPiece={(piece, g) => handleSelectPiece(piece, g)}
                  onToggleCart={handleToggleCart}
                  onSalonView={openSalonView}
                />
              ))}
            </div>
          </div>
        </WorkstationLayout>

        {/* Modal for VIP Client Selection */}
        <ClientSelectModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSelectClient={handleSelectClient}
        />

        {/* Client-Facing Salon Presentation Modal */}
        {salonPiece && (
          <SalonPresentationModal
            isOpen={isSalonModalOpen}
            onClose={() => setIsSalonModalOpen(false)}
            piece={salonPiece}
            onAddToTray={(p) => {
              setGroups((prev) =>
                prev.map((g) => ({
                  ...g,
                  pieces: g.pieces.map((item) =>
                    item.serialNumber === p.serialNumber
                      ? { ...item, status: "IN_CART" as const }
                      : item,
                  ),
                })),
              );
              setIsSalonModalOpen(false);
              toast.success("Added to VIP Client Cart", {
                description: `${p.itemName} is now in the active checkout session.`,
              });
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
