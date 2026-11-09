"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/common/AppShell";
import { api } from "../../lib/api";
import {
  Hammer,
  Gem,
  Flame,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Coins,
  Search,
  Filter,
  Check,
  RefreshCw,
  UserCheck,
  FileText,
} from "lucide-react";
import { Itc04ChallanRegistry } from "../../components/manufacturing/Itc04ChallanRegistry";
import { KarigarSettlementModal } from "../../components/manufacturing/KarigarSettlementModal";
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

export interface Karigar {
  id: string;
  code: string;
  name: string;
  specialization: string;
  lossTolerancePct: number;
  phone: string | null;
  panNumber: string | null;
  address: string | null;
  isActive: boolean;
}

export interface BomRecipe {
  id: string;
  bomCode: string;
  name: string;
  category: string;
  targetPurity: string;
  targetGrossWeightGrams: number;
  targetNetGoldGrams: number;
  targetDiamondCarats: number;
  standardMakingChargeInr: number;
  componentsJson: any[];
}

export interface ManufacturingJob {
  id: string;
  jobNumber: string;
  karigarId: string;
  karigarName: string;
  karigarTolerancePct: number;
  bomId: string | null;
  bomCode?: string;
  title: string;
  category: string;
  status: "ISSUED" | "IN_PROGRESS" | "QUALITY_INSPECTION" | "HALLMARKING" | "COMPLETED" | "CANCELLED";
  stage: "WAX_MOLDING" | "CASTING" | "FILING_ASSEMBLY" | "STONE_SETTING" | "POLISHING" | "FINAL_QC" | "COMPLETED";
  dueDate: string;
  issuedPureGoldGrams: number;
  issuedAlloyGrams: number;
  issuedGrossMetalGrams: number;
  issuedDiamondCarats: number;
  issuedGemstoneCarats: number;
  returnedCraftedPieceGrams: number;
  returnedScrapMetalGrams: number;
  unrecoveredLossGrams: number;
  actualLossPct: number;
  lossStatus: "WITHIN_TOLERANCE" | "EXCESS_LOSS";
  laborChargeInr: number;
  notes: string | null;
  createdAt: string;
}

const DEFAULT_KARIGARS: Karigar[] = [
  {
    id: "krg-01",
    code: "KRG-MUM-01",
    name: "Master Rameshwar Chitrakar",
    specialization: "DIAMOND_MICRO_PAVE",
    lossTolerancePct: 1.20,
    phone: "+91 98201 11223",
    panNumber: "RCHIT1122K",
    address: "Zaveri Bazaar Atelier Suite 402, Mumbai",
    isActive: true,
  },
  {
    id: "krg-02",
    code: "KRG-KOL-02",
    name: "Ustad Birendra Swarnakar",
    specialization: "JADAU_KUNDAN",
    lossTolerancePct: 1.50,
    phone: "+91 98300 22334",
    panNumber: "BSWAR2233M",
    address: "Bowbazar Crafting Lane 12, Kolkata",
    isActive: true,
  },
  {
    id: "krg-03",
    code: "KRG-SUR-03",
    name: "Bhavesh & Sons Casting Works",
    specialization: "CASTING_AND_MOLDING",
    lossTolerancePct: 1.00,
    phone: "+91 98250 33445",
    panNumber: "BHAVP3344J",
    address: "Varachha Industrial Diamond Hub, Surat",
    isActive: true,
  },
  {
    id: "krg-04",
    code: "KRG-DEL-04",
    name: "Pandit Hariom Filigree Atelier",
    specialization: "HANDMADE_FILIGREE",
    lossTolerancePct: 1.25,
    phone: "+91 98110 44556",
    panNumber: "HARIO4455P",
    address: "Dariba Kalan Chandni Chowk, Delhi",
    isActive: true,
  },
];

const DEFAULT_BOMS: BomRecipe[] = [
  {
    id: "bom-01",
    bomCode: "BOM-SOL-2026",
    name: "18K Oval Solitaire Halo Ring Recipe",
    category: "Rings & Solitaires",
    targetPurity: "18K White Gold",
    targetGrossWeightGrams: 4.85,
    targetNetGoldGrams: 4.25,
    targetDiamondCarats: 1.85,
    standardMakingChargeInr: 22000,
    componentsJson: [
      { component: "24K Fine Gold Grains", qty: "3.20g" },
      { component: "Master Alloy (Pd-White 750)", qty: "1.05g" },
      { component: "Oval Solitaire 1.50ct E/VVS1", qty: "1 pc" },
      { component: "Melee Pave Diamonds", qty: "28 pcs (0.35ct)" },
    ],
  },
  {
    id: "bom-02",
    bomCode: "BOM-CHK-2026",
    name: "22K Royal Jadau Heritage Choker Recipe",
    category: "Necklaces & Chokers",
    targetPurity: "22K Yellow Gold",
    targetGrossWeightGrams: 54.2,
    targetNetGoldGrams: 46.85,
    targetDiamondCarats: 6.5,
    standardMakingChargeInr: 75000,
    componentsJson: [
      { component: "24K Fine Gold Grains", qty: "43.50g" },
      { component: "Silver-Copper Master Alloy", qty: "3.35g" },
      { component: "Syndicate Polki Diamonds", qty: "32 pcs (6.50ct)" },
      { component: "Burmese Ruby Beads", qty: "18 pcs" },
    ],
  },
  {
    id: "bom-03",
    bomCode: "BOM-BAN-2026",
    name: "18K Micro-Prong Diamond Tennis Bangle",
    category: "Bangles & Kadas",
    targetPurity: "18K Yellow Gold",
    targetGrossWeightGrams: 28.6,
    targetNetGoldGrams: 27.56,
    targetDiamondCarats: 5.2,
    standardMakingChargeInr: 45000,
    componentsJson: [
      { component: "24K Fine Gold Grains", qty: "20.80g" },
      { component: "Alloy Rich Gold 750", qty: "6.76g" },
      { component: "Round Brilliant Diamonds", qty: "48 pcs (5.20ct)" },
    ],
  },
];

const DEFAULT_JOBS: ManufacturingJob[] = [
  {
    id: "job-01",
    jobNumber: "JOB-2026-4819",
    karigarId: "krg-01",
    karigarName: "Master Rameshwar Chitrakar",
    karigarTolerancePct: 1.20,
    bomId: "bom-01",
    bomCode: "BOM-SOL-2026",
    title: "18K Oval Solitaire Halo Ring for VIP Client",
    category: "Rings & Solitaires",
    status: "IN_PROGRESS",
    stage: "STONE_SETTING",
    dueDate: "2026-11-20",
    issuedPureGoldGrams: 5.5,
    issuedAlloyGrams: 1.83,
    issuedGrossMetalGrams: 7.33,
    issuedDiamondCarats: 1.85,
    issuedGemstoneCarats: 0,
    returnedCraftedPieceGrams: 0,
    returnedScrapMetalGrams: 0,
    unrecoveredLossGrams: 0,
    actualLossPct: 0,
    lossStatus: "WITHIN_TOLERANCE",
    laborChargeInr: 22000,
    notes: "Micro-claw pave setting; client requested HRD certificate verification.",
    createdAt: "2026-11-04",
  },
  {
    id: "job-02",
    jobNumber: "JOB-2026-3912",
    karigarId: "krg-02",
    karigarName: "Ustad Birendra Swarnakar",
    karigarTolerancePct: 1.50,
    bomId: "bom-02",
    bomCode: "BOM-CHK-2026",
    title: "22K Royal Jadau Heritage Choker Consignment",
    category: "Necklaces & Chokers",
    status: "QUALITY_INSPECTION",
    stage: "FINAL_QC",
    dueDate: "2026-11-22",
    issuedPureGoldGrams: 45.0,
    issuedAlloyGrams: 4.5,
    issuedGrossMetalGrams: 49.5,
    issuedDiamondCarats: 6.5,
    issuedGemstoneCarats: 8.2,
    returnedCraftedPieceGrams: 44.2,
    returnedScrapMetalGrams: 4.75,
    unrecoveredLossGrams: 0.55,
    actualLossPct: 1.11,
    lossStatus: "WITHIN_TOLERANCE",
    laborChargeInr: 75000,
    notes: "Kundan foil setting complete. Sprues collected and weighed on balance.",
    createdAt: "2026-11-01",
  },
  {
    id: "job-03",
    jobNumber: "JOB-2026-5104",
    karigarId: "krg-03",
    karigarName: "Bhavesh & Sons Casting Works",
    karigarTolerancePct: 1.00,
    bomId: null,
    title: "18K Geometric Emerald Cufflinks Batch",
    category: "Accessories",
    status: "IN_PROGRESS",
    stage: "CASTING",
    dueDate: "2026-11-28",
    issuedPureGoldGrams: 16.5,
    issuedAlloyGrams: 5.5,
    issuedGrossMetalGrams: 22.0,
    issuedDiamondCarats: 0.8,
    issuedGemstoneCarats: 2.4,
    returnedCraftedPieceGrams: 0,
    returnedScrapMetalGrams: 0,
    unrecoveredLossGrams: 0,
    actualLossPct: 0,
    lossStatus: "WITHIN_TOLERANCE",
    laborChargeInr: 18000,
    notes: "Investment casting flask #4; vacuum pressure sealed.",
    createdAt: "2026-11-06",
  },
  {
    id: "job-04",
    jobNumber: "JOB-2026-2881",
    karigarId: "krg-04",
    karigarName: "Pandit Hariom Filigree Atelier",
    karigarTolerancePct: 1.25,
    bomId: "bom-03",
    bomCode: "BOM-BAN-2026",
    title: "18K Micro-Prong Diamond Tennis Bangle",
    category: "Bangles & Kadas",
    status: "COMPLETED",
    stage: "COMPLETED",
    dueDate: "2026-11-10",
    issuedPureGoldGrams: 22.0,
    issuedAlloyGrams: 7.33,
    issuedGrossMetalGrams: 29.33,
    issuedDiamondCarats: 5.2,
    issuedGemstoneCarats: 0,
    returnedCraftedPieceGrams: 28.6,
    returnedScrapMetalGrams: 0.45,
    unrecoveredLossGrams: 0.28,
    actualLossPct: 0.95,
    lossStatus: "WITHIN_TOLERANCE",
    laborChargeInr: 45000,
    notes: "Laser hallmarked and RFID tag EPC-E280-1160-7714 successfully linked.",
    createdAt: "2026-10-25",
  },
];

const CRAFTING_STAGES = [
  "WAX_MOLDING",
  "CASTING",
  "FILING_ASSEMBLY",
  "STONE_SETTING",
  "POLISHING",
  "FINAL_QC",
  "COMPLETED",
];

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "reconciliation" | "karigars" | "boms" | "challans">("jobs");
  const [jobs, setJobs] = useState<ManufacturingJob[]>(DEFAULT_JOBS);
  const [karigars, setKarigars] = useState<Karigar[]>(DEFAULT_KARIGARS);
  const [boms, setBoms] = useState<BomRecipe[]>(DEFAULT_BOMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKarigarFilter, setSelectedKarigarFilter] = useState<string>("ALL");

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedJobForReturn, setSelectedJobForReturn] = useState<ManufacturingJob | null>(null);
  const [settleModalJob, setSettleModalJob] = useState<any | null>(null);

  // Issue modal fields
  const [issueKarigarId, setIssueKarigarId] = useState("");
  const [issueBomId, setIssueBomId] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueCategory, setIssueCategory] = useState("Rings & Solitaires");
  const [issueDueDate, setIssueDueDate] = useState("2026-12-05");
  const [issuePureGoldGrams, setIssuePureGoldGrams] = useState("10.000");
  const [issueAlloyGrams, setIssueAlloyGrams] = useState("3.333");
  const [issueDiamondCarats, setIssueDiamondCarats] = useState("1.50");
  const [issueLaborChargeInr, setIssueLaborChargeInr] = useState("25000");
  const [issueNotes, setIssueNotes] = useState("");

  // Return modal fields
  const [returnPieceWeightGrams, setReturnPieceWeightGrams] = useState("");
  const [returnScrapWeightGrams, setReturnScrapWeightGrams] = useState("");
  const [returnNotes, setReturnNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, karigarsRes, bomsRes] = await Promise.all([
          api.get<{ success: boolean; data: ManufacturingJob[] }>("/manufacturing/jobs"),
          api.get<{ success: boolean; data: Karigar[] }>("/manufacturing/karigars"),
          api.get<{ success: boolean; data: BomRecipe[] }>("/manufacturing/boms"),
        ]);
        if (jobsRes?.data && Array.isArray(jobsRes.data) && jobsRes.data.length > 0) {
          const apiJobNums = new Set(jobsRes.data.map((j) => j.jobNumber));
          const missingJobs = DEFAULT_JOBS.filter((j) => !apiJobNums.has(j.jobNumber));
          setJobs([...jobsRes.data, ...missingJobs]);
        }
        if (karigarsRes?.data && Array.isArray(karigarsRes.data) && karigarsRes.data.length > 0) {
          const apiCodes = new Set(karigarsRes.data.map((k) => k.code));
          const missingKarigars = DEFAULT_KARIGARS.filter((k) => !apiCodes.has(k.code));
          setKarigars([...karigarsRes.data, ...missingKarigars]);
        }
        if (bomsRes?.data && Array.isArray(bomsRes.data) && bomsRes.data.length > 0) {
          const apiBomCodes = new Set(bomsRes.data.map((b) => b.bomCode));
          const missingBoms = DEFAULT_BOMS.filter((b) => !apiBomCodes.has(b.bomCode));
          setBoms([...bomsRes.data, ...missingBoms]);
        }
      } catch {
        // graceful offline fallback
      }
    }
    loadData();
  }, []);

  // Summary KPIs
  const activeJobsCount = jobs.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED").length;
  const totalPureGoldInCustody = jobs
    .filter((j) => j.status !== "COMPLETED")
    .reduce((sum, j) => sum + j.issuedPureGoldGrams, 0);
  const completedJobs = jobs.filter((j) => j.returnedCraftedPieceGrams > 0);
  const avgLossPct =
    completedJobs.length > 0
      ? (completedJobs.reduce((sum, j) => sum + j.actualLossPct, 0) / completedJobs.length).toFixed(2)
      : "0.95";
  const totalLaborSpent = jobs.reduce((sum, j) => sum + j.laborChargeInr, 0);

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.karigarName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKarigar =
      selectedKarigarFilter === "ALL" || job.karigarId === selectedKarigarFilter;
    return matchesSearch && matchesKarigar;
  });

  const handleAdvanceStage = async (job: ManufacturingJob) => {
    const currentIndex = CRAFTING_STAGES.indexOf(job.stage);
    if (currentIndex < 0 || currentIndex >= CRAFTING_STAGES.length - 1) return;

    const nextStage = CRAFTING_STAGES[currentIndex + 1] as ManufacturingJob["stage"];
    try {
      await api.patch(`/manufacturing/jobs/${job.id}/stage`, { stage: nextStage });
    } catch {
      // offline fallback
    }

    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? {
              ...j,
              stage: nextStage,
              status: nextStage === "FINAL_QC" ? "QUALITY_INSPECTION" : nextStage === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
            }
          : j,
      ),
    );
    toast.success(`Job ${job.jobNumber} advanced to stage: ${nextStage}`);
  };

  const handleOpenReturnModal = (job: ManufacturingJob) => {
    setSelectedJobForReturn(job);
    setReturnPieceWeightGrams("");
    setReturnScrapWeightGrams("");
    setReturnNotes("");
    setIsReturnModalOpen(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForReturn) return;

    const piece = parseFloat(returnPieceWeightGrams) || 0;
    const scrap = parseFloat(returnScrapWeightGrams) || 0;
    const grossIssued = selectedJobForReturn.issuedGrossMetalGrams;
    const totalReturned = piece + scrap;
    const unrecovered = Math.max(0, Number((grossIssued - totalReturned).toFixed(3)));
    const lossPct = grossIssued > 0 ? Number(((unrecovered / grossIssued) * 100).toFixed(2)) : 0;
    const lossStatus = lossPct <= selectedJobForReturn.karigarTolerancePct ? "WITHIN_TOLERANCE" : "EXCESS_LOSS";

    try {
      await api.post(`/manufacturing/jobs/${selectedJobForReturn.id}/return`, {
        returnedCraftedPieceGrams: piece,
        returnedScrapMetalGrams: scrap,
        notes: returnNotes,
      });
    } catch {
      // offline fallback
    }

    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJobForReturn.id
          ? {
              ...j,
              returnedCraftedPieceGrams: piece,
              returnedScrapMetalGrams: scrap,
              unrecoveredLossGrams: unrecovered,
              actualLossPct: lossPct,
              lossStatus,
              stage: "FINAL_QC",
              status: "QUALITY_INSPECTION",
            }
          : j,
      ),
    );

    setIsReturnModalOpen(false);
    toast.success(
      `Artisan return recorded: loss is ${lossPct}% (${lossStatus === "WITHIN_TOLERANCE" ? "Within Tolerance" : "Excess Loss Warning"})`,
    );
  };

  const handleIssueJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedKarigar = karigars.find((k) => k.id === issueKarigarId) || karigars[0];
    const pure = parseFloat(issuePureGoldGrams) || 0;
    const alloy = parseFloat(issueAlloyGrams) || 0;
    const gross = pure + alloy;

    const newJob: ManufacturingJob = {
      id: `job-mock-${Date.now()}`,
      jobNumber: `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      karigarId: assignedKarigar.id,
      karigarName: assignedKarigar.name,
      karigarTolerancePct: assignedKarigar.lossTolerancePct,
      bomId: issueBomId || null,
      title: issueTitle || "Custom Atelier Bespoke Crafting Piece",
      category: issueCategory,
      status: "IN_PROGRESS",
      stage: "CASTING",
      dueDate: issueDueDate,
      issuedPureGoldGrams: pure,
      issuedAlloyGrams: alloy,
      issuedGrossMetalGrams: gross,
      issuedDiamondCarats: parseFloat(issueDiamondCarats) || 0,
      issuedGemstoneCarats: 0,
      returnedCraftedPieceGrams: 0,
      returnedScrapMetalGrams: 0,
      unrecoveredLossGrams: 0,
      actualLossPct: 0,
      lossStatus: "WITHIN_TOLERANCE",
      laborChargeInr: parseFloat(issueLaborChargeInr) || 0,
      notes: issueNotes || null,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await api.post<{ success: boolean; data: ManufacturingJob }>("/manufacturing/jobs", {
        karigarId: assignedKarigar.id,
        bomId: issueBomId || undefined,
        title: newJob.title,
        category: newJob.category,
        dueDate: newJob.dueDate,
        issuedPureGoldGrams: pure,
        issuedAlloyGrams: alloy,
        issuedDiamondCarats: newJob.issuedDiamondCarats,
        laborChargeInr: newJob.laborChargeInr,
        notes: issueNotes,
      });
      if (res?.data?.id) {
        newJob.id = res.data.id;
        newJob.jobNumber = res.data.jobNumber;
      }
    } catch {
      // offline fallback
    }

    setJobs((prev) => [newJob, ...prev]);
    setIsIssueModalOpen(false);
    toast.success(`Job Card ${newJob.jobNumber} issued to ${assignedKarigar.name}`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Hammer className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight text-white flex items-center gap-2">
                  Atelier Manufacturing & Karigar Work Orders
                  <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs">
                    Karkhana Floor
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Precision Goldsmithing, Multi-Stage Crafting & Strict Metal Loss Reconciliation
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsIssueModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-9 gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="h-4 w-4" /> Issue Job Card
            </Button>
          </div>
        </div>

        {/* Operational KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pure Bullion In Custody</span>
              <Coins className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
              {totalPureGoldInCustody.toFixed(3)} <span className="text-sm text-amber-400 font-normal">g 24K</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Issued to {karigars.length} Master Craftsmen
            </div>
          </Card>

          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Artisan Job Cards</span>
              <Hammer className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
              {activeJobsCount} <span className="text-sm text-muted-foreground font-normal">Active Orders</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-blue-400" /> In casting, setting & polish
            </div>
          </Card>

          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atelier Metal Wastage Rate</span>
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
              {avgLossPct}% <span className="text-sm text-emerald-400 font-normal">(SLA ≤ 1.20%)</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Within statutory BIS tolerance
            </div>
          </Card>

          <Card className="bg-card/50 border-border/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Making Charges Allocated</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
              ₹ {totalLaborSpent.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Scale className="h-3 w-3 text-purple-400" /> High-jewelry artisan labor
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/40 space-x-1">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Hammer className="h-4 w-4" /> Active Job Cards ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("reconciliation")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reconciliation"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Scale className="h-4 w-4" /> Metal Loss & Scrap Reconciliation
          </button>
          <button
            onClick={() => setActiveTab("karigars")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "karigars"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <UserCheck className="h-4 w-4" /> Master Karigars Directory ({karigars.length})
          </button>
          <button
            onClick={() => setActiveTab("boms")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "boms"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" /> BOM Design Recipes ({boms.length})
          </button>
          <button
            onClick={() => setActiveTab("challans")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "challans"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
            data-testid="itc04-challans-tab-btn"
          >
            <FileText className="h-4 w-4" /> Form GST ITC-04 Challans
          </button>
        </div>

        {/* TAB 1: ACTIVE JOB CARDS */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job #, artisan or design..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-card/60 border-border/40 h-9 text-xs"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Karigar:</span>
                <select
                  value={selectedKarigarFilter}
                  onChange={(e) => setSelectedKarigarFilter(e.target.value)}
                  className="bg-card/80 border border-border/40 text-xs rounded-md px-3 py-1.5 text-white"
                >
                  <option value="ALL">All Craftsmen</option>
                  {karigars.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job Cards Stream */}
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="bg-card/40 border-border/40 p-5 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-amber-400">{job.jobNumber}</span>
                        <Badge
                          variant="outline"
                          className={
                            job.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                              : job.status === "QUALITY_INSPECTION"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]"
                          }
                        >
                          {job.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                          {job.category}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-white">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <UserCheck className="h-3 w-3 text-amber-400" /> Artisan: <strong>{job.karigarName}</strong>
                        </span>
                        <span>Due: {job.dueDate}</span>
                        <span>Labor Charge: ₹ {job.laborChargeInr.toLocaleString("en-IN")}</span>
                        {job.bomCode && <span className="font-mono text-zinc-400">Recipe: {job.bomCode}</span>}
                      </div>
                    </div>

                    {/* Weight & Carat Specs */}
                    <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 lg:border-l border-border/30 pt-3 lg:pt-0 lg:pl-5">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Issued Gross Metal</div>
                        <div className="text-sm font-bold text-white font-mono">{job.issuedGrossMetalGrams.toFixed(3)} g</div>
                        <div className="text-[10px] text-zinc-400">({job.issuedPureGoldGrams}g Au + {job.issuedAlloyGrams}g Alloy)</div>
                      </div>

                      {job.issuedDiamondCarats > 0 && (
                        <div className="text-right pl-3 border-l border-border/20">
                          <div className="text-xs text-muted-foreground">Gemstones</div>
                          <div className="text-sm font-bold text-cyan-400 font-mono">{job.issuedDiamondCarats.toFixed(2)} ct</div>
                          <div className="text-[10px] text-zinc-400">Diamonds</div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pl-2">
                        {job.status !== "COMPLETED" && (
                          <>
                            {job.stage !== "FINAL_QC" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdvanceStage(job)}
                                className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1"
                              >
                                Advance Stage <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleOpenReturnModal(job)}
                              className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1"
                            >
                              <Scale className="h-3.5 w-3.5" /> Record Return
                            </Button>
                          </>
                        )}
                        {job.status === "COMPLETED" && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1 py-1">
                            <CheckCircle2 className="h-3 w-3" /> Piece Hallmarked & Vaulted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stage Progress Timeline */}
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <div className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center justify-between">
                      <span>Crafting Lifecycle Pipeline:</span>
                      <span className="text-amber-400 font-mono">Current Stage: {job.stage}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {CRAFTING_STAGES.map((s, idx) => {
                        const currentIdx = CRAFTING_STAGES.indexOf(job.stage);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={s}
                            className={`rounded-md p-1.5 text-center text-[10px] font-medium transition-all ${
                              isCurrent
                                ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                                : isPast
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-zinc-800/60 text-zinc-500 border border-zinc-700/30"
                            }`}
                          >
                            {s.replace("_", " ")}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: METAL LOSS & RECONCILIATION */}
        {activeTab === "reconciliation" && (
          <div className="space-y-4">
            <Card className="bg-card/40 border-border/40 p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-white">Artisan Metal Reconciliation & Shrinkage Ledger</h3>
                <p className="text-xs text-muted-foreground">
                  In accordance with statutory hallmarking and internal atelier loss tolerance limits (Allowed ≤ 1.20% – 1.50%).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Job Order</th>
                      <th className="py-2.5 px-3">Artisan</th>
                      <th className="py-2.5 px-3 text-right">Issued Metal (g)</th>
                      <th className="py-2.5 px-3 text-right">Crafted Piece (g)</th>
                      <th className="py-2.5 px-3 text-right">Clean Scrap (g)</th>
                      <th className="py-2.5 px-3 text-right">Unrecovered Loss (g)</th>
                      <th className="py-2.5 px-3 text-right">Actual Loss %</th>
                      <th className="py-2.5 px-3 text-right">Allowed SLA</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-zinc-300">
                    {jobs.map((job) => {
                      const hasReturned = job.returnedCraftedPieceGrams > 0;
                      return (
                        <tr key={job.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-3 px-3 font-mono font-medium text-amber-400">{job.jobNumber}</td>
                          <td className="py-3 px-3 text-white font-medium">{job.karigarName}</td>
                          <td className="py-3 px-3 text-right font-mono">{job.issuedGrossMetalGrams.toFixed(3)}</td>
                          <td className="py-3 px-3 text-right font-mono">
                            {hasReturned ? job.returnedCraftedPieceGrams.toFixed(3) : "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {hasReturned ? job.returnedScrapMetalGrams.toFixed(3) : "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {hasReturned ? (
                              <span className="text-amber-300 font-semibold">{job.unrecoveredLossGrams.toFixed(3)}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {hasReturned ? `${job.actualLossPct.toFixed(2)}%` : "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                            ≤ {job.karigarTolerancePct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            {!hasReturned ? (
                              <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                                IN PROGRESS
                              </Badge>
                            ) : job.lossStatus === "WITHIN_TOLERANCE" ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                PASS (TOLERANCE OK)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]">
                                EXCESS LOSS
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {hasReturned && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSettleModalJob(job)}
                                className="h-6 text-[10px] px-2 font-mono border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
                                data-testid={`settle-loss-btn-${job.jobNumber}`}
                              >
                                Settle Loss
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: MASTER KARIGARS DIRECTORY */}
        {activeTab === "karigars" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {karigars.map((k) => {
              const assignedJobs = jobs.filter((j) => j.karigarId === k.id);
              const activeGold = assignedJobs
                .filter((j) => j.status !== "COMPLETED")
                .reduce((sum, j) => sum + j.issuedPureGoldGrams, 0);

              return (
                <Card key={k.id} className="bg-card/40 border-border/40 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-amber-400">{k.code}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{k.name}</h4>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      ACTIVE
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1.5 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specialization:</span>
                      <span className="font-medium text-amber-300">{k.specialization.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loss Tolerance:</span>
                      <span className="font-mono font-bold text-white">≤ {k.lossTolerancePct.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gold in Custody:</span>
                      <span className="font-mono text-amber-400 font-bold">{activeGold.toFixed(3)} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Orders:</span>
                      <span className="font-bold text-white">{assignedJobs.filter((j) => j.status !== "COMPLETED").length}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/20 pt-2 text-[11px] text-muted-foreground">
                    <div>{k.address}</div>
                    {k.phone && <div>Tel: {k.phone}</div>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 4: BOM RECIPES */}
        {activeTab === "boms" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boms.map((bom) => (
              <Card key={bom.id} className="bg-card/40 border-border/40 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-amber-400 font-bold">{bom.bomCode}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{bom.name}</h4>
                  </div>
                  <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                    {bom.category}
                  </Badge>
                </div>

                <div className="text-xs space-y-1.5 text-zinc-300 border-t border-border/20 pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Purity:</span>
                    <span className="font-semibold text-white">{bom.targetPurity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Gross Weight:</span>
                    <span className="font-mono font-bold text-amber-400">{bom.targetGrossWeightGrams.toFixed(2)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fine Gold Net:</span>
                    <span className="font-mono text-white">{bom.targetNetGoldGrams.toFixed(2)} g</span>
                  </div>
                  {bom.targetDiamondCarats > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diamonds Required:</span>
                      <span className="font-mono text-cyan-400 font-bold">{bom.targetDiamondCarats.toFixed(2)} ct</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Making Charge:</span>
                    <span className="font-bold text-emerald-400">₹ {bom.standardMakingChargeInr.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="border-t border-border/20 pt-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Components:</span>
                  <div className="mt-1.5 space-y-1">
                    {bom.componentsJson.map((c, i) => (
                      <div key={i} className="text-[11px] text-zinc-400 flex justify-between bg-zinc-900/50 px-2 py-1 rounded">
                        <span>{c.component || c.type}</span>
                        <span className="font-mono text-zinc-300">{c.qty || `${c.weightGrams}g` || `${c.carats}ct`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 5: FORM GST ITC-04 STATUTORY DELIVERY CHALLANS */}
        {activeTab === "challans" && (
          <Itc04ChallanRegistry />
        )}

        {/* ISSUE JOB CARD MODAL */}
        <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
          <DialogContent className="sm:max-w-[550px] bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Hammer className="h-5 w-5 text-amber-400" /> Issue Manufacturing Job Card (Karkhana Pass)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Authorize issue of raw fine gold grains, master alloys, and precious gemstones to a master artisan.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleIssueJobCard} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Assigned Master Karigar *</label>
                  <select
                    value={issueKarigarId}
                    onChange={(e) => setIssueKarigarId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
                    required
                  >
                    <option value="">Select Craftsman</option>
                    {karigars.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Select BOM Recipe (Optional)</label>
                  <select
                    value={issueBomId}
                    onChange={(e) => {
                      setIssueBomId(e.target.value);
                      const selected = boms.find((b) => b.id === e.target.value);
                      if (selected) {
                        setIssueTitle(selected.name);
                        setIssueCategory(selected.category);
                        setIssuePureGoldGrams(selected.targetNetGoldGrams.toString());
                        setIssueDiamondCarats(selected.targetDiamondCarats.toString());
                        setIssueLaborChargeInr(selected.standardMakingChargeInr.toString());
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
                  >
                    <option value="">Custom Piece (No Recipe)</option>
                    {boms.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bomCode} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Piece Title / Design Description *</label>
                <Input
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. 18K Oval Solitaire Halo Ring"
                  className="bg-zinc-900 border-zinc-700 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Category *</label>
                  <Input
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    placeholder="Rings & Solitaires"
                    className="bg-zinc-900 border-zinc-700 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Completion Due Date *</label>
                  <Input
                    type="date"
                    value={issueDueDate}
                    onChange={(e) => setIssueDueDate(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                <div className="space-y-1">
                  <label className="text-amber-400 font-semibold">24K Pure Gold (g) *</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={issuePureGoldGrams}
                    onChange={(e) => setIssuePureGoldGrams(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300">Master Alloy (g)</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={issueAlloyGrams}
                    onChange={(e) => setIssueAlloyGrams(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-cyan-400">Diamonds (Carats)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={issueDiamondCarats}
                    onChange={(e) => setIssueDiamondCarats(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Artisan Making Charge (₹)</label>
                  <Input
                    type="number"
                    value={issueLaborChargeInr}
                    onChange={(e) => setIssueLaborChargeInr(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Special Instructions / Notes</label>
                  <Input
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="e.g. Micro-claw prongs, antique kundan"
                    className="bg-zinc-900 border-zinc-700 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="border-zinc-700 text-zinc-300 h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-9 text-xs gap-1.5"
                >
                  <Check className="h-4 w-4" /> Issue Job Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* RECORD RETURN & SCRAP WEIGHING MODAL */}
        <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Scale className="h-5 w-5 text-amber-400" /> Record Artisan Return & Scrap Weighing
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Weigh crafted piece and collected clean scrap sprues to reconcile metal loss.
              </DialogDescription>
            </DialogHeader>

            {selectedJobForReturn && (
              <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
                <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Order:</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedJobForReturn.jobNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Artisan:</span>
                    <span className="text-white font-medium">{selectedJobForReturn.karigarName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Metal Issued:</span>
                    <span className="font-mono text-white font-bold">{selectedJobForReturn.issuedGrossMetalGrams.toFixed(3)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Allowed Loss SLA:</span>
                    <span className="font-mono text-emerald-400 font-bold">≤ {selectedJobForReturn.karigarTolerancePct.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-emerald-400 font-semibold">Crafted Piece Gross (g) *</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={returnPieceWeightGrams}
                      onChange={(e) => setReturnPieceWeightGrams(e.target.value)}
                      placeholder="e.g. 4.850"
                      className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold">Clean Scrap Sprues (g) *</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={returnScrapWeightGrams}
                      onChange={(e) => setReturnScrapWeightGrams(e.target.value)}
                      placeholder="e.g. 2.410"
                      className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Real-time Loss Calculation Preview */}
                {returnPieceWeightGrams && returnScrapWeightGrams && (
                  <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800 space-y-1 text-xs">
                    {(() => {
                      const p = parseFloat(returnPieceWeightGrams) || 0;
                      const s = parseFloat(returnScrapWeightGrams) || 0;
                      const totalRet = p + s;
                      const issued = selectedJobForReturn.issuedGrossMetalGrams;
                      const loss = Math.max(0, issued - totalRet);
                      const pct = issued > 0 ? (loss / issued) * 100 : 0;
                      const isOk = pct <= selectedJobForReturn.karigarTolerancePct;

                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Returned Metal:</span>
                            <span className="font-mono text-white">{totalRet.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unrecovered Filing Dust / Loss:</span>
                            <span className="font-mono text-amber-300 font-bold">{loss.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-zinc-800">
                            <span className="text-muted-foreground">Actual Loss Percentage:</span>
                            <Badge
                              variant="outline"
                              className={isOk ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono" : "bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono"}
                            >
                              {pct.toFixed(2)}% ({isOk ? "Within Tolerance" : "Excess Loss"})
                            </Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-muted-foreground">Inspection Notes</label>
                  <Input
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="e.g. Sprues recovered, weighed on Mettler Toledo scale"
                    className="bg-zinc-900 border-zinc-700 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="border-zinc-700 text-zinc-300 h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-9 text-xs gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Finalize Weighing & Advance to QC
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* KARIGAR LOSS SETTLEMENT MODAL */}
        <KarigarSettlementModal
          isOpen={Boolean(settleModalJob)}
          onClose={() => setSettleModalJob(null)}
          job={settleModalJob}
          onSuccess={(settlement) => {
            setJobs((prev) =>
              prev.map((j) =>
                j.jobNumber === settlement.jobNumber
                  ? {
                      ...j,
                      lossStatus: settlement.lossStatus === "WITHIN_TOLERANCE" ? "WITHIN_TOLERANCE" : "EXCESS_LOSS",
                      status: "COMPLETED",
                    }
                  : j,
              ),
            );
          }}
        />
      </div>
    </AppShell>
  );
}
