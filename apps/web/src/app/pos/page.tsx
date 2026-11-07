"use client";

import React, { useState } from "react";
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
  ShoppingBag,
  CreditCard,
  Scale,
  ShieldCheck,
  Search,
  Plus,
  Scan,
  TrendingUp,
  UserCheck,
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
        {/* Top Subheader: Breadcrumbs, VIP Client Context & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Showroom POS &amp; Clienteling
              </span>
              <Badge variant="emerald" dot className="ml-2">
                Terminal POS-01 Online • Tax Invoice Compliant
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Point of Sale (POS) Showroom Terminal &amp; Clienteling
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsClientModalOpen(true)}
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              <span>Select Client ({activeClient.name.split(" ")[1]})</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleWeighCart}
              isLoading={isScanningScale}
            >
              <Scale className="w-3.5 h-3.5 mr-1" />
              <span>Weigh Cart on Scale</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <WorkstationKpiGrid items={posKpis} />

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
            {/* Search & Filter Toolbar */}
            <Card className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Serial #, Title, Diamond Carat, or EPC Tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Vitrine Items" },
                  { id: "CART", label: `Cart (${cartPieces.length})` },
                  { id: "SOLITAIRE", label: "Solitaires" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFilterState(id)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all whitespace-nowrap ${
                      filterState === id
                        ? "bg-gold text-black font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground bg-surface-elevated border border-surface-border"
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
      </div>
    </AppShell>
  );
}
