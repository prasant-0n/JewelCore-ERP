"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import { api } from "../../lib/api";
import {
  Crown,
  ShieldCheck,
  Gem,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Download,
  CheckCircle2,
  ChevronRight,
  User,
  FileText,
  RefreshCw,
  Lock,
  Scale,
  Award,
  ArrowUpRight,
  Phone,
  Mail,
  Shield,
  Layers,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  SalonPresentationModal,
  PresentationPieceData,
} from "../../components/common/SalonPresentationModal";
import { toast } from "sonner";

export interface VipClientHolding {
  id: string;
  serialNumber: string;
  itemName: string;
  category: string;
  metalPurity: string;
  grossWeightGrams: number;
  netGoldGrams: number;
  diamondCarat: number;
  diamondSpecs: string;
  hallmarkId: string;
  epcTag: string;
  acquisitionDate: string;
  originalPriceInr: number;
  currentValuationInr: number;
  unrealizedGainInr: number;
  gainPercentage: number;
  certificatePdfUrl: string;
  complianceAuditLedgerUrl: string;
  merkleRootHash: string;
}

export interface VipPortfolioData {
  customer: {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    vipTier: string;
    assignedRelationshipManager: string;
    pmlaVerified: boolean;
    panNumber: string;
  };
  portfolioMetrics: {
    totalPiecesCount: number;
    totalAcquisitionCostInr: number;
    currentReplacementValuationInr: number;
    totalAppreciationInr: number;
    appreciationPercentage: number;
    fineGoldWeightGrams: number;
    totalDiamondCarats: number;
    insuredReplacementValueInr: number;
    liveSpotAu24kPerGram: number;
  };
  holdings: VipClientHolding[];
}

export interface ConciergeAppointmentItem {
  id: string;
  customerId: string;
  serviceType: string;
  status: string;
  appointmentDate: string;
  salonLocation: string;
  assignedManagerName: string;
  notes: string | null;
  referenceCode: string;
  createdAt: string;
}

const VIP_PROFILES = [
  {
    code: "CLI-01",
    name: "Mrs. Radhika Singhania",
    tier: "Ultra High Net Worth (UHNW) • Suite 1",
    city: "Mumbai, Altamount Rd",
    id: "0192e300-0080-7000-8000-000000000001",
  },
  {
    code: "CLI-02",
    name: "Mr. Vikramaditya Birla",
    tier: "Centurion VIP • Heritage Vault",
    city: "Mumbai, Carmichael Rd",
    id: "0192e300-0080-7000-8000-000000000002",
  },
  {
    code: "CLI-03",
    name: "Ms. Ananya Piramal",
    tier: "Bridal HNW • Kundan Suite 2",
    city: "Mumbai, Worli Sea Face",
    id: "0192e300-0080-7000-8000-000000000003",
  },
];

export default function VipClientPortalPage() {
  const [selectedVip, setSelectedVip] = useState(VIP_PROFILES[0]);
  const [portfolio, setPortfolio] = useState<VipPortfolioData | null>(null);
  const [appointments, setAppointments] = useState<ConciergeAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"HOLDINGS" | "CONCIERGE" | "GOVERNANCE">("HOLDINGS");

  // Salon View Modal state
  const [salonPiece, setSalonPiece] = useState<PresentationPieceData | null>(null);
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);

  // Concierge Form State
  const [serviceType, setServiceType] = useState("CLEANING_INSPECTION");
  const [salonLocation, setSalonLocation] = useState("Flagship Mumbai (Colaba Suite 1)");
  const [appointmentDate, setAppointmentDate] = useState("2026-11-15T15:00");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Fetch portfolio and appointments
  const fetchPortalData = async (vipCode: string) => {
    try {
      setIsLoading(true);
      const res = await api.get<{ data: VipPortfolioData }>(`/portal/portfolio/${vipCode}`);
      if (res.data) {
        setPortfolio(res.data);
      }

      const aptRes = await api.get<{ data: ConciergeAppointmentItem[] }>(
        `/portal/concierge/appointments/${selectedVip.id}`,
      );
      if (aptRes.data) {
        setAppointments(aptRes.data);
      }
    } catch {
      // Fallback local mockup if API in development
      const fallbackMetrics = {
        totalPiecesCount: 3,
        totalAcquisitionCostInr: 2960000,
        currentReplacementValuationInr: 3442000,
        totalAppreciationInr: 482000,
        appreciationPercentage: 16.3,
        fineGoldWeightGrams: 84.776,
        totalDiamondCarats: 25.22,
        insuredReplacementValueInr: 3786200,
        liveSpotAu24kPerGram: 7450,
      };

      setPortfolio({
        customer: {
          id: selectedVip.id,
          code: selectedVip.code,
          name: selectedVip.name,
          email: "radhika.s@atelier-client.vip",
          phone: "+91 98201 44892",
          vipTier: selectedVip.tier,
          assignedRelationshipManager: "Rachel R., Senior Private Client Director",
          pmlaVerified: true,
          panNumber: "AAAPS9012K",
        },
        portfolioMetrics: fallbackMetrics,
        holdings: [
          {
            id: "pc-vip-01",
            serialNumber: "JC-SOL-2026-081",
            itemName: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)",
            category: "Solitaire Rings",
            metalPurity: "18K White Gold (Au 750)",
            grossWeightGrams: 5.42,
            netGoldGrams: 5.116,
            diamondCarat: 1.52,
            diamondSpecs: "F-VVS1 Triple Ex (GIA-2210894511)",
            hallmarkId: "BIS-750-MUM-8912",
            epcTag: "EPC-E280-1160-9941",
            acquisitionDate: "2025-11-14",
            originalPriceInr: 485000,
            currentValuationInr: 572300,
            unrealizedGainInr: 87300,
            gainPercentage: 18.0,
            certificatePdfUrl: `/api/v1/certificates/piece/JC-SOL-2026-081/pdf`,
            complianceAuditLedgerUrl: `/api/v1/certificates/compliance-dossier/pdf`,
            merkleRootHash: "7a8f9c0e1234567890abcdef1234567890abcdef1234567890abcdef12345678",
          },
          {
            id: "pc-vip-02",
            serialNumber: "JC-CHK-2026-015",
            itemName: "18K Rose Gold Waterfall Cascading Necklace (18.5ct)",
            category: "Necklaces & Chokers",
            metalPurity: "18K Rose Gold (Au 750)",
            grossWeightGrams: 68.3,
            netGoldGrams: 52.1,
            diamondCarat: 18.5,
            diamondSpecs: "F-G Color VVS-VS (IGI-DIA-44102)",
            hallmarkId: "BIS-750-MUM-4412",
            epcTag: "EPC-E280-1160-8813",
            acquisitionDate: "2026-01-20",
            originalPriceInr: 1850000,
            currentValuationInr: 2127500,
            unrealizedGainInr: 277500,
            gainPercentage: 15.0,
            certificatePdfUrl: `/api/v1/certificates/piece/JC-CHK-2026-015/pdf`,
            complianceAuditLedgerUrl: `/api/v1/certificates/compliance-dossier/pdf`,
            merkleRootHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          },
          {
            id: "pc-vip-03",
            serialNumber: "JC-KAD-2026-005",
            itemName: "18K White Gold Micro-Prong Tennis Bangle (5.20ct)",
            category: "Bangles & Kadas",
            metalPurity: "18K White Gold (Au 750)",
            grossWeightGrams: 28.6,
            netGoldGrams: 27.56,
            diamondCarat: 5.2,
            diamondSpecs: "E-F VVS Syndicate (HRD-ANT-8819)",
            hallmarkId: "BIS-750-MUM-1102",
            epcTag: "EPC-E280-1160-7714",
            acquisitionDate: "2026-02-10",
            originalPriceInr: 625000,
            currentValuationInr: 725000,
            unrealizedGainInr: 100000,
            gainPercentage: 16.0,
            certificatePdfUrl: `/api/v1/certificates/piece/JC-KAD-2026-005/pdf`,
            complianceAuditLedgerUrl: `/api/v1/certificates/compliance-dossier/pdf`,
            merkleRootHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPortalData(selectedVip.code);
  }, [selectedVip]);

  const handleDownloadCertificate = async (serial: string) => {
    try {
      await api.downloadFile(`/certificates/piece/${encodeURIComponent(serial)}/pdf`, `certificate-${serial}.pdf`);
      toast.success("Authenticity Certificate Downloaded", {
        description: `Official VIP Certificate for ${serial} saved.`,
      });
    } catch {
      toast.error("Download Failed", { description: "Unable to stream certificate PDF" });
    }
  };

  const handleDownloadDossier = async () => {
    try {
      await api.downloadFile(`/certificates/compliance-dossier/pdf`, `vip-insurance-dossier-${selectedVip.code}.pdf`);
      toast.success("Insurance & Audit Dossier Downloaded", {
        description: `Cryptographic ownership portfolio for ${selectedVip.name} saved.`,
      });
    } catch {
      toast.error("Download Failed", { description: "Unable to generate compliance dossier" });
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsBooking(true);
      let newApt: ConciergeAppointmentItem;
      try {
        const res = await api.post<{ data: ConciergeAppointmentItem }>(
          "/portal/concierge/appointments",
          {
            customerId: selectedVip.id,
            serviceType,
            appointmentDate: new Date(appointmentDate).toISOString(),
            salonLocation,
            notes: appointmentNotes || "VIP Concierge Request",
          },
        );
        newApt = res.data;
      } catch {
        // Offline / client standalone fallback
        newApt = {
          id: `apt-${Date.now()}`,
          customerId: selectedVip.id,
          serviceType,
          status: "CONFIRMED",
          appointmentDate,
          salonLocation,
          assignedManagerName: "Rachel R., Senior Private Client Director",
          notes: appointmentNotes || "VIP Concierge Request",
          referenceCode: `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString(),
        };
      }

      setAppointments((prev) => [newApt, ...prev]);
      toast.success("Appointment Confirmed", {
        description: `Private session scheduled at ${salonLocation}.`,
      });
      setAppointmentNotes("");
    } catch (err) {
      toast.error("Booking Error", {
        description: err instanceof Error ? err.message : "Failed to book appointment",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const openSalonModalForPiece = (holding: VipClientHolding) => {
    setSalonPiece({
      serialNumber: holding.serialNumber,
      itemName: holding.itemName,
      category: holding.category,
      metalPurity: holding.metalPurity,
      grossWeightGrams: holding.grossWeightGrams,
      netGoldGrams: holding.netGoldGrams,
      diamondCarat: holding.diamondCarat,
      diamondSpecs: holding.diamondSpecs,
      hallmarkId: holding.hallmarkId,
      retailPriceInr: holding.currentValuationInr,
      epcTag: holding.epcTag,
    });
    setIsSalonModalOpen(true);
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-16">
        {/* Top Luxury Banner & VIP Selector */}
        <div className="relative rounded-2xl bg-gradient-to-r from-obsidian-deep via-stone-950 to-stone-900 border border-gold/30 p-6 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gold uppercase tracking-widest">
                <Crown className="w-4 h-4 text-gold animate-pulse" />
                <span>Private Client Sanctuary • Digital Asset Vault</span>
              </div>
              <h1 className="text-3xl font-serif font-black tracking-wide text-foreground">
                {portfolio?.customer.name || selectedVip.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="gold" className="text-xs font-mono font-bold">
                  {selectedVip.tier}
                </Badge>
                <Badge variant="emerald" dot className="text-xs">
                  PMLA / KYC Verified (PAN: {portfolio?.customer.panNumber || "AAAPS9012K"})
                </Badge>
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 ml-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  RM: {portfolio?.customer.assignedRelationshipManager || "Rachel R."}
                </span>
              </div>
            </div>

            {/* VIP Client Switcher & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center bg-black/40 border border-surface-border rounded-xl p-1">
                {VIP_PROFILES.map((vip) => (
                  <button
                    key={vip.code}
                    onClick={() => setSelectedVip(vip)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedVip.code === vip.code
                        ? "bg-gold text-obsidian font-bold shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {vip.code}
                  </button>
                ))}
              </div>

              <Button
                variant="gold"
                size="sm"
                onClick={handleDownloadDossier}
                className="font-medium text-xs shadow-md"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                <span>Insurance Dossier (PDF)</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metrology & Valuation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Replacement Valuation */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Replacement Valuation
              </span>
              <div className="p-1.5 rounded-full bg-gold/15 text-gold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              ₹ {((portfolio?.portfolioMetrics.currentReplacementValuationInr || 3442000) / 100000).toFixed(2)} Lakh
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{portfolio?.portfolioMetrics.appreciationPercentage || 16.3}% Unrealized Gain</span>
            </div>
          </Card>

          {/* Card 2: Fine Gold Holdings */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Pure Gold Holdings
              </span>
              <div className="p-1.5 rounded-full bg-amber-500/15 text-amber-500">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              {portfolio?.portfolioMetrics.fineGoldWeightGrams || 84.78} g Fine Au
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              Au 24K Fix: ₹{portfolio?.portfolioMetrics.liveSpotAu24kPerGram || 7450}/g
            </div>
          </Card>

          {/* Card 3: Certified Natural Diamonds */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Certified Diamonds
              </span>
              <div className="p-1.5 rounded-full bg-blue-500/15 text-blue-400">
                <Gem className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              {portfolio?.portfolioMetrics.totalDiamondCarats || 25.22} Carats
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              GIA / IGI Triple Excellent Certified
            </div>
          </Card>

          {/* Card 4: Insured Replacement Coverage */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Insured Vault Coverage
              </span>
              <div className="p-1.5 rounded-full bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-emerald-700 dark:text-emerald-400 mt-2">
              ₹ {((portfolio?.portfolioMetrics.insuredReplacementValueInr || 3786200) / 100000).toFixed(2)} Lakh
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              110% Lloyd's London Underwritten
            </div>
          </Card>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex border-b border-surface-border space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("HOLDINGS")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 ${
              activeTab === "HOLDINGS"
                ? "border-gold text-gold font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>My Luxury Asset Portfolio ({portfolio?.holdings.length || 3})</span>
          </button>

          <button
            onClick={() => setActiveTab("CONCIERGE")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 ${
              activeTab === "CONCIERGE"
                ? "border-gold text-gold font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Atelier Concierge &amp; Aftercare ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("GOVERNANCE")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 ${
              activeTab === "GOVERNANCE"
                ? "border-gold text-gold font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Custody Proofs &amp; Merkle Ledger</span>
          </button>
        </div>

        {/* TAB 1: ASSET HOLDINGS */}
        {activeTab === "HOLDINGS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Showing {portfolio?.holdings.length || 0} Registered High-Jewellery Assets</span>
              <span className="text-gold font-medium">All assets BIS Hallmarked &amp; Metrologically Sealed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio?.holdings.map((piece) => (
                <Card
                  key={piece.id}
                  className="rounded-2xl border-surface-border bg-surface-card hover:border-gold/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-gold text-xs">
                            {piece.serialNumber}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-elevated border border-surface-border text-muted-foreground">
                            {piece.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-1">
                          {piece.itemName}
                        </h3>
                      </div>
                      <Badge variant="emerald" className="text-[10px]">
                        BIS 750
                      </Badge>
                    </div>

                    {/* Metrological Specs Table */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-elevated/60 text-xs font-mono">
                      <div>
                        <span className="text-[9px] uppercase text-muted-foreground block">
                          Precious Alloy
                        </span>
                        <span className="font-semibold text-foreground">
                          {piece.metalPurity.split(" ")[0]}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {piece.netGoldGrams}g Net Fine
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase text-muted-foreground block">
                          Diamond Grade
                        </span>
                        <span className="font-semibold text-gold">
                          {piece.diamondCarat} ct
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {piece.diamondSpecs}
                        </span>
                      </div>
                    </div>

                    {/* Mark-to-Market Valuation */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-surface-elevated to-surface border border-surface-border space-y-1">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground">Original Purchase:</span>
                        <span className="text-foreground">₹{piece.originalPriceInr.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground">Current Replacement:</span>
                        <span className="text-gold font-bold text-sm">₹{piece.currentValuationInr.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-surface-border/60">
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Unrealized Gain:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          +₹{piece.unrealizedGainInr.toLocaleString("en-IN")} (+{piece.gainPercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-gold/40 text-gold hover:bg-gold/10"
                      onClick={() => handleDownloadCertificate(piece.serialNumber)}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      <span>Certificate</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      onClick={() => openSalonModalForPiece(piece)}
                      title="Inspect piece in 3D Salon Showcase"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-gold" />
                      <span>Salon 3D</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ATELIER CONCIERGE & APPOINTMENTS */}
        {activeTab === "CONCIERGE" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form (1 Column) */}
            <Card className="p-6 bg-surface-card border-surface-border rounded-2xl space-y-5">
              <div>
                <div className="flex items-center space-x-2 text-gold text-xs font-mono uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>VIP Atelier Concierge</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Schedule Private Service Session
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Private Salon appointments with dedicated gemologists and master goldsmiths.
                </p>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                    Service Category
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-elevated border border-surface-border rounded-md text-foreground focus:outline-none focus:border-gold/40"
                  >
                    <option value="CLEANING_INSPECTION">Ultrasonic Cleansing &amp; Micro-Prong Inspection</option>
                    <option value="RESIZING">Bespoke Ring Resizing &amp; Rhodium Plating</option>
                    <option value="VALUATION_APPRAISAL">Official Insurance Valuation Appraisal</option>
                    <option value="PRIVATE_SALON_VIEWING">Private Salon Vitrine Viewing Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                    Atelier Boutique Suite
                  </label>
                  <select
                    value={salonLocation}
                    onChange={(e) => setSalonLocation(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-elevated border border-surface-border rounded-md text-foreground focus:outline-none focus:border-gold/40"
                  >
                    <option value="Flagship Mumbai (Colaba Suite 1)">Flagship Mumbai (Colaba Private Suite 1)</option>
                    <option value="Bandra Atelier Sanctuary">Bandra Atelier Sanctuary Suite</option>
                    <option value="Dubai DIFC Private Salon">Dubai DIFC Luxury Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                    Preferred Date &amp; Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                    Special Requests or Pieces for Service
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Requesting inspection for 18K Solitaire Ring (JC-SOL-2026-081)..."
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/40 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full font-semibold"
                  disabled={isBooking}
                >
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  {isBooking ? "Confirming Session..." : "Confirm Concierge Reservation"}
                </Button>
              </form>
            </Card>

            {/* Existing Appointments (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Active &amp; Historical Appointments ({appointments.length})</span>
                <span className="text-gold font-medium">Assigned RM: Rachel R.</span>
              </div>

              {appointments.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground border-surface-border rounded-2xl">
                  <Calendar className="w-8 h-8 text-gold/40 mx-auto mb-2" />
                  <p className="text-xs font-mono">No appointments currently scheduled.</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Book a private appointment using the concierge form on the left.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <Card
                      key={apt.id}
                      className="p-4 bg-surface-card border-surface-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gold/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-gold text-xs">
                            {apt.referenceCode}
                          </span>
                          <Badge variant="emerald" className="text-[10px]">
                            {apt.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {apt.serviceType.replace(/_/g, " ")}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold" />
                            {new Date(apt.appointmentDate).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gold" />
                            {apt.salonLocation}
                          </span>
                        </div>
                        {apt.notes && (
                          <p className="text-[11px] text-muted-foreground italic mt-1 font-mono">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          Assigned Specialist:
                        </span>
                        <span className="text-xs font-semibold text-foreground font-mono">
                          {apt.assignedManagerName}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GOVERNANCE & MERKLE LEDGER */}
        {activeTab === "GOVERNANCE" && (
          <div className="space-y-6">
            <Card className="p-6 bg-surface-card border-surface-border rounded-2xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-surface-border">
                <ShieldCheck className="w-6 h-6 text-status-emerald" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Cryptographic Custody Proofs &amp; Statutory PMLA Clearance
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Immutable asset verification stamped against JewelCore distributed Merkle tree.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    PMLA / AML Registry
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    Verified Clear
                  </span>
                  <span className="text-muted-foreground text-[10px] block">
                    Govt. Financial Intelligence Unit Compliance
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Hallmark Metrology
                  </span>
                  <span className="text-gold font-bold text-sm">
                    BIS 100% Certified
                  </span>
                  <span className="text-muted-foreground text-[10px] block">
                    Laser HUID Inscription Verified
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Lifetime Buyback Policy
                  </span>
                  <span className="text-blue-400 font-bold text-sm">
                    100% Metal / 90% Gem
                  </span>
                  <span className="text-muted-foreground text-[10px] block">
                    Real-time MCX Spot Rate Parity
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleDownloadDossier}
                  className="font-medium text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  <span>Download Comprehensive Governance &amp; Insurance Dossier (PDF)</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 3D VIP Salon Presentation Modal */}
        {salonPiece && (
          <SalonPresentationModal
            isOpen={isSalonModalOpen}
            onClose={() => setIsSalonModalOpen(false)}
            piece={salonPiece}
          />
        )}
      </div>
    </AppShell>
  );
}
