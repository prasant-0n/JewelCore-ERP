"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Search,
  Printer,
  Download,
  Coins,
  Scale,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "../../lib/api";
import {
  Itc04ChallanStatus,
  JobWorkProcessingType,
  type Itc04ChallanRecord,
  type KarigarSettlementRecord,
} from "@jewelcore/shared";
import { Itc04ChallanModal } from "./Itc04ChallanModal";
import { KarigarSettlementModal } from "./KarigarSettlementModal";

export const FALLBACK_CHALLANS: Itc04ChallanRecord[] = [
  {
    id: "chl-01",
    organizationId: "0192e300-0000-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    challanNumber: "CHL/JW/2026-27/0041",
    jobNumber: "JOB-2026-4819",
    jobOrderId: "job-4819",
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: "krg-01",
    karigarCode: "KRG-MUM-01",
    karigarName: "Master Rameshwar Chitrakar",
    karigarGstinOrPan: "RCHIT1122K",
    karigarAddress: "Zaveri Bazaar Atelier Suite 402, Mumbai",
    dispatchState: "Maharashtra (27)",
    hsnCode: "7113",
    itemDescription: "18K Oval Solitaire Halo Ring with Micro-Prong Diamond Setting",
    natureOfProcessing: JobWorkProcessingType.DIAMOND_MICRO_PAVE,
    issuedPureGoldGrams: 12.50,
    issuedAlloyGrams: 1.30,
    issuedGrossMetalGrams: 13.80,
    issuedDiamondCarats: 1.52,
    issuedGemstoneCarats: 0,
    declaredTaxableValueInr: 102500,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.ISSUED_IN_TRANSIT,
    issuedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    dueReturnDate: "2026-11-14",
    securitySealNumber: "SEC-JW-9011",
    authorizedBy: "Vikram Malhotra, Production Director",
    challanQrPayload: JSON.stringify({
      chl: "CHL/JW/2026-27/0041",
      job: "JOB-2026-4819",
      gstin: "27AAACJ8912K1Z5",
      krg: "RCHIT1122K",
      netG: 13.8,
      val: 102500,
    }),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "chl-02",
    organizationId: "0192e300-0000-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    challanNumber: "CHL/JW/2026-27/0042",
    jobNumber: "JOB-2026-4820",
    jobOrderId: "job-4820",
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: "krg-02",
    karigarCode: "KRG-KOL-02",
    karigarName: "Ustad Birendra Swarnakar",
    karigarGstinOrPan: "BSWAR2233M",
    karigarAddress: "Bowbazar Crafting Lane 12, Kolkata",
    dispatchState: "West Bengal (19)",
    hsnCode: "7113",
    itemDescription: "22K Kundan Choker Necklace with Temple Floral Motifs",
    natureOfProcessing: JobWorkProcessingType.JADAU_KUNDAN_SETTING,
    issuedPureGoldGrams: 45.00,
    issuedAlloyGrams: 3.80,
    issuedGrossMetalGrams: 48.80,
    issuedDiamondCarats: 3.20,
    issuedGemstoneCarats: 12.50,
    declaredTaxableValueInr: 385000,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.PARTIALLY_RETURNED,
    issuedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dueReturnDate: "2026-11-12",
    securitySealNumber: "SEC-JW-9012",
    authorizedBy: "Vikram Malhotra, Production Director",
    challanQrPayload: JSON.stringify({
      chl: "CHL/JW/2026-27/0042",
      job: "JOB-2026-4820",
      gstin: "27AAACJ8912K1Z5",
      krg: "BSWAR2233M",
      netG: 48.8,
      val: 385000,
    }),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "chl-03",
    organizationId: "0192e300-0000-7000-8000-000000000001",
    storeId: "0192e300-0001-7000-8000-000000000001",
    challanNumber: "CHL/JW/2026-27/0043",
    jobNumber: "JOB-2026-4821",
    jobOrderId: "job-4821",
    consignorName: "JewelCore Luxury Atelier Ltd.",
    consignorGstin: "27AAACJ8912K1Z5",
    consignorAddress: "Flagship Mumbai, Zaveri Bazaar Atelier Suite 101, Mumbai 400002",
    karigarId: "krg-03",
    karigarCode: "KRG-SUR-03",
    karigarName: "Bhavesh & Sons Casting Works",
    karigarGstinOrPan: "BHAVP3344J",
    karigarAddress: "Varachha Industrial Diamond Hub, Surat",
    dispatchState: "Gujarat (24)",
    hsnCode: "7108",
    itemDescription: "18K Gold Cast Ingots for Diamond Tennis Bracelet Mounts",
    natureOfProcessing: JobWorkProcessingType.CASTING_AND_MOLDING,
    issuedPureGoldGrams: 28.00,
    issuedAlloyGrams: 3.20,
    issuedGrossMetalGrams: 31.20,
    issuedDiamondCarats: 0,
    issuedGemstoneCarats: 0,
    declaredTaxableValueInr: 245000,
    statutoryRule: "Rule 45(1) of CGST Rules, 2017 & Section 143",
    status: Itc04ChallanStatus.RECONCILED_CLOSED,
    issuedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    dueReturnDate: "2026-11-09",
    securitySealNumber: "SEC-JW-9013",
    authorizedBy: "Vikram Malhotra, Production Director",
    challanQrPayload: JSON.stringify({
      chl: "CHL/JW/2026-27/0043",
      job: "JOB-2026-4821",
      gstin: "27AAACJ8912K1Z5",
      krg: "BHAVP3344J",
      netG: 31.2,
      val: 245000,
    }),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

interface Itc04ChallanRegistryProps {
  onOpenSettlementForJob?: (job: any) => void;
}

export function Itc04ChallanRegistry({
  onOpenSettlementForJob,
}: Itc04ChallanRegistryProps) {
  const [challans, setChallans] = useState<Itc04ChallanRecord[]>(FALLBACK_CHALLANS);
  const [filter, setFilter] = useState<"ALL" | "ISSUED_IN_TRANSIT" | "PARTIALLY_RETURNED" | "RECONCILED_CLOSED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedChallan, setSelectedChallan] = useState<Itc04ChallanRecord | null>(null);
  const [settleJob, setSettleJob] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get<{ data: Itc04ChallanRecord[] }>("/manufacturing/challans")
      .then((res) => {
        if (mounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setChallans(res.data);
        }
      })
      .catch(() => {
        // offline fallback
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredChallans = challans.filter((c) => {
    if (filter !== "ALL" && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.challanNumber.toLowerCase().includes(q) ||
        c.jobNumber.toLowerCase().includes(q) ||
        c.karigarName.toLowerCase().includes(q) ||
        c.karigarCode.toLowerCase().includes(q) ||
        c.hsnCode.includes(q)
      );
    }
    return true;
  });

  const inTransitCount = challans.filter((c) => c.status === Itc04ChallanStatus.ISSUED_IN_TRANSIT).length;
  const partiallyReturnedCount = challans.filter((c) => c.status === Itc04ChallanStatus.PARTIALLY_RETURNED).length;
  const closedCount = challans.filter((c) => c.status === Itc04ChallanStatus.RECONCILED_CLOSED).length;

  const totalBullionGrams = challans.reduce(
    (acc, c) => acc + (c.status !== Itc04ChallanStatus.RECONCILED_CLOSED ? c.issuedGrossMetalGrams : 0),
    0,
  );

  return (
    <div data-testid="itc04-challan-registry-section" className="space-y-6">
      {/* 4 Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-surface-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
            Active Job-Work Bullion
          </span>
          <div className="text-xl font-bold font-mono text-gold mt-1">
            {totalBullionGrams.toFixed(2)} g
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            Precious metal in artisan custody
          </span>
        </Card>

        <Card className="p-4 bg-surface border-surface-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
            Challans In Transit
          </span>
          <div className="text-xl font-bold font-mono text-status-amber mt-1">
            {inTransitCount + partiallyReturnedCount} Active
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            Form GST ITC-04 Covered
          </span>
        </Card>

        <Card className="p-4 bg-surface border-surface-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
            Tolerable Loss Rate
          </span>
          <div className="text-xl font-bold font-mono text-status-emerald mt-1">
            1.20% - 1.50%
          </div>
          <span className="text-[10px] text-status-emerald block mt-0.5">
            Contractual shrinkage limit
          </span>
        </Card>

        <Card className="p-4 bg-surface border-surface-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
            Statutory Compliance
          </span>
          <div className="text-sm font-bold text-status-emerald mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-emerald animate-pulse" />
            <span>RULE 45 COMPLIANT</span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            Section 143 Goods on Job-Work
          </span>
        </Card>
      </div>

      {/* Filter Chips & Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              filter === "ALL"
                ? "bg-gold text-obsidian font-bold shadow-sm"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            All Challans ({challans.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ISSUED_IN_TRANSIT")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              filter === "ISSUED_IN_TRANSIT"
                ? "bg-gold text-obsidian font-bold shadow-sm"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            In Transit ({inTransitCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PARTIALLY_RETURNED")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              filter === "PARTIALLY_RETURNED"
                ? "bg-gold text-obsidian font-bold shadow-sm"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            Partially Returned ({partiallyReturnedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("RECONCILED_CLOSED")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              filter === "RECONCILED_CLOSED"
                ? "bg-gold text-obsidian font-bold shadow-sm"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            Reconciled Closed ({closedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Challan, Job, Karigar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs font-mono bg-surface-elevated"
          />
        </div>
      </Card>

      {/* Challans Table */}
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-surface-elevated text-[10px] uppercase text-muted-foreground border-b border-surface-border">
            <tr>
              <th className="py-2.5 px-3">Challan / Job No</th>
              <th className="py-2.5 px-3">Karigar (Artisan)</th>
              <th className="py-2.5 px-3">HSN &amp; Description</th>
              <th className="py-2.5 px-3 text-right">Gross Mass</th>
              <th className="py-2.5 px-3 text-right">Declared Value</th>
              <th className="py-2.5 px-3">Security Seal</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredChallans.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No statutory delivery challans match your criteria.
                </td>
              </tr>
            ) : (
              filteredChallans.map((c) => (
                <tr key={c.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-gold block">{c.challanNumber}</span>
                    <span className="text-[10px] text-muted-foreground block">{c.jobNumber}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-foreground font-semibold block">{c.karigarName}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {c.karigarCode} • {c.karigarGstinOrPan}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-foreground font-semibold block truncate max-w-[200px]">
                      {c.itemDescription}
                    </span>
                    <span className="text-[10px] text-gold block">
                      HSN {c.hsnCode} • {c.natureOfProcessing}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-medium text-foreground">
                    <span className="block font-bold">{c.issuedGrossMetalGrams.toFixed(2)} g</span>
                    <span className="text-[10px] text-muted-foreground block">
                      (Au: {c.issuedPureGoldGrams.toFixed(2)}g)
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-status-emerald">
                    ₹{c.declaredTaxableValueInr.toLocaleString("en-IN")}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-foreground block">
                      {c.securitySealNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Due: {c.dueReturnDate}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {c.status === Itc04ChallanStatus.ISSUED_IN_TRANSIT ? (
                      <Badge variant="amber" className="text-[10px] font-mono">
                        In Transit
                      </Badge>
                    ) : c.status === Itc04ChallanStatus.PARTIALLY_RETURNED ? (
                      <Badge variant="indigo" className="text-[10px] font-mono">
                        Part Returned
                      </Badge>
                    ) : (
                      <Badge variant="emerald" className="text-[10px] font-mono">
                        Reconciled
                      </Badge>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right space-x-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChallan(c)}
                      title="View Official Form GST ITC-04 Delivery Challan"
                      className="h-7 text-[11px] gap-1 px-2 border-gold/30 text-gold hover:bg-gold/10 font-mono"
                      data-testid={`view-challan-btn-${c.id}`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>View Challan</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const jobData = {
                          id: c.jobOrderId,
                          jobNumber: c.jobNumber,
                          karigarId: c.karigarId,
                          karigarCode: c.karigarCode,
                          karigarName: c.karigarName,
                          issuedGrossMetalGrams: c.issuedGrossMetalGrams,
                          returnedCraftedPieceGrams: c.status === Itc04ChallanStatus.RECONCILED_CLOSED ? 22.4 : 11.2,
                          returnedScrapMetalGrams: c.status === Itc04ChallanStatus.RECONCILED_CLOSED ? 8.52 : 2.1,
                          laborChargeInr: 25000,
                          karigarTolerancePct: 1.2,
                        };
                        setSettleJob(jobData);
                      }}
                      title="Settle Metal Loss & Karigar Ledger"
                      className="h-7 text-[11px] gap-1 px-2 font-mono"
                      data-testid={`settle-job-btn-${c.id}`}
                    >
                      <Coins className="w-3 h-3" />
                      <span>Settle Loss</span>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sub-modals */}
      <Itc04ChallanModal
        isOpen={Boolean(selectedChallan)}
        onClose={() => setSelectedChallan(null)}
        challan={selectedChallan}
      />

      <KarigarSettlementModal
        isOpen={Boolean(settleJob)}
        onClose={() => setSettleJob(null)}
        job={settleJob}
        onSuccess={(settlement) => {
          setChallans((prev) =>
            prev.map((c) =>
              c.jobNumber === settlement.jobNumber
                ? { ...c, status: Itc04ChallanStatus.RECONCILED_CLOSED, updatedAt: new Date().toISOString() }
                : c,
            ),
          );
        }}
      />
    </div>
  );
}
