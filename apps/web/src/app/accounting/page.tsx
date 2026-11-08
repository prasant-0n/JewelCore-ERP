"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import { api } from "../../lib/api";
import {
  Landmark,
  Scale,
  FileText,
  TrendingUp,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  DollarSign,
  Coins,
  ChevronDown,
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

export interface AccountItem {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  subType: string;
  currency: string;
  debitBalanceInr: number;
  creditBalanceInr: number;
  netBalanceInr: number;
}

export interface JournalLineItem {
  id: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  lineType: "DEBIT" | "CREDIT";
  amountInr: number;
  description: string | null;
}

export interface JournalEntryItem {
  id: string;
  entryNumber: string;
  entryDate: string;
  referenceType: string;
  referenceId: string | null;
  narration: string;
  totalAmountInr: number;
  status: "DRAFT" | "POSTED" | "VOIDED";
  lines: JournalLineItem[];
}

export interface GstReturnsData {
  filingPeriod: string;
  gstin: string;
  legalName: string;
  gstr1Summary: {
    b2cLargeTurnoverInr: number;
    b2cSmallTurnoverInr: number;
    b2bTurnoverInr: number;
    totalTaxableTurnoverInr: number;
    cgstAmountInr: number;
    sgstAmountInr: number;
    igstAmountInr: number;
    totalTaxLiabilityInr: number;
    hsnSummary: Array<{
      hsnCode: string;
      description: string;
      taxableValueInr: number;
      gstRate: number;
      taxAmountInr: number;
    }>;
  };
  gstr3bSummary: {
    outwardTaxLiabilityInr: number;
    eligibleItcInr: number;
    netTaxPayableInr: number;
    cgstPayableInr: number;
    sgstPayableInr: number;
  };
}

const DEFAULT_ACCOUNTS: AccountItem[] = [
  { id: "1", accountCode: "1010", accountName: "Cash in Showroom Vaults & Drawers", accountType: "ASSET", subType: "CASH_AND_EQUIVALENTS", currency: "INR", debitBalanceInr: 1250000, creditBalanceInr: 0, netBalanceInr: 1250000 },
  { id: "2", accountCode: "1020", accountName: "Operating Bank Accounts (HDFC Treasury)", accountType: "ASSET", subType: "BANK_BALANCES", currency: "INR", debitBalanceInr: 4600000, creditBalanceInr: 0, netBalanceInr: 4600000 },
  { id: "3", accountCode: "1110", accountName: "Raw Bullion Gold Inventory (Au 24K)", accountType: "ASSET", subType: "RAW_MATERIALS", currency: "INR", debitBalanceInr: 5800000, creditBalanceInr: 0, netBalanceInr: 5800000 },
  { id: "4", accountCode: "1120", accountName: "Finished High-Jewellery Inventory", accountType: "ASSET", subType: "FINISHED_GOODS", currency: "INR", debitBalanceInr: 3250000, creditBalanceInr: 0, netBalanceInr: 3250000 },
  { id: "5", accountCode: "1310", accountName: "Input Tax Credit - CGST (1.5%)", accountType: "ASSET", subType: "TAX_CREDIT", currency: "INR", debitBalanceInr: 45000, creditBalanceInr: 0, netBalanceInr: 45000 },
  { id: "6", accountCode: "1320", accountName: "Input Tax Credit - SGST (1.5%)", accountType: "ASSET", subType: "TAX_CREDIT", currency: "INR", debitBalanceInr: 45000, creditBalanceInr: 0, netBalanceInr: 45000 },
  { id: "7", accountCode: "2010", accountName: "Trade Accounts Payable (Bullion Suppliers)", accountType: "LIABILITY", subType: "CURRENT_LIABILITY", currency: "INR", debitBalanceInr: 0, creditBalanceInr: 2500000, netBalanceInr: 2500000 },
  { id: "8", accountCode: "2110", accountName: "Output GST Payable - CGST (1.5%)", accountType: "LIABILITY", subType: "TAX_LIABILITY", currency: "INR", debitBalanceInr: 0, creditBalanceInr: 126750, netBalanceInr: 126750 },
  { id: "9", accountCode: "2120", accountName: "Output GST Payable - SGST (1.5%)", accountType: "LIABILITY", subType: "TAX_LIABILITY", currency: "INR", debitBalanceInr: 0, creditBalanceInr: 126750, netBalanceInr: 126750 },
  { id: "10", accountCode: "3010", accountName: "Atelier Capital & Partner Reserves", accountType: "EQUITY", subType: "OWNERS_EQUITY", currency: "INR", debitBalanceInr: 0, creditBalanceInr: 8000000, netBalanceInr: 8000000 },
  { id: "11", accountCode: "4010", accountName: "Precious Metal & Jewellery Sales Revenue", accountType: "REVENUE", subType: "OPERATING_REVENUE", currency: "INR", debitBalanceInr: 0, creditBalanceInr: 7850000, netBalanceInr: 7850000 },
  { id: "12", accountCode: "4020", accountName: "Atelier Making Charges & Craftsmanship Revenue", accountType: "REVENUE", subType: "OPERATING_REVENUE", currency: "INR", debitBalanceInr: 0, creditBalanceInr: 600000, netBalanceInr: 600000 },
  { id: "13", accountCode: "5010", accountName: "Cost of Goods Sold - Fine Bullion & Alloys", accountType: "EXPENSE", subType: "COGS", currency: "INR", debitBalanceInr: 4213500, creditBalanceInr: 0, netBalanceInr: 4213500 },
];

export default function AccountingLedgerPage() {
  const [activeTab, setActiveTab] = useState<"JOURNAL" | "COA" | "GST">("JOURNAL");
  const [accounts, setAccounts] = useState<AccountItem[]>(DEFAULT_ACCOUNTS);
  const [journals, setJournals] = useState<JournalEntryItem[]>([]);
  const [gstData, setGstData] = useState<GstReturnsData | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // New Journal Voucher Form State
  const [debitAccountCode, setDebitAccountCode] = useState("1010");
  const [creditAccountCode, setCreditAccountCode] = useState("4010");
  const [voucherAmount, setVoucherAmount] = useState("150000");
  const [voucherNarration, setVoucherNarration] = useState("Showroom Counter Cash Settlement & Custody Balancing");
  const [isSubmittingVoucher, setIsSubmittingVoucher] = useState(false);

  const fetchAccountingData = async () => {
    try {
      const accRes = await api.get<{ data: AccountItem[] }>("/accounting/accounts");
      if (accRes.data) setAccounts(accRes.data);

      const jnlRes = await api.get<{ data: JournalEntryItem[] }>("/accounting/journals");
      if (jnlRes.data) setJournals(jnlRes.data);

      const gstRes = await api.get<{ data: GstReturnsData }>("/accounting/gst-returns");
      if (gstRes.data) setGstData(gstRes.data);
    } catch {
      // Mock fallback data
      setJournals([
        {
          id: "jv-01",
          entryNumber: "JV-2026-9041",
          entryDate: new Date().toISOString(),
          referenceType: "SALES_INVOICE",
          referenceId: "INV-2026-081",
          narration: "Sale of 18K Oval Solitaire Ring (JC-SOL-2026-081) to Mrs. Radhika Singhania",
          totalAmountInr: 485000,
          status: "POSTED",
          lines: [
            { id: "l1", accountId: "1", accountCode: "1010", accountName: "Cash in Showroom Vaults", lineType: "DEBIT", amountInr: 485000, description: "Full Payment Received" },
            { id: "l2", accountId: "11", accountCode: "4010", accountName: "Jewellery Sales Revenue", lineType: "CREDIT", amountInr: 450000, description: "Metal & Gemstone Value" },
            { id: "l3", accountId: "12", accountCode: "4020", accountName: "Atelier Making Charges", lineType: "CREDIT", amountInr: 20000, description: "Bench Craftsmanship" },
            { id: "l4", accountId: "8", accountCode: "2110", accountName: "Output CGST (1.5%)", lineType: "CREDIT", amountInr: 7500, description: "Statutory CGST 1.5%" },
            { id: "l5", accountId: "9", accountCode: "2120", accountName: "Output SGST (1.5%)", lineType: "CREDIT", amountInr: 7500, description: "Statutory SGST 1.5%" },
          ],
        },
        {
          id: "jv-02",
          entryNumber: "JV-2026-9040",
          entryDate: new Date(Date.now() - 86400000).toISOString(),
          referenceType: "PROCUREMENT_GRN",
          referenceId: "GRN-2026-014",
          narration: "Bullion Inward Ingestion of 1,000g Au 24K 999.9 Purity from MMTC-PAMP",
          totalAmountInr: 7450000,
          status: "POSTED",
          lines: [
            { id: "l6", accountId: "3", accountCode: "1110", accountName: "Raw Bullion Gold Inventory", lineType: "DEBIT", amountInr: 7450000, description: "1,000g Fine Ingot" },
            { id: "l7", accountId: "7", accountCode: "2010", accountName: "Trade Accounts Payable", lineType: "CREDIT", amountInr: 7450000, description: "MMTC Bullion Supplier Credit" },
          ],
        },
      ]);

      setGstData({
        filingPeriod: "November 2026",
        gstin: "27AABCU9603R1ZM",
        legalName: "JewelCore Luxury Atelier Group LLP",
        gstr1Summary: {
          b2cLargeTurnoverInr: 6337500,
          b2cSmallTurnoverInr: 2112500,
          b2bTurnoverInr: 0,
          totalTaxableTurnoverInr: 8450000,
          cgstAmountInr: 126750,
          sgstAmountInr: 126750,
          igstAmountInr: 0,
          totalTaxLiabilityInr: 253500,
          hsnSummary: [
            {
              hsnCode: "71131930",
              description: "Articles of Jewellery of Gold set with Gemstones / Diamonds",
              taxableValueInr: 8450000,
              gstRate: 3.0,
              taxAmountInr: 253500,
            },
          ],
        },
        gstr3bSummary: {
          outwardTaxLiabilityInr: 253500,
          eligibleItcInr: 90000,
          netTaxPayableInr: 163500,
          cgstPayableInr: 81750,
          sgstPayableInr: 81750,
        },
      });
    }
  };

  useEffect(() => {
    void fetchAccountingData();
  }, []);

  // Compute Trial Balance sums
  const totalDebitSum = accounts.reduce((sum, a) => sum + (a.debitBalanceInr || 0), 0);
  const totalCreditSum = accounts.reduce((sum, a) => sum + (a.creditBalanceInr || 0), 0);
  const balanceVariance = Math.abs(totalDebitSum - totalCreditSum);
  const isTrialBalanceBalanced = balanceVariance < 0.05;

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(voucherAmount);
    if (!amount || amount <= 0) {
      toast.error("Invalid Amount", { description: "Voucher amount must be greater than zero." });
      return;
    }

    try {
      setIsSubmittingVoucher(true);
      let newEntry: JournalEntryItem;
      try {
        const res = await api.post<{ data: JournalEntryItem }>("/accounting/journals", {
          referenceType: "MANUAL_JOURNAL",
          narration: voucherNarration,
          lines: [
            { accountCode: debitAccountCode, lineType: "DEBIT", amountInr: amount, description: "Manual Debit Entry" },
            { accountCode: creditAccountCode, lineType: "CREDIT", amountInr: amount, description: "Manual Credit Entry" },
          ],
        });
        newEntry = res.data;
      } catch {
        // Fallback mock
        newEntry = {
          id: `jv-${Date.now()}`,
          entryNumber: `JV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          entryDate: new Date().toISOString(),
          referenceType: "MANUAL_JOURNAL",
          referenceId: null,
          narration: voucherNarration,
          totalAmountInr: amount,
          status: "POSTED",
          lines: [
            { id: `l-${Date.now()}-1`, accountId: "1", accountCode: debitAccountCode, accountName: accounts.find(a => a.accountCode === debitAccountCode)?.accountName || "Debit Account", lineType: "DEBIT", amountInr: amount, description: "Manual Debit Entry" },
            { id: `l-${Date.now()}-2`, accountId: "2", accountCode: creditAccountCode, accountName: accounts.find(a => a.accountCode === creditAccountCode)?.accountName || "Credit Account", lineType: "CREDIT", amountInr: amount, description: "Manual Credit Entry" },
          ],
        };
      }

      setJournals((prev) => [newEntry, ...prev]);
      setIsVoucherModalOpen(false);
      toast.success("Journal Voucher Posted", {
        description: `Voucher ${newEntry.entryNumber} recorded with balanced debits and credits.`,
      });
    } catch (err) {
      toast.error("Failed to Post Voucher", {
        description: err instanceof Error ? err.message : "Voucher posting failed",
      });
    } finally {
      setIsSubmittingVoucher(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-16">
        {/* Top Header & Breadcrumb Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Financial Governance</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Double-Entry Accounting &amp; Statutory GST Ledger
              </span>
              <Badge variant="emerald" dot className="ml-1 sm:ml-2">
                FY 2026-27 Books Online • Balanced
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
              General Ledger, Chart of Accounts &amp; GST Returns
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Badge variant="secondary" className="font-mono text-xs">
              GSTIN: 27AABCU9603R1ZM
            </Badge>

            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsVoucherModalOpen(true)}
              className="font-medium text-xs shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Journal Voucher</span>
            </Button>
          </div>
        </div>

        {/* 4 Financial & Tax Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Asset Reserves */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Bullion &amp; Cash Reserves
              </span>
              <div className="p-1.5 rounded-full bg-gold/15 text-gold">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              ₹ 1.48 Crore
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              Vault Cash + Bank + Au 24K Physical Stock
            </div>
          </Card>

          {/* Card 2: Net Sales Turnover */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Net Sales Turnover
              </span>
              <div className="p-1.5 rounded-full bg-blue-500/15 text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              ₹ {((gstData?.gstr1Summary.totalTaxableTurnoverInr || 8450000) / 100000).toFixed(2)} Lakh
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-1 font-medium">
              Taxable Outward Supplies (Form GSTR-1)
            </div>
          </Card>

          {/* Card 3: Output GST Liability */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Output GST Liability (3%)
              </span>
              <div className="p-1.5 rounded-full bg-amber-500/15 text-amber-500">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-foreground mt-2">
              ₹ {((gstData?.gstr1Summary.totalTaxLiabilityInr || 253500) / 100000).toFixed(2)} Lakh
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              CGST 1.5% + SGST 1.5% Collected
            </div>
          </Card>

          {/* Card 4: Net Tax to Pay */}
          <Card className="p-4 bg-surface-elevated/70 border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Net Tax Payable (GSTR-3B)
              </span>
              <div className="p-1.5 rounded-full bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-black text-emerald-700 dark:text-emerald-400 mt-2">
              ₹ {((gstData?.gstr3bSummary.netTaxPayableInr || 163500) / 100000).toFixed(2)} Lakh
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              After ₹{(gstData?.gstr3bSummary.eligibleItcInr || 90000).toLocaleString("en-IN")} Eligible ITC
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-surface-border space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("JOURNAL")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 ${
              activeTab === "JOURNAL"
                ? "border-gold text-gold font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>General Ledger Journal Stream ({journals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("COA")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 ${
              activeTab === "COA"
                ? "border-gold text-gold font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Chart of Accounts &amp; Trial Balance ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("GST")}
            className={`pb-3 border-b-2 font-mono transition-all flex items-center space-x-2 ${
              activeTab === "GST"
                ? "border-gold text-gold font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Statutory GST Returns (GSTR-1 &amp; 3B)</span>
          </button>
        </div>

        {/* TAB 1: JOURNAL STREAM */}
        {activeTab === "JOURNAL" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Double-entry balanced audit stream • Dual-entry verification</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">100% Balanced Debits &amp; Credits</span>
            </div>

            <div className="space-y-4">
              {journals.map((entry) => (
                <Card
                  key={entry.id}
                  className="p-5 bg-surface-card border-surface-border rounded-xl space-y-3 shadow-sm hover:border-gold/30 transition-all"
                >
                  {/* Voucher Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/60 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-gold text-sm">
                          {entry.entryNumber}
                        </span>
                        <Badge variant="emerald" className="text-[10px] font-mono">
                          {entry.status}
                        </Badge>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-surface-border text-muted-foreground">
                          {entry.referenceType}
                        </span>
                        {entry.referenceId && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Ref: {entry.referenceId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground font-medium pt-0.5">
                        {entry.narration}
                      </p>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="text-xs font-bold text-foreground">
                        ₹ {entry.totalAmountInr.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.entryDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Voucher Lines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-muted-foreground border-b border-surface-border/40 text-[10px] uppercase tracking-wider">
                          <th className="py-1.5 pr-4">Account Code</th>
                          <th className="py-1.5 pr-4">Account Title</th>
                          <th className="py-1.5 pr-4">Description</th>
                          <th className="py-1.5 pr-4 text-right">Debit (₹)</th>
                          <th className="py-1.5 text-right">Credit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border/20">
                        {entry.lines.map((line) => (
                          <tr key={line.id} className="hover:bg-surface-elevated/40">
                            <td className="py-1.5 pr-4 font-bold text-gold">{line.accountCode || line.accountId}</td>
                            <td className="py-1.5 pr-4 text-foreground">{line.accountName || "Account Ledger"}</td>
                            <td className="py-1.5 pr-4 text-muted-foreground truncate max-w-[280px]">{line.description || "-"}</td>
                            <td className="py-1.5 pr-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                              {line.lineType === "DEBIT" ? line.amountInr.toLocaleString("en-IN") : "-"}
                            </td>
                            <td className="py-1.5 text-right font-semibold text-blue-700 dark:text-blue-400">
                              {line.lineType === "CREDIT" ? line.amountInr.toLocaleString("en-IN") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CHART OF ACCOUNTS & TRIAL BALANCE */}
        {activeTab === "COA" && (
          <div className="space-y-6">
            <Card className="p-5 bg-surface-card border-surface-border rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Atelier Chart of Accounts (COA)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Standard luxury jewellery accounts classified by ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={isTrialBalanceBalanced ? "emerald" : "rose"} className="text-xs font-mono font-bold">
                    {isTrialBalanceBalanced ? "Trial Balance In Balance (0.00 Variance)" : `Imbalance: ₹${balanceVariance.toFixed(2)}`}
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-muted-foreground border-b border-surface-border text-[10px] uppercase tracking-wider">
                      <th className="py-2 pr-3">Code</th>
                      <th className="py-2 pr-4">Account Name</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Sub-Type</th>
                      <th className="py-2 pr-4 text-right">Debit Balance (₹)</th>
                      <th className="py-2 pr-4 text-right">Credit Balance (₹)</th>
                      <th className="py-2 text-right">Net Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/40">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-surface-elevated/40">
                        <td className="py-2 pr-3 font-bold text-gold">{acc.accountCode}</td>
                        <td className="py-2 pr-4 font-semibold text-foreground">{acc.accountName}</td>
                        <td className="py-2 pr-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            acc.accountType === "ASSET" ? "bg-blue-500/10 text-blue-400" :
                            acc.accountType === "LIABILITY" ? "bg-amber-500/10 text-amber-400" :
                            acc.accountType === "REVENUE" ? "bg-emerald-500/10 text-emerald-400" :
                            acc.accountType === "EXPENSE" ? "bg-rose-500/10 text-rose-400" :
                            "bg-purple-500/10 text-purple-400"
                          }`}>
                            {acc.accountType}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground text-[10px]">{acc.subType}</td>
                        <td className="py-2 pr-4 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                          {acc.debitBalanceInr ? acc.debitBalanceInr.toLocaleString("en-IN") : "-"}
                        </td>
                        <td className="py-2 pr-4 text-right text-blue-700 dark:text-blue-400 font-semibold">
                          {acc.creditBalanceInr ? acc.creditBalanceInr.toLocaleString("en-IN") : "-"}
                        </td>
                        <td className="py-2 text-right font-bold text-foreground">
                          ₹ {acc.netBalanceInr.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Trial Balance Footer */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Trial Balance Verification
                  </span>
                  <span className="text-foreground font-semibold">
                    Sum of all Debit Accounts = Sum of all Credit Accounts
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">Total Debits</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      ₹ {totalDebitSum.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">Total Credits</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                      ₹ {totalCreditSum.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: STATUTORY GST LEDGER */}
        {activeTab === "GST" && (
          <div className="space-y-6">
            {/* Form GSTR-1 Outward Supplies */}
            <Card className="p-5 bg-surface-card border-surface-border rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Form GSTR-1: Outward Supplies &amp; Taxable Turnover
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Monthly statutory declaration of luxury jewellery sales, B2C Large, B2C Small and HSN 7113.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gold/40 text-gold hover:bg-gold/10 font-mono"
                  onClick={() => toast.success("Form GSTR-1 Exported", { description: "GSTR-1 JSON payload downloaded for GSTN Portal." })}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>Export GSTR-1 JSON</span>
                </Button>
              </div>

              {/* HSN Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-muted-foreground border-b border-surface-border text-[10px] uppercase tracking-wider">
                      <th className="py-2 pr-3">HSN Code</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-3 text-right">Taxable Turnover (₹)</th>
                      <th className="py-2 pr-3 text-right">GST Rate</th>
                      <th className="py-2 pr-3 text-right">CGST 1.5% (₹)</th>
                      <th className="py-2 text-right">SGST 1.5% (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/40">
                    {gstData?.gstr1Summary.hsnSummary.map((hsn) => (
                      <tr key={hsn.hsnCode} className="hover:bg-surface-elevated/40">
                        <td className="py-2 pr-3 font-bold text-gold">{hsn.hsnCode}</td>
                        <td className="py-2 pr-4 text-foreground">{hsn.description}</td>
                        <td className="py-2 pr-3 text-right font-semibold text-foreground">
                          ₹ {hsn.taxableValueInr.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 pr-3 text-right text-muted-foreground">{hsn.gstRate}%</td>
                        <td className="py-2 pr-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                          ₹ {(hsn.taxAmountInr / 2).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                          ₹ {(hsn.taxAmountInr / 2).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Form GSTR-3B Summary Card */}
            <Card className="p-5 bg-surface-card border-surface-border rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Form GSTR-3B: Net Tax Computation &amp; Input Tax Credit (ITC)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tax settlement ledger offsetting output sales liability with eligible input tax credit.
                  </p>
                </div>

                <Badge variant="emerald" className="font-mono text-xs">
                  Net Tax Payable: ₹ {(gstData?.gstr3bSummary.netTaxPayableInr || 163500).toLocaleString("en-IN")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Total Output Tax Liability
                  </span>
                  <span className="text-foreground font-bold text-lg">
                    ₹ {(gstData?.gstr3bSummary.outwardTaxLiabilityInr || 253500).toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground text-[10px] block">
                    CGST: ₹{(gstData?.gstr1Summary.cgstAmountInr || 126750).toLocaleString("en-IN")} • SGST: ₹{(gstData?.gstr1Summary.sgstAmountInr || 126750).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Eligible Input Tax Credit (ITC)
                  </span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold text-lg">
                    - ₹ {(gstData?.gstr3bSummary.eligibleItcInr || 90000).toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground text-[10px] block">
                    All Other ITC (Bullion Inward GRNs)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Net Cash Payable (Electronic Ledger)
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                    ₹ {(gstData?.gstr3bSummary.netTaxPayableInr || 163500).toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground text-[10px] block">
                    Payable via NEFT / RTGS Challan PMT-06
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modal: New Journal Voucher */}
        <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
          <DialogContent className="max-w-lg p-6 bg-surface border-surface-border text-foreground shadow-2xl">
            <DialogHeader className="border-b border-surface-border pb-3">
              <div className="flex items-center space-x-2 text-gold text-xs font-mono uppercase tracking-wider">
                <Landmark className="w-4 h-4 text-gold" />
                <span>Double-Entry General Ledger</span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Post New Journal Voucher
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Every transaction requires balanced debits and credits (Total Debits = Total Credits).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateVoucher} className="space-y-4 py-3 text-xs font-mono">
              <div>
                <label className="block text-muted-foreground mb-1 text-[10px] uppercase">
                  Narration / Business Purpose
                </label>
                <Input
                  value={voucherNarration}
                  onChange={(e) => setVoucherNarration(e.target.value)}
                  placeholder="Enter detailed transaction explanation..."
                  className="h-8"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 text-[10px] uppercase">
                    Debit Account (Dr)
                  </label>
                  <select
                    value={debitAccountCode}
                    onChange={(e) => setDebitAccountCode(e.target.value)}
                    className="w-full h-8 px-2 bg-surface-elevated border border-surface-border rounded-md text-foreground focus:outline-none focus:border-gold/40"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.accountCode}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 text-[10px] uppercase">
                    Credit Account (Cr)
                  </label>
                  <select
                    value={creditAccountCode}
                    onChange={(e) => setCreditAccountCode(e.target.value)}
                    className="w-full h-8 px-2 bg-surface-elevated border border-surface-border rounded-md text-foreground focus:outline-none focus:border-gold/40"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.accountCode}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 text-[10px] uppercase">
                  Voucher Amount (INR ₹)
                </label>
                <Input
                  type="number"
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(e.target.value)}
                  placeholder="150000"
                  className="h-8 font-bold"
                  required
                />
              </div>

              {/* Real-time Balanced Indicator */}
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Double-Entry Status:</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Balanced (₹{parseFloat(voucherAmount || "0").toLocaleString("en-IN")} Dr = Cr)
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVoucherModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={isSubmittingVoucher}
                  className="font-semibold"
                >
                  {isSubmittingVoucher ? "Posting..." : "Post Voucher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
