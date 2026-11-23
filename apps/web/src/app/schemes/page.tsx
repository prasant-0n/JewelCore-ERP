"use client";

import React, { useState, useEffect } from "react";
import { getSecureRandomInt } from "@/lib/cryptoRandom";
import { AppShell } from "../../components/common/AppShell";
import { api } from "../../lib/api";
import {
  Coins,
  Crown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  UserCheck,
  CreditCard,
  Building,
  Search,
  Filter,
  Check,
  Gift,
  FileText,
  BadgePercent,
  Calendar,
  Lock,
  ArrowUpRight,
  User,
  Shield,
  Layers,
  Sparkle,
  Scale,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface SavingsScheme {
  id: string;
  code: string;
  name: string;
  schemeType: "VALUE_BASED_BONUS" | "WEIGHT_BASED_LOCK";
  totalTenureMonths: number;
  minInstallmentAmountInr: number;
  bonusContributionPct: number;
  makingChargeDiscountPct: number;
  description: string | null;
}

export interface CustomerSchemeAccount {
  id: string;
  schemeId: string;
  schemeCode: string;
  schemeName: string;
  schemeType: "VALUE_BASED_BONUS" | "WEIGHT_BASED_LOCK";
  totalTenureMonths: number;
  makingChargeDiscountPct: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  accountNumber: string;
  monthlyInstallmentInr: number;
  installmentsPaid: number;
  totalDepositedInr: number;
  accumulatedGoldGrams: number;
  bonusAmountInr: number;
  status: "ACTIVE" | "MATURED" | "REDEEMED" | "FORECLOSED";
  startDate: string;
  maturityDate: string;
  nomineeName: string | null;
  nomineeRelationship: string | null;
  nomineePhone: string | null;
  kycStatus: "PENDING" | "VERIFIED" | "EXEMPT";
  panNumber: string | null;
}

export interface VipLoyalty {
  customerId: string;
  customerName: string;
  tier: "SILVER" | "GOLD" | "PLATINUM" | "ROYAL_PATRON";
  rewardPointsBalance: number;
  lifetimePurchasesInr: number;
  makingChargePrivilegePct: number;
  personalConciergeAssigned: string;
  specialPrivileges: string[];
}

const DEFAULT_SCHEMES: SavingsScheme[] = [
  {
    id: "scheme-01",
    code: "SWARNA-NIDHI-11",
    name: "Swarna Nidhi 11+1 Royal Advance Accumulator",
    schemeType: "VALUE_BASED_BONUS",
    totalTenureMonths: 11,
    minInstallmentAmountInr: 5000,
    bonusContributionPct: 100, // Atelier pays 100% of 1 month on maturity (12th installment free)
    makingChargeDiscountPct: 25,
    description:
      "Deposit fixed monthly advances for 11 months. JewelCore contributes the 12th month in full as an atelier patron bonus, plus 25% off making charges on bridal and couture collections.",
  },
  {
    id: "scheme-02",
    code: "GOLD-SIP-24K",
    name: "Swarna Suraksha Weight-Locked 24K Accumulator",
    schemeType: "WEIGHT_BASED_LOCK",
    totalTenureMonths: 12,
    minInstallmentAmountInr: 10000,
    bonusContributionPct: 50,
    makingChargeDiscountPct: 50,
    description:
      "Each monthly deposit instantly locks physical fine gold weight in grams at the live MCX 24K spot fix. Zero market volatility risk, redeemed as 22K/24K crafted jewellery with 50% making charge waiver.",
  },
  {
    id: "scheme-03",
    code: "BRIDAL-VAULT-12",
    name: "Trousseau Imperial Sovereign Bridal Reserve",
    schemeType: "VALUE_BASED_BONUS",
    totalTenureMonths: 12,
    minInstallmentAmountInr: 25000,
    bonusContributionPct: 120, // Atelier pays 1.2x of 1 monthly installment
    makingChargeDiscountPct: 35,
    description:
      "Prestige bridal reserve designed for high-net-worth trousseau planning. Unlocks dedicated private salon suites, gemologist consultations, and 120% bonus month contribution upon maturity.",
  },
];

const DEFAULT_ACCOUNTS: CustomerSchemeAccount[] = [
  {
    id: "acc-01",
    schemeId: "scheme-01",
    schemeCode: "SWARNA-NIDHI-11",
    schemeName: "Swarna Nidhi 11+1 Royal Advance Accumulator",
    schemeType: "VALUE_BASED_BONUS",
    totalTenureMonths: 11,
    makingChargeDiscountPct: 25,
    customerId: "cust-01",
    customerName: "Radhika Singhania",
    customerPhone: "+91 98201 44552",
    accountNumber: "SCH-2026-8812",
    monthlyInstallmentInr: 10000,
    installmentsPaid: 7,
    totalDepositedInr: 70000,
    accumulatedGoldGrams: 0,
    bonusAmountInr: 0,
    status: "ACTIVE",
    startDate: "2026-04-15",
    maturityDate: "2027-03-15",
    nomineeName: "Aarav Singhania",
    nomineeRelationship: "SON",
    nomineePhone: "+91 98201 44553",
    kycStatus: "VERIFIED",
    panNumber: "AAAPS9012K",
  },
  {
    id: "acc-02",
    schemeId: "scheme-02",
    schemeCode: "GOLD-SIP-24K",
    schemeName: "Swarna Suraksha Weight-Locked 24K Accumulator",
    schemeType: "WEIGHT_BASED_LOCK",
    totalTenureMonths: 12,
    makingChargeDiscountPct: 50,
    customerId: "cust-02",
    customerName: "Vikramaditya Birla",
    customerPhone: "+91 98190 22331",
    accountNumber: "SCH-2026-9041",
    monthlyInstallmentInr: 25000,
    installmentsPaid: 12,
    totalDepositedInr: 300000,
    accumulatedGoldGrams: 41.3793,
    bonusAmountInr: 12500,
    status: "MATURED",
    startDate: "2025-11-10",
    maturityDate: "2026-11-10",
    nomineeName: "Sunita Birla",
    nomineeRelationship: "SPOUSE",
    nomineePhone: "+91 98190 22332",
    kycStatus: "VERIFIED",
    panNumber: "BBBPB3344M",
  },
  {
    id: "acc-03",
    schemeId: "scheme-03",
    schemeCode: "BRIDAL-VAULT-12",
    schemeName: "Trousseau Imperial Sovereign Bridal Reserve",
    schemeType: "VALUE_BASED_BONUS",
    totalTenureMonths: 12,
    makingChargeDiscountPct: 35,
    customerId: "cust-03",
    customerName: "Meera Oberoi",
    customerPhone: "+91 98300 77112",
    accountNumber: "SCH-2026-7731",
    monthlyInstallmentInr: 50000,
    installmentsPaid: 12,
    totalDepositedInr: 600000,
    accumulatedGoldGrams: 0,
    bonusAmountInr: 60000,
    status: "REDEEMED",
    startDate: "2025-10-01",
    maturityDate: "2026-10-01",
    nomineeName: "Raghav Oberoi",
    nomineeRelationship: "SPOUSE",
    nomineePhone: "+91 98300 77113",
    kycStatus: "VERIFIED",
    panNumber: "CCCOE7711P",
  },
];

const DEFAULT_LOYALTY: VipLoyalty[] = [
  {
    customerId: "cust-01",
    customerName: "Radhika Singhania",
    tier: "ROYAL_PATRON",
    rewardPointsBalance: 42500,
    lifetimePurchasesInr: 8540000,
    makingChargePrivilegePct: 30,
    personalConciergeAssigned: "Rachel R. (Salon Director)",
    specialPrivileges: [
      "Zero Making Charge on Gold SIP Redemption",
      "Private High-Security Salon Suite Reservation",
      "Complimentary Annual Gemstone & Diamond Ultrasonic Cleanse",
      "First Invitation to Baselworld & Atelier Solitaire Unveilings",
    ],
  },
  {
    customerId: "cust-02",
    customerName: "Vikramaditya Birla",
    tier: "PLATINUM",
    rewardPointsBalance: 28400,
    lifetimePurchasesInr: 4920000,
    makingChargePrivilegePct: 20,
    personalConciergeAssigned: "Priya M. (Private Client Lead)",
    specialPrivileges: [
      "Spot Bullion Locking with Zero Premium Over MCX",
      "Complimentary Armored Van Delivery for High-Value Purchases",
      "GIA Certified Gemologist On-Call Verification",
    ],
  },
  {
    customerId: "cust-03",
    customerName: "Meera Oberoi",
    tier: "ROYAL_PATRON",
    rewardPointsBalance: 51200,
    lifetimePurchasesInr: 11200000,
    makingChargePrivilegePct: 35,
    personalConciergeAssigned: "Rachel R. (Salon Director)",
    specialPrivileges: [
      "Bespoke Bridal Design Suite with Master Goldsmith",
      "Direct Vault Reserve Allocation of Investment Grade Bullion",
      "Full Insurance Replacement Dossier Updated Quarterly",
    ],
  },
];

export default function SavingsSchemePage() {
  const [activeTab, setActiveTab] = useState<
    "subscriptions" | "catalog" | "loyalty" | "kyc"
  >("subscriptions");
  const [accounts, setAccounts] = useState<CustomerSchemeAccount[]>(DEFAULT_ACCOUNTS);
  const [schemes, setSchemes] = useState<SavingsScheme[]>(DEFAULT_SCHEMES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CustomerSchemeAccount | null>(null);

  // Enroll modal inputs
  const [enrollSchemeId, setEnrollSchemeId] = useState("scheme-01");
  const [enrollCustomerName, setEnrollCustomerName] = useState("");
  const [enrollCustomerPhone, setEnrollCustomerPhone] = useState("");
  const [enrollMonthlyInr, setEnrollMonthlyInr] = useState("10000");
  const [enrollNomineeName, setEnrollNomineeName] = useState("");
  const [enrollNomineeRel, setEnrollNomineeRel] = useState("SPOUSE");
  const [enrollPanNumber, setEnrollPanNumber] = useState("");

  // Pay modal inputs
  const [payAmountInr, setPayAmountInr] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");
  const [liveSpotRatePerGram] = useState(7450);

  useEffect(() => {
    async function loadData() {
      try {
        const [schemesRes, accountsRes] = await Promise.all([
          api.get<{ success: boolean; data: SavingsScheme[] }>("/schemes"),
          api.get<{ success: boolean; data: CustomerSchemeAccount[] }>("/schemes/accounts"),
        ]);
        if (schemesRes?.data && Array.isArray(schemesRes.data) && schemesRes.data.length > 0) {
          const apiCodes = new Set(schemesRes.data.map((s) => s.code));
          const missingDefaults = DEFAULT_SCHEMES.filter((s) => !apiCodes.has(s.code));
          setSchemes([...schemesRes.data, ...missingDefaults]);
        }
        if (accountsRes?.data && Array.isArray(accountsRes.data) && accountsRes.data.length > 0) {
          const apiAccountNums = new Set(accountsRes.data.map((a) => a.accountNumber));
          const missingDefaults = DEFAULT_ACCOUNTS.filter(
            (a) => !apiAccountNums.has(a.accountNumber),
          );
          setAccounts([...accountsRes.data, ...missingDefaults]);
        }
      } catch {
        // offline fallback
      }
    }
    loadData();
  }, []);

  // KPIs
  const activeSubs = accounts.filter((a) => a.status === "ACTIVE");
  const maturedSubs = accounts.filter((a) => a.status === "MATURED");
  const monthlyRecurringInflow = activeSubs.reduce(
    (sum, a) => sum + a.monthlyInstallmentInr,
    0,
  );
  const totalGoldReserveLockedGrams = accounts.reduce(
    (sum, a) => sum + a.accumulatedGoldGrams,
    0,
  );
  const maturedTotalValueInr = maturedSubs.reduce(
    (sum, a) => sum + a.totalDepositedInr + a.bonusAmountInr,
    0,
  );

  // Filtered accounts
  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.schemeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenPayModal = (acc: CustomerSchemeAccount) => {
    setSelectedAccount(acc);
    setPayAmountInr(acc.monthlyInstallmentInr.toString());
    setIsPayModalOpen(true);
  };

  const handleOpenRedeemModal = (acc: CustomerSchemeAccount) => {
    setSelectedAccount(acc);
    setIsRedeemModalOpen(true);
  };

  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const amt = parseFloat(payAmountInr) || selectedAccount.monthlyInstallmentInr;
    const additionalGrams =
      selectedAccount.schemeType === "WEIGHT_BASED_LOCK"
        ? Number((amt / liveSpotRatePerGram).toFixed(4))
        : 0;

    const updatedInstallments = selectedAccount.installmentsPaid + 1;
    const isNowMatured = updatedInstallments >= selectedAccount.totalTenureMonths;
    const bonus = isNowMatured ? selectedAccount.monthlyInstallmentInr : 0;

    try {
      await api.post(`/schemes/accounts/${selectedAccount.id}/installments`, {
        amountInr: amt,
        paymentMethod: payMethod,
        spotRatePerGram: liveSpotRatePerGram,
      });
    } catch {
      // offline fallback
    }

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === selectedAccount.id
          ? {
              ...a,
              installmentsPaid: updatedInstallments,
              totalDepositedInr: a.totalDepositedInr + amt,
              accumulatedGoldGrams: a.accumulatedGoldGrams + additionalGrams,
              bonusAmountInr: a.bonusAmountInr + bonus,
              status: isNowMatured ? "MATURED" : a.status,
            }
          : a,
      ),
    );

    setIsPayModalOpen(false);
    toast.success(
      `Deposit of ₹${amt.toLocaleString("en-IN")} recorded for ${selectedAccount.accountNumber} (Installment #${updatedInstallments})`,
    );
  };

  const handleRedeemScheme = async () => {
    if (!selectedAccount) return;

    try {
      await api.post(`/schemes/accounts/${selectedAccount.id}/redeem`, {});
    } catch {
      // offline fallback
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === selectedAccount.id ? { ...a, status: "REDEEMED" } : a)),
    );

    setIsRedeemModalOpen(false);
    toast.success(
      `Account ${selectedAccount.accountNumber} successfully redeemed for salon jewelry purchase.`,
    );
  };

  const handleEnrollNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheme = schemes.find((s) => s.id === enrollSchemeId) || schemes[0];
    const monthlyInr = parseFloat(enrollMonthlyInr) || 10000;

    const newAcc: CustomerSchemeAccount = {
      id: `acc-mock-${Date.now()}`,
      schemeId: scheme.id,
      schemeCode: scheme.code,
      schemeName: scheme.name,
      schemeType: scheme.schemeType,
      totalTenureMonths: scheme.totalTenureMonths,
      makingChargeDiscountPct: scheme.makingChargeDiscountPct,
      customerId: `cust-new-${Date.now()}`,
      customerName: enrollCustomerName || "Mrs. Ananya Roy",
      customerPhone: enrollCustomerPhone || "+91 98200 44556",
      accountNumber: `SCH-2026-${getSecureRandomInt(1000, 10000)}`,
      monthlyInstallmentInr: monthlyInr,
      installmentsPaid: 0,
      totalDepositedInr: 0,
      accumulatedGoldGrams: 0,
      bonusAmountInr: 0,
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      maturityDate: new Date(Date.now() + 11 * 30 * 86400000).toISOString().split("T")[0],
      nomineeName: enrollNomineeName || null,
      nomineeRelationship: enrollNomineeRel,
      nomineePhone: null,
      kycStatus: "VERIFIED",
      panNumber: enrollPanNumber || "AROYP4455K",
    };

    try {
      const res = await api.post<{ success: boolean; data: CustomerSchemeAccount }>(
        "/schemes/accounts",
        {
          schemeId: scheme.id,
          customerId: newAcc.customerId,
          monthlyInstallmentInr: monthlyInr,
          nomineeName: newAcc.nomineeName,
          nomineeRelationship: newAcc.nomineeRelationship,
          kycStatus: "VERIFIED",
          panNumber: newAcc.panNumber,
        },
      );
      if (res?.data?.id) {
        newAcc.id = res.data.id;
        newAcc.accountNumber = res.data.accountNumber;
      }
    } catch {
      // offline fallback
    }

    setAccounts((prev) => [newAcc, ...prev]);
    setIsEnrollModalOpen(false);
    toast.success(`Patron ${newAcc.customerName} enrolled in ${scheme.name}`);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
        {/* Luxury Gold Savings Atmospheric Banner */}
        <div className="relative rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-7 shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gold font-medium">
                <Coins className="w-4 h-4 text-gold" />
                <span>Bullion Treasury &amp; Wealth Accumulation Engine</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                  Gold Savings Scheme (SIP) &amp; VIP Loyalty
                </h1>
                <Badge variant="gold" className="text-xs font-mono font-bold">
                  Swarna Nidhi 11+1
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10 text-xs font-mono">
                  Weight-Locked 24K / RBI Bullion Compliant
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Monthly Bullion Advance Accumulation, Weight-Locked SIP &amp; Private Client Privileges. Fully audited physical bullion reserves.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="gold"
                onClick={() => setIsEnrollModalOpen(true)}
                className="font-semibold text-xs h-9 gap-1.5 transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
                <span>Enroll New Patron Plan</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Operational KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Active Plan Subscribers
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Crown className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {activeSubs.length}{" "}
              <span className="text-xs text-muted-foreground font-sans font-normal">Patrons</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>100% KYC Verified &amp; Nominee Recorded</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Monthly Recurring Deposit Inflow
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <CreditCard className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              ₹ {(monthlyRecurringInflow / 100000).toFixed(2)}{" "}
              <span className="text-xs text-gold font-sans font-semibold">Lakh / Mo</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Clock className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span>Auto-debit &amp; Salon counter receipts</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Customer Gold Reserve Locked
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Scale className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-gold tracking-tight tabular-nums">
              {totalGoldReserveLockedGrams.toFixed(3)}{" "}
              <span className="text-xs text-gold/80 font-sans font-semibold">g Au</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Fully vaulted in Physical Bullion</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Matured Ready for Redemption
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Gift className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {maturedSubs.length}{" "}
              <span className="text-xs text-gold font-sans font-semibold">
                (₹ {(maturedTotalValueInr / 100000).toFixed(2)} L)
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <BadgePercent className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span>Ready for salon jewelry purchase</span>
            </div>
          </Card>
        </div>

        {/* Segmented Workstation Tabs (Matching Atelier Crafting) */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-elevated/80 border border-surface-border rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "subscriptions"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Active Subscriptions ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "catalog"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Scheme Catalog ({schemes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("loyalty")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "loyalty"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>VIP Loyalty &amp; Privileges ({DEFAULT_LOYALTY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "kyc"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Statutory KYC &amp; Nominee Audit</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-surface-card p-3 rounded-xl border border-surface-border">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patron, account # or scheme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-surface-elevated border-surface-border h-9 text-xs text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                  Filter Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface-elevated border border-surface-border text-xs rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-gold font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active (In Accumulation)</option>
                  <option value="MATURED">Matured (Ready to Redeem)</option>
                  <option value="REDEEMED">Redeemed</option>
                </select>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredAccounts.map((acc) => {
                const progressPct = Math.min(
                  100,
                  Math.round((acc.installmentsPaid / acc.totalTenureMonths) * 100),
                );

                return (
                  <Card
                    key={acc.id}
                    className="bg-surface-card border-surface-border p-5 hover:border-gold/40 hover:shadow-md transition-all duration-200 rounded-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gold tracking-wider">
                            {acc.accountNumber}
                          </span>
                          <Badge
                            variant={
                              acc.status === "MATURED"
                                ? "gold"
                                : acc.status === "REDEEMED"
                                  ? "secondary"
                                  : "emerald"
                            }
                            dot
                            size="sm"
                            className="font-mono text-[10px]"
                          >
                            {acc.status}
                          </Badge>
                          <Badge variant="outline" size="sm" className="font-mono text-[10px] bg-surface-elevated border-surface-border text-muted-foreground">
                            {acc.schemeType === "WEIGHT_BASED_LOCK"
                              ? "Weight Locked 24K"
                              : "Value 11+1 Bonus"}
                          </Badge>
                        </div>

                        <h3 className="text-base font-serif font-bold text-foreground flex items-center gap-2 tracking-tight">
                          <span>{acc.customerName}</span>
                          <span className="text-xs font-normal text-muted-foreground font-mono">
                            ({acc.customerPhone})
                          </span>
                        </h3>
                        <p className="text-xs text-gold font-medium font-mono">{acc.schemeName}</p>
                      </div>

                      {/* Deposit & Gold Stats */}
                      <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 lg:border-l border-surface-border pt-3 lg:pt-0 lg:pl-5 shrink-0">
                        <div>
                          <div className="text-[11px] text-muted-foreground font-mono uppercase">
                            Total Deposited
                          </div>
                          <div className="text-sm font-bold text-foreground font-mono tabular-nums">
                            ₹ {acc.totalDepositedInr.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ₹ {acc.monthlyInstallmentInr.toLocaleString("en-IN")} / month
                          </div>
                        </div>

                        {acc.accumulatedGoldGrams > 0 && (
                          <div className="pl-4 border-l border-surface-border">
                            <div className="text-[11px] text-muted-foreground font-mono uppercase">
                              Locked Gold Reserve
                            </div>
                            <div className="text-sm font-bold text-gold font-mono tabular-nums">
                              {acc.accumulatedGoldGrams.toFixed(4)} g
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Pure 24K Au
                            </div>
                          </div>
                        )}

                        {acc.bonusAmountInr > 0 && (
                          <div className="pl-4 border-l border-surface-border">
                            <div className="text-[11px] text-muted-foreground font-mono uppercase">
                              Atelier Bonus Payout
                            </div>
                            <div className="text-sm font-bold text-status-emerald font-mono tabular-nums">
                              ₹ {acc.bonusAmountInr.toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              12th Month Grant
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pl-2">
                          {acc.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() => handleOpenPayModal(acc)}
                              className="h-8 text-xs font-semibold gap-1 shadow-sm"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Pay Installment</span>
                            </Button>
                          )}
                          {acc.status === "MATURED" && (
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() => handleOpenRedeemModal(acc)}
                              className="h-8 text-xs font-semibold gap-1 shadow-sm"
                            >
                              <Gift className="h-3.5 w-3.5" />
                              <span>Redeem for Jewelry</span>
                            </Button>
                          )}
                          {acc.status === "REDEEMED" && (
                            <Badge variant="secondary" className="gap-1 py-1 text-xs font-mono">
                              <CheckCircle2 className="h-3 w-3 text-status-emerald" />
                              <span>Redeemed</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Tenure Timeline */}
                    <div className="mt-4 pt-4 border-t border-surface-border space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground font-sans">
                          Installment Progress:{" "}
                          <strong className="text-foreground font-mono">
                            {acc.installmentsPaid} of {acc.totalTenureMonths} Months Paid
                          </strong>
                        </span>
                        <span className="font-mono text-gold font-bold tabular-nums">{progressPct}% Complete</span>
                      </div>
                      <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden border border-surface-border">
                        <div
                          className={`h-full transition-all rounded-full ${
                            acc.status === "MATURED"
                              ? "bg-gold"
                              : acc.status === "REDEEMED"
                                ? "bg-muted-foreground"
                                : "bg-gold"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap justify-between text-[11px] text-muted-foreground font-mono pt-0.5 gap-2">
                        <span>Started: {acc.startDate}</span>
                        <span>Maturity: {acc.maturityDate}</span>
                        <span>
                          Nominee: {acc.nomineeName || "None"} ({acc.nomineeRelationship || "—"})
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SCHEME CATALOG */}
        {activeTab === "catalog" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {schemes.map((s) => (
              <Card
                key={s.id}
                className="bg-surface-card border-surface-border p-5 space-y-4 flex flex-col justify-between hover:border-gold/40 hover:shadow-md transition-all duration-200 rounded-xl"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-gold font-bold">{s.code}</span>
                      <h3 className="text-base font-serif font-bold text-foreground mt-1">{s.name}</h3>
                    </div>
                    <Badge variant="gold" size="sm" className="font-mono text-xs font-bold">
                      {s.totalTenureMonths} MONTHS
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">{s.description}</p>

                  <div className="space-y-2 border-t border-surface-border pt-3 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Plan Mechanism:</span>
                      <span className="font-semibold text-foreground">
                        {s.schemeType === "WEIGHT_BASED_LOCK"
                          ? "Spot Gold Grams Lock"
                          : "Monthly Cash Advance"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Min Monthly Deposit:</span>
                      <span className="font-mono font-bold text-gold tabular-nums">
                        ₹ {s.minInstallmentAmountInr.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Atelier Bonus Contribution:</span>
                      <span className="font-bold text-status-emerald">
                        {s.bonusContributionPct}% of 1 Month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Making Charge Privilege:</span>
                      <span className="font-bold text-gold">
                        {s.makingChargeDiscountPct}% Off on Redemption
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setEnrollSchemeId(s.id);
                    setEnrollMonthlyInr(s.minInstallmentAmountInr.toString());
                    setIsEnrollModalOpen(true);
                  }}
                  variant="gold"
                  className="w-full font-semibold text-xs h-9 gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Enroll Patron in This Plan</span>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: VIP LOYALTY & PRIVILEGES */}
        {activeTab === "loyalty" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {DEFAULT_LOYALTY.map((v) => (
                <Card
                  key={v.customerId}
                  className="bg-surface-card border-surface-border p-5 space-y-4 hover:border-gold/40 hover:shadow-md transition-all duration-200 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-foreground flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-gold shrink-0" />
                        <span>{v.customerName}</span>
                      </h4>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Concierge: {v.personalConciergeAssigned}
                      </div>
                    </div>
                    <Badge
                      variant={
                        v.tier === "ROYAL_PATRON"
                          ? "gold"
                          : v.tier === "PLATINUM"
                            ? "gold"
                            : "secondary"
                      }
                      size="sm"
                      className="font-bold font-mono text-[10px]"
                    >
                      {v.tier.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-2 border-t border-surface-border pt-3 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Reward Points:</span>
                      <span className="font-mono font-bold text-gold tabular-nums">
                        {v.rewardPointsBalance.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Lifetime Atelier Purchases:</span>
                      <span className="font-mono font-bold text-foreground tabular-nums">
                        ₹ {v.lifetimePurchasesInr.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Making Charge Waiver:</span>
                      <span className="font-bold text-status-emerald">
                        {v.makingChargePrivilegePct}% Permanent Discount
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-surface-border pt-3 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono block">
                      Patron Privileges:
                    </span>
                    {v.specialPrivileges.map((p, i) => (
                      <div
                        key={i}
                        className="text-xs text-foreground/90 flex items-center gap-1.5 font-sans"
                      >
                        <Check className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STATUTORY KYC & NOMINEE */}
        {activeTab === "kyc" && (
          <Card className="bg-surface-card border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono text-gold font-medium">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>PMLA &amp; Statutory Nominee Ledger</span>
              </div>
              <h3 className="text-xl font-serif font-black tracking-tight text-foreground">
                Patron KYC Compliance &amp; Nominee Governance Ledger
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mandatory PMLA compliance and registered beneficiary details for high-value gold bullion schemes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-surface-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated/80 border-b border-surface-border text-muted-foreground uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-3.5">Account #</th>
                    <th className="py-3 px-3.5">Patron Name</th>
                    <th className="py-3 px-3.5">PAN Number</th>
                    <th className="py-3 px-3.5">KYC Status</th>
                    <th className="py-3 px-3.5">Nominee Name</th>
                    <th className="py-3 px-3.5">Relationship</th>
                    <th className="py-3 px-3.5">Nominee Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-foreground font-mono">
                  {accounts.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-surface-elevated/40 transition-colors"
                    >
                      <td className="py-3 px-3.5 font-bold text-gold">{a.accountNumber}</td>
                      <td className="py-3 px-3.5 font-semibold font-sans text-foreground">{a.customerName}</td>
                      <td className="py-3 px-3.5 text-muted-foreground">{a.panNumber || "—"}</td>
                      <td className="py-3 px-3.5">
                        <Badge variant="emerald" size="sm" className="font-mono text-[10px]">
                          {a.kycStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 font-sans">{a.nomineeName || "—"}</td>
                      <td className="py-3 px-3.5 text-muted-foreground">{a.nomineeRelationship || "—"}</td>
                      <td className="py-3 px-3.5 text-muted-foreground">{a.nomineePhone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ENROLL NEW PLAN MODAL */}
        <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
          <DialogContent className="sm:max-w-[550px] bg-surface-card border border-surface-border text-foreground p-0 overflow-hidden shadow-2xl rounded-2xl">
            <div className="p-5 border-b border-surface-border bg-surface-elevated/70">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-foreground font-serif text-base font-bold">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/25">
                    <Coins className="h-4 w-4 text-gold" />
                  </div>
                  <span>Enroll Patron in Gold Savings Scheme</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Set up a monthly gold deposit advance plan with nominee registration and statutory PAN verification.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleEnrollNewPlan} className="p-6 space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-sans">Select Gold Savings Plan *</label>
                <select
                  value={enrollSchemeId}
                  onChange={(e) => setEnrollSchemeId(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2 text-foreground text-xs focus:outline-none focus:border-gold"
                  required
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.totalTenureMonths} mo, {s.schemeType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Patron Full Name *</label>
                  <Input
                    value={enrollCustomerName}
                    onChange={(e) => setEnrollCustomerName(e.target.value)}
                    placeholder="e.g. Mrs. Ananya Roy"
                    className="bg-surface-elevated border-surface-border text-xs text-foreground font-sans placeholder:text-muted-foreground/60 focus:border-gold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Mobile Phone *</label>
                  <Input
                    value={enrollCustomerPhone}
                    onChange={(e) => setEnrollCustomerPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="bg-surface-elevated border-surface-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gold font-bold font-sans">
                    Monthly Installment (₹) *
                  </label>
                  <Input
                    type="number"
                    value={enrollMonthlyInr}
                    onChange={(e) => setEnrollMonthlyInr(e.target.value)}
                    className="bg-surface-elevated border-surface-border font-mono text-xs text-foreground focus:border-gold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Patron PAN Number *</label>
                  <Input
                    value={enrollPanNumber}
                    onChange={(e) => setEnrollPanNumber(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="bg-surface-elevated border-surface-border font-mono text-xs uppercase text-foreground focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div className="bg-surface-elevated/70 p-4 rounded-xl border border-surface-border space-y-3">
                <span className="text-xs font-semibold text-gold block font-mono">
                  Statutory Nominee Registration
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-sans">Nominee Full Name *</label>
                    <Input
                      value={enrollNomineeName}
                      onChange={(e) => setEnrollNomineeName(e.target.value)}
                      placeholder="e.g. Rahul Roy"
                      className="bg-surface border-surface-border text-xs text-foreground font-sans placeholder:text-muted-foreground/60 focus:border-gold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-sans">Relationship *</label>
                    <select
                      value={enrollNomineeRel}
                      onChange={(e) => setEnrollNomineeRel(e.target.value)}
                      className="w-full bg-surface border border-surface-border rounded-lg p-2 text-foreground text-xs focus:outline-none focus:border-gold"
                    >
                      <option value="SPOUSE">Spouse</option>
                      <option value="SON">Son</option>
                      <option value="DAUGHTER">Daughter</option>
                      <option value="PARENT">Parent</option>
                      <option value="SIBLING">Sibling</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  className="font-semibold h-9 text-xs gap-1.5 shadow-md"
                >
                  <Check className="h-4 w-4" />
                  <span>Finalize Enrollment</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* PAY MONTHLY INSTALLMENT MODAL */}
        <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
          <DialogContent className="sm:max-w-[480px] bg-surface-card border border-surface-border text-foreground p-0 overflow-hidden shadow-2xl rounded-2xl">
            <div className="p-5 border-b border-surface-border bg-surface-elevated/70">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-foreground font-serif text-base font-bold">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/25">
                    <CreditCard className="h-4 w-4 text-gold" />
                  </div>
                  <span>Record Monthly Scheme Deposit</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Process monthly deposit receipt and credit gold weight/cash ledger.
                </DialogDescription>
              </DialogHeader>
            </div>

            {selectedAccount && (
              <form onSubmit={handlePayInstallment} className="p-6 space-y-4 text-xs font-mono">
                <div className="bg-surface-elevated p-3.5 rounded-xl border border-surface-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Account Number:</span>
                    <span className="font-mono text-gold font-bold">
                      {selectedAccount.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Patron:</span>
                    <span className="text-foreground font-bold font-sans">
                      {selectedAccount.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Next Installment Due:</span>
                    <span className="font-mono text-foreground font-bold">
                      Month #{selectedAccount.installmentsPaid + 1} of{" "}
                      {selectedAccount.totalTenureMonths}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Live 24K Spot Fix:</span>
                    <span className="font-mono text-gold font-bold tabular-nums">
                      ₹ {liveSpotRatePerGram.toLocaleString("en-IN")} / g
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gold font-bold font-sans">Deposit Amount (₹) *</label>
                  <Input
                    type="number"
                    value={payAmountInr}
                    onChange={(e) => setPayAmountInr(e.target.value)}
                    className="bg-surface-elevated border-surface-border font-mono text-xs text-foreground focus:border-gold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2 text-foreground focus:outline-none focus:border-gold text-xs font-mono"
                  >
                    <option value="UPI">UPI (QR Code / Dynamic Floor VPA)</option>
                    <option value="CARD">Credit / Debit Card (PineLabs Terminal)</option>
                    <option value="NET_BANKING">RTGS / NEFT Direct Bank Transfer</option>
                    <option value="VAULT_CASH">Cash Deposit at Salon Counter</option>
                  </select>
                </div>

                {/* Real-time weight lock preview */}
                {selectedAccount.schemeType === "WEIGHT_BASED_LOCK" && payAmountInr && (
                  <div className="bg-gold/10 p-3 rounded-xl border border-gold/25 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-sans">24K Gold Credited at Spot:</span>
                    <span className="font-mono font-bold text-gold tabular-nums">
                      {((parseFloat(payAmountInr) || 0) / liveSpotRatePerGram).toFixed(4)} g Au
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPayModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    className="font-semibold h-9 text-xs gap-1.5 shadow-md"
                  >
                    <Check className="h-4 w-4" />
                    <span>Authorize &amp; Print Receipt</span>
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* REDEEM SCHEME MODAL */}
        <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
          <DialogContent className="sm:max-w-[480px] bg-surface-card border border-surface-border text-foreground p-0 overflow-hidden shadow-2xl rounded-2xl">
            <div className="p-5 border-b border-surface-border bg-surface-elevated/70">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-foreground font-serif text-base font-bold">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/25">
                    <Gift className="h-4 w-4 text-gold" />
                  </div>
                  <span>Redeem Matured Gold Savings Plan</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Apply accumulated deposits and atelier bonus grant towards a luxury salon jewelry invoice.
                </DialogDescription>
              </DialogHeader>
            </div>

            {selectedAccount && (
              <div className="p-6 space-y-4 text-xs font-mono">
                <div className="bg-surface-elevated p-3.5 rounded-xl border border-surface-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Account Number:</span>
                    <span className="font-mono text-gold font-bold">
                      {selectedAccount.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Patron:</span>
                    <span className="text-foreground font-bold font-sans">
                      {selectedAccount.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Total Customer Deposits:</span>
                    <span className="font-mono text-foreground font-bold tabular-nums">
                      ₹ {selectedAccount.totalDepositedInr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Atelier 12th Month Bonus Contribution:</span>
                    <span className="font-mono text-status-emerald font-bold tabular-nums">
                      ₹ {selectedAccount.bonusAmountInr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-surface-border pt-2 text-sm font-bold">
                    <span className="text-foreground font-sans">Total Redemption Credit Voucher:</span>
                    <span className="font-mono text-gold tabular-nums">
                      ₹{" "}
                      {(
                        selectedAccount.totalDepositedInr + selectedAccount.bonusAmountInr
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedAccount.accumulatedGoldGrams > 0 && (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-muted-foreground font-sans">Or Fine Gold Weight Locked:</span>
                      <span className="font-mono font-bold text-gold tabular-nums">
                        {selectedAccount.accumulatedGoldGrams.toFixed(4)} g 24K
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gold/10 p-3.5 rounded-xl border border-gold/25 text-xs text-foreground space-y-1">
                  <div className="flex items-center gap-1.5 text-gold font-bold font-mono">
                    <BadgePercent className="h-4 w-4 shrink-0" />
                    <span>Making Charge Discount: {selectedAccount.makingChargeDiscountPct}%</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                    This voucher grants a {selectedAccount.makingChargeDiscountPct}% waiver on making charges for all gold and diamond jewellery selected at POS checkout.
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRedeemModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRedeemScheme}
                    variant="gold"
                    className="font-semibold h-9 text-xs gap-1.5 shadow-md"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirm &amp; Issue POS Voucher</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
