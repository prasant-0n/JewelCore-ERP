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
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

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
        diamondSpecs: "G-VS1 (IGI-DIA-55919)",
        metalValueInr: 202300.0,
        diamondValueInr: 285000.0,
        makingChargeInr: 52700.0,
        totalPriceInr: 540000.0,
        status: "SAVED_FOR_TRIAL",
        epcTag: "EPC-E280-1160-7712",
        hallmarkId: "BIS-750-MUM-9912",
      },
    ],
  },
  {
    id: "grp-vitrine",
    sectionTitle: "Showroom Vitrine Showcase (Ready-for-Sale Pieces)",
    clientTag: "Tray 01-04 Synced",
    description: "42 Units in Active UHF RFID Mesh Trays",
    status: "VITRINE_LIVE",
    pieces: [
      {
        id: "pc-sol-02",
        serialNumber: "JC-SOL-2026-082",
        itemName: "18K Cushion Halo Ring (2.01ct D-VVS2)",
        category: "Solitaire Rings",
        metalPurity: "18K Yellow Gold (Au 750)",
        grossWeightGrams: 6.84,
        netGoldGrams: 6.438,
        diamondCarat: 2.01,
        diamondSpecs: "D-VVS2 (GIA-5591230044)",
        metalValueInr: 47250.0,
        diamondValueInr: 785000.0,
        makingChargeInr: 57750.0,
        totalPriceInr: 890000.0,
        status: "AVAILABLE",
        epcTag: "EPC-E280-1160-9942",
        hallmarkId: "BIS-750-MUM-8913",
      },
      {
        id: "pc-nk-01",
        serialNumber: "JC-CHK-2026-014",
        itemName: "22K Antique Heritage Jadau Choker with Polki",
        category: "Necklaces & Chokers",
        metalPurity: "22K Yellow Gold (Au 916)",
        grossWeightGrams: 94.65,
        netGoldGrams: 78.2,
        diamondCarat: 14.2,
        diamondSpecs: "Natural Polki (IGI-JAD-99120)",
        metalValueInr: 525800.0,
        diamondValueInr: 475000.0,
        makingChargeInr: 139200.0,
        totalPriceInr: 1140000.0,
        status: "AVAILABLE",
        epcTag: "EPC-E280-1160-8812",
        hallmarkId: "BIS-916-MUM-1102",
      },
    ],
  },
];

export default function PosShowroomPage() {
  const [groups, setGroups] =
    useState<PosSectionGroupData[]>(INITIAL_POS_GROUPS);
  const [selectedPiece, setSelectedPiece] = useState<PosPieceData | null>(
    INITIAL_POS_GROUPS[0].pieces[0]
  );
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Extract cart pieces (items with status 'IN_CART')
  const cartPieces = groups
    .flatMap((g) => g.pieces)
    .filter((p) => p.status === "IN_CART");

  // Summary Metrics
  const todayGrossInr = 4285400;
  const activeCartsCount = 3;
  const averageTicketSizeInr = 357110;
  const liveGoldFix = "24K @ ₹7,340.50 / g";

  // Filter logic
  const filteredGroups = groups.map((grp) => {
    let pieces = grp.pieces;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pieces = pieces.filter(
        (p) =>
          p.serialNumber.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q) ||
          p.epcTag.toLowerCase().includes(q)
      );
    }
    if (filterState === "CART") {
      pieces = pieces.filter((p) => p.status === "IN_CART");
    } else if (filterState === "SOLITAIRE") {
      pieces = pieces.filter((p) => (p.diamondCarat ?? 0) > 0);
    } else if (filterState === "BRANGLES") {
      pieces = pieces.filter((p) => p.category.includes("Bangles"));
    }
    return { ...grp, pieces };
  });

  const handleSelectPiece = (
    piece: PosPieceData,
    group: PosSectionGroupData
  ) => {
    setSelectedPiece(piece);
  };

  const handleToggleCart = (piece: PosPieceData) => {
    const nextStatus = piece.status === "IN_CART" ? "AVAILABLE" : "IN_CART";
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        pieces: g.pieces.map((p) =>
          p.id === piece.id ? { ...p, status: nextStatus } : p
        ),
      }))
    );
    setSelectedPiece((prev) =>
      prev?.id === piece.id ? { ...prev, status: nextStatus } : prev
    );
  };

  const handleQuickScan = () => {
    // Add trial bangle to cart
    setScanNotification("RFID Handheld Wand Scan detected: JC-KAD-2026-005 (Tennis Bangle) added to cart!");
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        pieces: g.pieces.map((p) =>
          p.id === "pc-bg-02" ? { ...p, status: "IN_CART" as const } : p
        ),
      }))
    );
    setTimeout(() => setScanNotification(null), 3500);
  };

  const handleSelectClient = (client: ClientProfileData) => {
    setActiveClient(client);
    setGroups((prev) =>
      prev.map((g, idx) =>
        idx === 0
          ? {
              ...g,
              sectionTitle: `Active Salon Cart: ${client.name}`,
              clientTag: client.vipTier.split(" ")[0] + " Tier",
            }
          : g
      )
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, Register Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/60">
              <span>JewelCore ERP</span>
              <span>/</span>
              <span>Commercial & Showroom</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Point of Sale (POS) Terminal & Clienteling
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Showroom Register #01 • Private Salon Workstation</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Register #01 • Cash Drawer & Ingenico NFC Connected • 99.98% Sync
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-platinum/70" />
              <span>+ Select VIP Client</span>
            </button>

            <button
              onClick={handleQuickScan}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              <Scan className="w-4 h-4 text-obsidian" />
              <span>Quick Barcode / RFID Scan</span>
            </button>
          </div>
        </div>

        {/* Scan Status Notification Banner */}
        {scanNotification && (
          <div className="p-3 rounded-xl bg-surface-card border border-gold/40 flex items-center justify-between text-xs font-mono text-gold animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>{scanNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              RFID Synced
            </span>
          </div>
        )}

        {/* 4 Metric KPI Cards matching Screen 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Today's Showroom Gross</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
              ₹ {todayGrossInr.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>+14.2% vs Daily Target</span>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Active Client Sessions</span>
              <ShoppingBag className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-gold tracking-tight">
              {activeCartsCount} Open Carts
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              VIP Private Salon Reserved
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Average Ticket Size (ATV)</span>
              <Scale className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight tabular-nums">
              ₹ {averageTicketSizeInr.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              High Jewellery Segment
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Live Bullion Lock</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {liveGoldFix}
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Mid-Day MCX Fix Synced
            </div>
          </div>
        </div>

        {/* Master Workspace: 65% Directory + 35% Sticky Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (65% -> col-span-12 lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-platinum/50" />
                <input
                  type="text"
                  placeholder="Filter by Serial #, Title, Diamond Carat, or EPC Tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-slate-100 placeholder:text-platinum/40 focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono">
                <button
                  onClick={() => setFilterState("ALL")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "ALL"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  All Vitrine Items
                </button>
                <button
                  onClick={() => setFilterState("CART")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "CART"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Cart Items ({cartPieces.length})
                </button>
                <button
                  onClick={() => setFilterState("SOLITAIRE")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "SOLITAIRE"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Solitaires
                </button>
                <button
                  onClick={() => setFilterState("BRANGLES")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "BRANGLES"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Bangles
                </button>
              </div>
            </div>

            {/* Hierarchical Cart & Showcase Sections */}
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

              {filteredGroups.every((g) => g.pieces.length === 0) && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <ShoppingBag className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching jewellery pieces found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or scan another tray.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <BillingInspector
              cartPieces={cartPieces}
              selectedPiece={selectedPiece}
              clientName={activeClient.name}
              clientVipNumber={`VIP-${activeClient.id.slice(-4)}`}
              panNumber={`${activeClient.panNumber} (Verified)`}
              oldGoldCreditInr={124500}
              onClose={() => setSelectedPiece(null)}
              onAuthorizePayment={() => {
                // Clear cart items or mark as sold
                setGroups((prev) =>
                  prev.map((g) => ({
                    ...g,
                    pieces: g.pieces.map((p) =>
                      p.status === "IN_CART" ? { ...p, status: "AVAILABLE" as const } : p
                    ),
                  }))
                );
              }}
            />
          </div>
        </div>

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
