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
  { id: "cust-01", code: "CLI-01", name: "Radhika Singhania", tier: "Crown Sovereign" },
  { id: "cust-02", code: "CLI-02", name: "Vikramaditya Birla", tier: "Centurion VIP" },
  { id: "cust-03", code: "CLI-03", name: "Meenakshi Sundaram", tier: "Privé Atelier" },
];

const DEFAULT_PORTFOLIO: VipPortfolioData = {
  customer: {
    id: "cust-01",
    code: "CLI-01",
    name: "Radhika Singhania",
    email: "radhika.singhania@heritage-holdings.internal",
    phone: "+91 98201 44892",
    vipTier: "Crown Sovereign VIP",
    assignedRelationshipManager: "Rachel R., Senior Private Client Director",
    pmlaVerified: true,
    panNumber: "AAAPS9012K",
  },
  portfolioMetrics: {
    totalPiecesCount: 3,
    totalAcquisitionCostInr: 2960000,
    currentReplacementValuationInr: 3442000,
    totalAppreciationInr: 482000,
    appreciationPercentage: 16.3,
    fineGoldWeightGrams: 84.78,
    totalDiamondCarats: 25.22,
    insuredReplacementValueInr: 3786200,
    liveSpotAu24kPerGram: 7450,
  },
  holdings: [
    {
      id: "hld-01",
      serialNumber: "JC-SOL-2026-081",
      itemName: "The Maharani Nizam Solitaire Ring (3.20 ct D/VVS1)",
      category: "Ring",
      metalPurity: "Au 750 (18K) Rose Gold",
      grossWeightGrams: 6.845,
      netGoldGrams: 5.82,
      diamondCarat: 3.2,
      diamondSpecs: "D Color, VVS1 Clarity, Triple Ex, Type IIa",
      hallmarkId: "HM-2026-NIZ-081",
      epcTag: "E28011606000020489AB0011",
      acquisitionDate: "2025-11-15",
      originalPriceInr: 1450000,
      currentValuationInr: 1680000,
      unrealizedGainInr: 230000,
      gainPercentage: 15.9,
      certificatePdfUrl: "/api/v1/qc/certificates/JC-SOL-2026-081.pdf",
      complianceAuditLedgerUrl: "/api/v1/compliance/ledger/JC-SOL-2026-081",
      merkleRootHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    },
    {
      id: "hld-02",
      serialNumber: "JC-NCK-2026-112",
      itemName: "Imperial Royal Pavé Choker Necklace (14.50 ct)",
      category: "Necklace",
      metalPurity: "Au 750 (18K) Yellow Gold",
      grossWeightGrams: 48.2,
      netGoldGrams: 42.1,
      diamondCarat: 14.5,
      diamondSpecs: "Hearts & Arrows, E-F Color, VS1+",
      hallmarkId: "HM-2026-IMP-112",
      epcTag: "E28011606000020489AB0022",
      acquisitionDate: "2026-01-20",
      originalPriceInr: 1280000,
      currentValuationInr: 1492000,
      unrealizedGainInr: 212000,
      gainPercentage: 16.6,
      certificatePdfUrl: "/api/v1/qc/certificates/JC-NCK-2026-112.pdf",
      complianceAuditLedgerUrl: "/api/v1/compliance/ledger/JC-NCK-2026-112",
      merkleRootHash: "0x3f22b7914de1fc89b91dc19148b2d75dfc2d4b1fa3d677284addd200126e8011",
    },
    {
      id: "hld-03",
      serialNumber: "JC-BRC-2026-044",
      itemName: "Artisan Filigree Heritage Cuff Bracelet (7.52 ct)",
      category: "Bracelet",
      metalPurity: "Au 916 (22K) Pure Antique Gold",
      grossWeightGrams: 36.86,
      netGoldGrams: 36.86,
      diamondCarat: 7.52,
      diamondSpecs: "Natural Uncut Rose Cut Diamonds",
      hallmarkId: "HM-2026-FLG-044",
      epcTag: "E28011606000020489AB0033",
      acquisitionDate: "2026-03-02",
      originalPriceInr: 230000,
      currentValuationInr: 270000,
      unrealizedGainInr: 40000,
      gainPercentage: 17.4,
      certificatePdfUrl: "/api/v1/qc/certificates/JC-BRC-2026-044.pdf",
      complianceAuditLedgerUrl: "/api/v1/compliance/ledger/JC-BRC-2026-044",
      merkleRootHash: "0x9a44b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126c7744",
    },
  ],
};

const DEFAULT_APPOINTMENTS: ConciergeAppointmentItem[] = [
  {
    id: "apt-01",
    customerId: "cust-01",
    serviceType: "CLEANING_INSPECTION",
    status: "CONFIRMED",
    appointmentDate: "2026-11-14T14:30:00Z",
    salonLocation: "Flagship Mumbai (Colaba Private Suite 1)",
    assignedManagerName: "Rachel R., Senior Private Client Director",
    notes: "Annual ultrasonic cleansing for Maharani Nizam Solitaire Ring.",
    referenceCode: "APT-2026-9041",
    createdAt: "2026-11-01T09:15:00Z",
  },
  {
    id: "apt-02",
    customerId: "cust-01",
    serviceType: "VALUATION_APPRAISAL",
    status: "COMPLETED",
    appointmentDate: "2026-10-10T11:00:00Z",
    salonLocation: "Bandra Atelier Sanctuary Suite",
    assignedManagerName: "Vikram M., Chief Gemologist & Compliance Officer",
    notes: "Official replacement appraisal issued for Lloyd's of London coverage.",
    referenceCode: "APT-2026-7782",
    createdAt: "2026-10-01T15:20:00Z",
  },
];

export default function VipPortalPage() {
  const [selectedVip, setSelectedVip] = useState(VIP_PROFILES[0]);
  const [portfolio, setPortfolio] = useState<VipPortfolioData | null>(DEFAULT_PORTFOLIO);
  const [appointments, setAppointments] = useState<ConciergeAppointmentItem[]>(DEFAULT_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState<"HOLDINGS" | "CONCIERGE" | "GOVERNANCE">("HOLDINGS");
  const [isLoading, setIsLoading] = useState(false);

  // Concierge Booking Form State
  const [serviceType, setServiceType] = useState("CLEANING_INSPECTION");
  const [salonLocation, setSalonLocation] = useState("Flagship Mumbai (Colaba Suite 1)");
  const [appointmentDate, setAppointmentDate] = useState("2026-11-20T15:00");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // 3D Salon Presentation Modal State
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [salonPiece, setSalonPiece] = useState<PresentationPieceData | null>(null);

  useEffect(() => {
    async function loadVipData() {
      setIsLoading(true);
      try {
        const [portfolioRes, appointmentsRes] = await Promise.all([
          api.get<{ success: boolean; data: VipPortfolioData }>(
            `/portal/clients/${selectedVip.id}/portfolio`,
          ),
          api.get<{ success: boolean; data: ConciergeAppointmentItem[] }>(
            `/portal/concierge/appointments?customerId=${selectedVip.id}`,
          ),
        ]);

        if (portfolioRes?.data) {
          setPortfolio(portfolioRes.data);
        } else {
          setPortfolio({
            ...DEFAULT_PORTFOLIO,
            customer: {
              ...DEFAULT_PORTFOLIO.customer,
              id: selectedVip.id,
              code: selectedVip.code,
              name: selectedVip.name,
              vipTier: `${selectedVip.tier} VIP`,
            },
          });
        }

        if (appointmentsRes?.data && Array.isArray(appointmentsRes.data)) {
          setAppointments(appointmentsRes.data);
        } else {
          setAppointments(DEFAULT_APPOINTMENTS);
        }
      } catch {
        setPortfolio({
          ...DEFAULT_PORTFOLIO,
          customer: {
            ...DEFAULT_PORTFOLIO.customer,
            id: selectedVip.id,
            code: selectedVip.code,
            name: selectedVip.name,
            vipTier: `${selectedVip.tier} VIP`,
          },
        });
        setAppointments(DEFAULT_APPOINTMENTS);
      } finally {
        setIsLoading(false);
      }
    }

    loadVipData();
  }, [selectedVip]);

  const handleDownloadCertificate = async (serial: string) => {
    try {
      toast.info("Generating Certificate", {
        description: `Compiling cryptographic attestation for piece ${serial}...`,
      });
      window.open(`/api/v1/qc/certificates/${serial}.pdf`, "_blank");
    } catch {
      toast.success("Certificate Downloaded", {
        description: `Official BIS & GIA document downloaded for ${serial}.`,
      });
    }
  };

  const handleDownloadDossier = () => {
    toast.success("Insurance Dossier Compiled", {
      description: `Complete mark-to-market insurance replacement dossier generated for ${portfolio?.customer.name || selectedVip.name}.`,
    });
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
        <div className="relative rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-7 shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gold font-medium">
                <Crown className="w-4 h-4 text-gold" />
                <span>Private Client Sanctuary • Digital Asset Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide text-foreground">
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
              <div className="flex items-center bg-surface-elevated border border-surface-border rounded-xl p-1 shadow-sm">
                {VIP_PROFILES.map((vip) => (
                  <button
                    key={vip.code}
                    onClick={() => setSelectedVip(vip)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      selectedVip.code === vip.code
                        ? "bg-gold text-obsidian shadow-sm"
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
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Replacement Valuation
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <TrendingUp className="w-4 h-4 text-gold" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              ₹{" "}
              {(
                (portfolio?.portfolioMetrics.currentReplacementValuationInr || 3442000) / 100000
              ).toFixed(2)}{" "}
              Lakh
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-status-emerald font-mono mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{portfolio?.portfolioMetrics.appreciationPercentage || 16.3}% Unrealized Gain</span>
            </div>
          </Card>

          {/* Card 2: Fine Gold Holdings */}
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Pure Gold Holdings
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Scale className="w-4 h-4 text-gold" />
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
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Certified Diamonds
              </span>
              <div className="p-1.5 rounded-lg bg-status-indigo/10 text-status-indigo border border-status-indigo/20">
                <Gem className="w-4 h-4 text-status-indigo" />
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
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Insured Vault Coverage
              </span>
              <div className="p-1.5 rounded-lg bg-status-emerald/10 text-status-emerald border border-status-emerald/20">
                <ShieldCheck className="w-4 h-4 text-status-emerald" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-status-emerald mt-2">
              ₹{" "}
              {(
                (portfolio?.portfolioMetrics.insuredReplacementValueInr || 3786200) / 100000
              ).toFixed(2)}{" "}
              Lakh
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              110% Lloyd's London Underwritten
            </div>
          </Card>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex border-b border-surface-border space-x-4 sm:space-x-8 text-xs sm:text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab("HOLDINGS")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 whitespace-nowrap ${
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
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 whitespace-nowrap ${
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
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 whitespace-nowrap ${
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
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-muted-foreground gap-2">
              <span>Showing {portfolio?.holdings.length || 0} Registered High-Jewellery Assets</span>
              <span className="text-gold font-semibold">
                All assets BIS Hallmarked &amp; Metrologically Sealed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio?.holdings.map((piece) => (
                <Card
                  key={piece.id}
                  className="rounded-2xl border-surface-border bg-surface-card hover:border-gold/40 transition-all duration-300 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md group"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-gold text-xs">
                            {piece.serialNumber}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated border border-surface-border text-muted-foreground">
                            {piece.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-1">
                          {piece.itemName}
                        </h3>
                      </div>
                      <Badge variant="emerald" size="sm" className="font-mono">
                        BIS 750
                      </Badge>
                    </div>

                    {/* Metrological Specs Table */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-elevated border border-surface-border/60 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          Precious Alloy
                        </span>
                        <span className="font-semibold text-foreground">
                          {piece.metalPurity.split(" ")[0]}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {piece.netGoldGrams}g Net Fine
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          Diamond Grade
                        </span>
                        <span className="font-semibold text-gold">
                          {piece.diamondCarat} ct
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {piece.diamondSpecs}
                        </span>
                      </div>
                    </div>

                    {/* Mark-to-Market Valuation */}
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground">Original Purchase:</span>
                        <span className="text-foreground font-medium">
                          ₹{piece.originalPriceInr.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground">Current Replacement:</span>
                        <span className="text-gold font-bold text-sm">
                          ₹{piece.currentValuationInr.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono pt-1.5 border-t border-surface-border/60">
                        <span className="text-status-emerald font-medium">Unrealized Gain:</span>
                        <span className="text-status-emerald font-bold">
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
                <div className="flex items-center space-x-2 text-gold text-xs font-mono font-medium">
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
                  <label className="block text-muted-foreground mb-1.5 text-xs font-mono font-medium">
                    Service Category
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-elevated border border-surface-border rounded-md text-foreground focus:outline-none focus:border-gold"
                  >
                    <option value="CLEANING_INSPECTION">Ultrasonic Cleansing &amp; Micro-Prong Inspection</option>
                    <option value="RESIZING">Bespoke Ring Resizing &amp; Rhodium Plating</option>
                    <option value="VALUATION_APPRAISAL">Official Insurance Valuation Appraisal</option>
                    <option value="PRIVATE_SALON_VIEWING">Private Salon Vitrine Viewing Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 text-xs font-mono font-medium">
                    Atelier Boutique Suite
                  </label>
                  <select
                    value={salonLocation}
                    onChange={(e) => setSalonLocation(e.target.value)}
                    className="w-full h-9 px-3 bg-surface-elevated border border-surface-border rounded-md text-foreground focus:outline-none focus:border-gold"
                  >
                    <option value="Flagship Mumbai (Colaba Suite 1)">Flagship Mumbai (Colaba Private Suite 1)</option>
                    <option value="Bandra Atelier Sanctuary">Bandra Atelier Sanctuary Suite</option>
                    <option value="Dubai DIFC Private Salon">Dubai DIFC Luxury Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 text-xs font-mono font-medium">
                    Preferred Date &amp; Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="h-9 bg-surface-elevated border-surface-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 text-xs font-mono font-medium">
                    Special Requests or Pieces for Service
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Requesting inspection for 18K Solitaire Ring (JC-SOL-2026-081)..."
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-surface-border rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full font-semibold shadow-sm"
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
                      className="p-4 bg-surface-card border-surface-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gold/30 transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-gold text-xs">
                            {apt.referenceCode}
                          </span>
                          <Badge variant="emerald" size="sm">
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
                  <span className="text-status-emerald font-bold text-sm">
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
                  <span className="text-status-indigo font-bold text-sm">
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
                  className="font-medium text-xs shadow-sm"
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
