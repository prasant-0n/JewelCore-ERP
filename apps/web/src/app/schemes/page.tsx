"use client";

import React, { useState, useEffect } from "react";
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
    bonusContributionPct: 100,
    makingChargeDiscountPct: 75,
    description: "Deposit for 11 months; JewelCore Atelier contributes the 12th month installment as a loyalty bonus upon redemption plus 75% off making charges.",
  },
  {
    id: "scheme-02",
    code: "GOLD-SIP-24K",
    name: "24K Pure Gold Systematic Accumulation SIP (Weight Locked)",
    schemeType: "WEIGHT_BASED_LOCK",
    totalTenureMonths: 11,
    minInstallmentAmountInr: 10000,
    bonusContributionPct: 50,
    makingChargeDiscountPct: 100,
    description: "Every monthly deposit locks pure 24K gold grams at live market spot rates, hedging against gold appreciation, with 100% making charge waiver on redemption.",
  },
  {
    id: "scheme-03",
    code: "BRIDAL-VAULT-12",
    name: "Bridal Jewellery Vault 12-Month Accumulation",
    schemeType: "VALUE_BASED_BONUS",
    totalTenureMonths: 12,
    minInstallmentAmountInr: 25000,
    bonusContributionPct: 150,
    makingChargeDiscountPct: 100,
    description: "High-value bridal trousseau plan offering a 1.5x month bonus contribution and bespoke salon atelier preview privileges.",
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
    makingChargeDiscountPct: 75,
    customerId: "cust-01",
    customerName: "Radhika Singhania",
    customerPhone: "+91 98201 44892",
    accountNumber: "SCH-2026-8812",
    monthlyInstallmentInr: 25000,
    installmentsPaid: 9,
    totalDepositedInr: 225000,
    accumulatedGoldGrams: 0,
    bonusAmountInr: 0,
    status: "ACTIVE",
    startDate: "2026-02-10",
    maturityDate: "2027-01-10",
    nomineeName: "Aditya Singhania",
    nomineeRelationship: "SPOUSE",
    nomineePhone: "+91 98201 55667",
    kycStatus: "VERIFIED",
    panNumber: "AAAPS9012K",
  },
  {
    id: "acc-02",
    schemeId: "scheme-02",
    schemeCode: "GOLD-SIP-24K",
    schemeName: "24K Pure Gold Systematic Accumulation SIP (Weight Locked)",
    schemeType: "WEIGHT_BASED_LOCK",
    totalTenureMonths: 11,
    makingChargeDiscountPct: 100,
    customerId: "cust-02",
    customerName: "Vikramaditya Birla",
    customerPhone: "+91 98220 99112",
    accountNumber: "SCH-2026-9041",
    monthlyInstallmentInr: 50000,
    installmentsPaid: 11,
    totalDepositedInr: 550000,
    accumulatedGoldGrams: 73.8255,
    bonusAmountInr: 25000,
    status: "MATURED",
    startDate: "2025-12-05",
    maturityDate: "2026-11-05",
    nomineeName: "Gayatri Birla",
    nomineeRelationship: "DAUGHTER",
    nomineePhone: "+91 98220 33445",
    kycStatus: "VERIFIED",
    panNumber: "ABVPB1102K",
  },
  {
    id: "acc-03",
    schemeId: "scheme-01",
    schemeCode: "SWARNA-NIDHI-11",
    schemeName: "Swarna Nidhi 11+1 Royal Advance Accumulator",
    schemeType: "VALUE_BASED_BONUS",
    totalTenureMonths: 11,
    makingChargeDiscountPct: 75,
    customerId: "cust-03",
    customerName: "Meenakshi Sundaram",
    customerPhone: "+91 98401 22334",
    accountNumber: "SCH-2026-4421",
    monthlyInstallmentInr: 10000,
    installmentsPaid: 5,
    totalDepositedInr: 50000,
    accumulatedGoldGrams: 0,
    bonusAmountInr: 0,
    status: "ACTIVE",
    startDate: "2026-06-15",
    maturityDate: "2027-05-15",
    nomineeName: "Karthik Sundaram",
    nomineeRelationship: "SPOUSE",
    nomineePhone: "+91 98401 55667",
    kycStatus: "VERIFIED",
    panNumber: "MSUND5566K",
  },
  {
    id: "acc-04",
    schemeId: "scheme-02",
    schemeCode: "GOLD-SIP-24K",
    schemeName: "24K Pure Gold Systematic Accumulation SIP (Weight Locked)",
    schemeType: "WEIGHT_BASED_LOCK",
    totalTenureMonths: 11,
    makingChargeDiscountPct: 100,
    customerId: "cust-04",
    customerName: "Kavita Krishnamurthy",
    customerPhone: "+91 98110 33221",
    accountNumber: "SCH-2025-7719",
    monthlyInstallmentInr: 20000,
    installmentsPaid: 11,
    totalDepositedInr: 220000,
    accumulatedGoldGrams: 30.5500,
    bonusAmountInr: 10000,
    status: "REDEEMED",
    startDate: "2025-08-01",
    maturityDate: "2026-07-01",
    nomineeName: "Subramaniam K.",
    nomineeRelationship: "BROTHER",
    nomineePhone: "+91 98110 88990",
    kycStatus: "VERIFIED",
    panNumber: "KKRSH7719P",
  },
];

const DEFAULT_LOYALTY: VipLoyalty[] = [
  {
    customerId: "cust-02",
    customerName: "Vikramaditya Birla",
    tier: "ROYAL_PATRON",
    rewardPointsBalance: 14500,
    lifetimePurchasesInr: 6850000,
    makingChargePrivilegePct: 35,
    personalConciergeAssigned: "Rachel R., Senior Private Client Director",
    specialPrivileges: [
      "Zero Making Charge on Gold SIP Redemption",
      "Private Armored Courier Delivery",
      "Haute Joaillerie Atelier Previews",
    ],
  },
  {
    customerId: "cust-01",
    customerName: "Radhika Singhania",
    tier: "PLATINUM",
    rewardPointsBalance: 8200,
    lifetimePurchasesInr: 3425000,
    makingChargePrivilegePct: 25,
    personalConciergeAssigned: "Rachel R., Senior Private Client Director",
    specialPrivileges: [
      "Annual Ultrasonic Gemstone Inspection",
      "Salon Champagne Suite Booking",
    ],
  },
  {
    customerId: "cust-03",
    customerName: "Meenakshi Sundaram",
    tier: "GOLD",
    rewardPointsBalance: 3100,
    lifetimePurchasesInr: 1250000,
    makingChargePrivilegePct: 15,
    personalConciergeAssigned: "Rachel R., Senior Private Client Director",
    specialPrivileges: [
      "Birthday Month 10% Extra Making Charge Waiver",
    ],
  },
];

export default function SavingsSchemePage() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "catalog" | "loyalty" | "kyc">("subscriptions");
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
          setSchemes(schemesRes.data);
        }
        if (accountsRes?.data && Array.isArray(accountsRes.data) && accountsRes.data.length > 0) {
          setAccounts(accountsRes.data);
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
  const monthlyRecurringInflow = activeSubs.reduce((sum, a) => sum + a.monthlyInstallmentInr, 0);
  const totalGoldReserveLockedGrams = accounts.reduce((sum, a) => sum + a.accumulatedGoldGrams, 0);
  const maturedTotalValueInr = maturedSubs.reduce((sum, a) => sum + a.totalDepositedInr + a.bonusAmountInr, 0);

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
    const isWeight = selectedAccount.schemeType === "WEIGHT_BASED_LOCK";
    const creditedGrams = isWeight ? Number((amt / liveSpotRatePerGram).toFixed(4)) : 0;
    const nextInstallmentNum = selectedAccount.installmentsPaid + 1;
    const isMatured = nextInstallmentNum >= selectedAccount.totalTenureMonths;
    const bonus = isMatured ? selectedAccount.monthlyInstallmentInr : 0;

    try {
      await api.post(`/schemes/accounts/${selectedAccount.id}/installments`, {
        amountInr: amt,
        goldSpotRatePerGram: liveSpotRatePerGram,
        paymentMethod: payMethod,
      });
    } catch {
      // offline fallback
    }

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === selectedAccount.id
          ? {
              ...a,
              installmentsPaid: nextInstallmentNum,
              totalDepositedInr: a.totalDepositedInr + amt,
              accumulatedGoldGrams: Number((a.accumulatedGoldGrams + creditedGrams).toFixed(4)),
              bonusAmountInr: bonus,
              status: isMatured ? "MATURED" : "ACTIVE",
            }
          : a,
      ),
    );

    setIsPayModalOpen(false);
    toast.success(
      `Installment #${nextInstallmentNum} recorded for ${selectedAccount.customerName}. ${isMatured ? "Plan is now MATURED!" : ""}`,
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
    toast.success(`Account ${selectedAccount.accountNumber} successfully redeemed for salon jewelry purchase.`);
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
      accountNumber: `SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
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
      const res = await api.post<{ success: boolean; data: CustomerSchemeAccount }>("/schemes/accounts", {
        schemeId: scheme.id,
        customerId: newAcc.customerId,
        monthlyInstallmentInr: monthlyInr,
        nomineeName: newAcc.nomineeName,
        nomineeRelationship: newAcc.nomineeRelationship,
        kycStatus: "VERIFIED",
        panNumber: newAcc.panNumber,
      });
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
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Gold Savings Scheme (SIP) & VIP Loyalty
                  <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs">
                    Swarna Nidhi 11+1
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monthly Bullion Advance Accumulation, Weight-Locked SIP & Private Client Privileges
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-9 gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="h-4 w-4" /> Enroll New Patron Plan
            </Button>
          </div>
        </div>

        {/* Operational KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Plan Subscribers</span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {activeSubs.length} <span className="text-sm text-muted-foreground font-normal">Patrons</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> 100% KYC Verified & Nominee Recorded
            </div>
          </Card>

          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Monthly Recurring Deposit Inflow</span>
              <CreditCard className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              ₹ {(monthlyRecurringInflow / 100000).toFixed(2)} <span className="text-sm text-blue-400 font-normal">Lakh / Mo</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-blue-400" /> Auto-debit & Salon counter receipts
            </div>
          </Card>

          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Customer Gold Reserve Locked</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {totalGoldReserveLockedGrams.toFixed(3)} <span className="text-sm text-amber-400 font-normal">g Au</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Fully vaulted in Physical Bullion
            </div>
          </Card>

          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Matured Ready for Redemption</span>
              <Gift className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {maturedSubs.length} <span className="text-sm text-purple-400 font-normal">(₹ {(maturedTotalValueInr / 100000).toFixed(2)} L)</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <BadgePercent className="h-3 w-3 text-purple-400" /> Ready for salon jewelry purchase
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/40 space-x-1">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "subscriptions"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Coins className="h-4 w-4" /> Active Subscriptions ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "catalog"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" /> Scheme Catalog ({schemes.length})
          </button>
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "loyalty"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Crown className="h-4 w-4" /> VIP Loyalty & Privileges
          </button>
          <button
            onClick={() => setActiveTab("kyc")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "kyc"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Statutory KYC & Nominee Audit
          </button>
        </div>

        {/* TAB 1: ACTIVE SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patron, account # or scheme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-card/60 border-border/40 h-9 text-xs"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-card/80 border border-border/40 text-xs rounded-md px-3 py-1.5 text-white"
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
                const progressPct = Math.min(100, Math.round((acc.installmentsPaid / acc.totalTenureMonths) * 100));

                return (
                  <Card key={acc.id} className="bg-card/40 border-border/40 p-5 hover:border-amber-500/30 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-amber-400">{acc.accountNumber}</span>
                          <Badge
                            variant="outline"
                            className={
                              acc.status === "MATURED"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]"
                                : acc.status === "REDEEMED"
                                  ? "bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                            }
                          >
                            {acc.status}
                          </Badge>
                          <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                            {acc.schemeType === "WEIGHT_BASED_LOCK" ? "Weight Locked 24K" : "Value 11+1 Bonus"}
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          {acc.customerName}
                          <span className="text-xs font-normal text-muted-foreground">({acc.customerPhone})</span>
                        </h3>
                        <p className="text-xs text-amber-300/90 font-medium">{acc.schemeName}</p>
                      </div>

                      {/* Deposit & Gold Stats */}
                      <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 lg:border-l border-border/30 pt-3 lg:pt-0 lg:pl-5">
                        <div>
                          <div className="text-xs text-muted-foreground">Total Deposited</div>
                          <div className="text-sm font-bold text-white font-mono">₹ {acc.totalDepositedInr.toLocaleString("en-IN")}</div>
                          <div className="text-[10px] text-zinc-400">₹ {acc.monthlyInstallmentInr.toLocaleString("en-IN")} / month</div>
                        </div>

                        {acc.accumulatedGoldGrams > 0 && (
                          <div className="pl-3 border-l border-border/20">
                            <div className="text-xs text-muted-foreground">Locked Gold Reserve</div>
                            <div className="text-sm font-bold text-amber-400 font-mono">{acc.accumulatedGoldGrams.toFixed(4)} g</div>
                            <div className="text-[10px] text-zinc-400">Pure 24K Au</div>
                          </div>
                        )}

                        {acc.bonusAmountInr > 0 && (
                          <div className="pl-3 border-l border-border/20">
                            <div className="text-xs text-muted-foreground">Atelier Bonus Payout</div>
                            <div className="text-sm font-bold text-emerald-400 font-mono">₹ {acc.bonusAmountInr.toLocaleString("en-IN")}</div>
                            <div className="text-[10px] text-zinc-400">12th Month Grant</div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pl-2">
                          {acc.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenPayModal(acc)}
                              className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1"
                            >
                              <CreditCard className="h-3.5 w-3.5" /> Pay Installment
                            </Button>
                          )}
                          {acc.status === "MATURED" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenRedeemModal(acc)}
                              className="h-8 text-xs bg-purple-500 hover:bg-purple-600 text-white font-semibold gap-1 shadow-lg shadow-purple-500/20"
                            >
                              <Gift className="h-3.5 w-3.5" /> Redeem for Jewelry
                            </Button>
                          )}
                          {acc.status === "REDEEMED" && (
                            <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700 gap-1 py-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Redeemed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Tenure Timeline */}
                    <div className="mt-4 pt-4 border-t border-border/20 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Installment Progress: <strong className="text-white">{acc.installmentsPaid} of {acc.totalTenureMonths} Months Paid</strong>
                        </span>
                        <span className="font-mono text-amber-400">{progressPct}% Complete</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            acc.status === "MATURED"
                              ? "bg-purple-500"
                              : acc.status === "REDEEMED"
                                ? "bg-zinc-600"
                                : "bg-amber-400"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                        <span>Started: {acc.startDate}</span>
                        <span>Maturity: {acc.maturityDate}</span>
                        <span>Nominee: {acc.nomineeName || "None"} ({acc.nomineeRelationship || "—"})</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {schemes.map((s) => (
              <Card key={s.id} className="bg-card/40 border-border/40 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-amber-400 font-bold">{s.code}</span>
                      <h3 className="text-base font-bold text-white mt-1">{s.name}</h3>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                      {s.totalTenureMonths} MONTHS
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{s.description}</p>

                  <div className="space-y-2 border-t border-border/20 pt-3 text-xs text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan Mechanism:</span>
                      <span className="font-semibold text-white">
                        {s.schemeType === "WEIGHT_BASED_LOCK" ? "Spot Gold Grams Lock" : "Monthly Cash Advance"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Monthly Deposit:</span>
                      <span className="font-mono font-bold text-amber-400">₹ {s.minInstallmentAmountInr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Atelier Bonus Contribution:</span>
                      <span className="font-bold text-emerald-400">{s.bonusContributionPct}% of 1 Month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Making Charge Privilege:</span>
                      <span className="font-bold text-purple-400">{s.makingChargeDiscountPct}% Off on Redemption</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setEnrollSchemeId(s.id);
                    setEnrollMonthlyInr(s.minInstallmentAmountInr.toString());
                    setIsEnrollModalOpen(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-9 gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Enroll Patron in This Plan
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: VIP LOYALTY & PRIVILEGES */}
        {activeTab === "loyalty" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEFAULT_LOYALTY.map((v) => (
                <Card key={v.customerId} className="bg-card/40 border-border/40 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{v.customerName}</h4>
                      <div className="text-xs text-muted-foreground">Concierge: {v.personalConciergeAssigned}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        v.tier === "ROYAL_PATRON"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-bold"
                          : v.tier === "PLATINUM"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs font-bold"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-bold"
                      }
                    >
                      {v.tier.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1.5 border-t border-border/20 pt-2 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reward Points:</span>
                      <span className="font-mono font-bold text-amber-400">{v.rewardPointsBalance.toLocaleString()} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lifetime Atelier Purchases:</span>
                      <span className="font-mono font-bold text-white">₹ {v.lifetimePurchasesInr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Making Charge Waiver Privilege:</span>
                      <span className="font-bold text-emerald-400">{v.makingChargePrivilegePct}% Permanent Discount</span>
                    </div>
                  </div>

                  <div className="border-t border-border/20 pt-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Patron Privileges:</span>
                    {v.specialPrivileges.map((p, i) => (
                      <div key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-amber-400" /> {p}
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
          <Card className="bg-card/40 border-border/40 p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white">Patron KYC Compliance & Nominee Governance Ledger</h3>
              <p className="text-xs text-muted-foreground">
                Mandatory PMLA compliance and registered beneficiary details for high-value gold bullion schemes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Account #</th>
                    <th className="py-2.5 px-3">Patron Name</th>
                    <th className="py-2.5 px-3">PAN Number</th>
                    <th className="py-2.5 px-3">KYC Status</th>
                    <th className="py-2.5 px-3">Nominee Name</th>
                    <th className="py-2.5 px-3">Relationship</th>
                    <th className="py-2.5 px-3">Nominee Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-zinc-300">
                  {accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-amber-400">{a.accountNumber}</td>
                      <td className="py-3 px-3 font-medium text-white">{a.customerName}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{a.panNumber || "—"}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {a.kycStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-white">{a.nomineeName || "—"}</td>
                      <td className="py-3 px-3 text-muted-foreground">{a.nomineeRelationship || "—"}</td>
                      <td className="py-3 px-3 font-mono text-zinc-400">{a.nomineePhone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ENROLL NEW PLAN MODAL */}
        <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
          <DialogContent className="sm:max-w-[550px] bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Coins className="h-5 w-5 text-amber-400" /> Enroll Patron in Gold Savings Scheme
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up a monthly gold deposit advance plan with nominee registration and statutory PAN verification.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEnrollNewPlan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground">Select Gold Savings Plan *</label>
                <select
                  value={enrollSchemeId}
                  onChange={(e) => setEnrollSchemeId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
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
                <div className="space-y-1">
                  <label className="text-muted-foreground">Patron Full Name *</label>
                  <Input
                    value={enrollCustomerName}
                    onChange={(e) => setEnrollCustomerName(e.target.value)}
                    placeholder="e.g. Mrs. Ananya Roy"
                    className="bg-zinc-900 border-zinc-700 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Mobile Phone *</label>
                  <Input
                    value={enrollCustomerPhone}
                    onChange={(e) => setEnrollCustomerPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="bg-zinc-900 border-zinc-700 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-amber-400 font-semibold">Monthly Installment (₹) *</label>
                  <Input
                    type="number"
                    value={enrollMonthlyInr}
                    onChange={(e) => setEnrollMonthlyInr(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300">Patron PAN Number *</label>
                  <Input
                    value={enrollPanNumber}
                    onChange={(e) => setEnrollPanNumber(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="bg-zinc-900 border-zinc-700 font-mono text-xs uppercase"
                    required
                  />
                </div>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-3">
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Statutory Nominee Registration</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Nominee Full Name *</label>
                    <Input
                      value={enrollNomineeName}
                      onChange={(e) => setEnrollNomineeName(e.target.value)}
                      placeholder="e.g. Rahul Roy"
                      className="bg-zinc-900 border-zinc-700 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Relationship *</label>
                    <select
                      value={enrollNomineeRel}
                      onChange={(e) => setEnrollNomineeRel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white text-xs"
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

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="border-zinc-700 text-zinc-300 h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-9 text-xs gap-1.5"
                >
                  <Check className="h-4 w-4" /> Finalize Enrollment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* PAY MONTHLY INSTALLMENT MODAL */}
        <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
          <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5 text-amber-400" /> Record Monthly Scheme Deposit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Process monthly deposit receipt and credit gold weight/cash ledger.
              </DialogDescription>
            </DialogHeader>

            {selectedAccount && (
              <form onSubmit={handlePayInstallment} className="space-y-4 text-xs">
                <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedAccount.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patron:</span>
                    <span className="text-white font-medium">{selectedAccount.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Installment Due:</span>
                    <span className="font-mono text-white font-bold">Month #{selectedAccount.installmentsPaid + 1} of {selectedAccount.totalTenureMonths}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Live 24K Spot Fix:</span>
                    <span className="font-mono text-amber-400 font-bold">₹ {liveSpotRatePerGram.toLocaleString("en-IN")} / g</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Deposit Amount (₹) *</label>
                  <Input
                    type="number"
                    value={payAmountInr}
                    onChange={(e) => setPayAmountInr(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
                  >
                    <option value="UPI">UPI (QR Code / Dynamic Floor VPA)</option>
                    <option value="CARD">Credit / Debit Card (PineLabs Terminal)</option>
                    <option value="NET_BANKING">RTGS / NEFT Direct Bank Transfer</option>
                    <option value="VAULT_CASH">Cash Deposit at Salon Counter</option>
                  </select>
                </div>

                {/* Real-time weight lock preview */}
                {selectedAccount.schemeType === "WEIGHT_BASED_LOCK" && payAmountInr && (
                  <div className="bg-zinc-900 p-2.5 rounded-md border border-zinc-800 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">24K Gold Credited at Spot:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {((parseFloat(payAmountInr) || 0) / liveSpotRatePerGram).toFixed(4)} g Au
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPayModalOpen(false)}
                    className="border-zinc-700 text-zinc-300 h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-9 text-xs gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Authorize & Print Receipt
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* REDEEM SCHEME MODAL */}
        <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
          <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Gift className="h-5 w-5 text-purple-400" /> Redeem Matured Gold Savings Plan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Apply accumulated deposits and atelier bonus grant towards a luxury salon jewelry invoice.
              </DialogDescription>
            </DialogHeader>

            {selectedAccount && (
              <div className="space-y-4 text-xs">
                <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedAccount.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patron:</span>
                    <span className="text-white font-medium">{selectedAccount.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Customer Deposits:</span>
                    <span className="font-mono text-white font-bold">₹ {selectedAccount.totalDepositedInr.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atelier 12th Month Bonus Contribution:</span>
                    <span className="font-mono text-emerald-400 font-bold">₹ {selectedAccount.bonusAmountInr.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold">
                    <span className="text-white">Total Redemption Credit Voucher:</span>
                    <span className="font-mono text-purple-400">
                      ₹ {(selectedAccount.totalDepositedInr + selectedAccount.bonusAmountInr).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedAccount.accumulatedGoldGrams > 0 && (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Or Fine Gold Weight Locked:</span>
                      <span className="font-mono font-bold text-amber-400">{selectedAccount.accumulatedGoldGrams.toFixed(4)} g 24K</span>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900 p-2.5 rounded-md border border-zinc-800 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
                    <BadgePercent className="h-4 w-4" /> Making Charge Discount: {selectedAccount.makingChargeDiscountPct}%
                  </div>
                  <div>This voucher grants a {selectedAccount.makingChargeDiscountPct}% waiver on making charges for all gold and diamond jewellery selected at POS checkout.</div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRedeemModalOpen(false)}
                    className="border-zinc-700 text-zinc-300 h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRedeemScheme}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold h-9 text-xs gap-1.5 shadow-lg shadow-purple-500/20"
                  >
                    <Check className="h-4 w-4" /> Confirm & Issue POS Voucher
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
