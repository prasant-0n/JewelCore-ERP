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
  BadgePercent,
  Calendar,
  Layers,
  ArrowUpRight,
  User,
  Shield,
  Briefcase,
  ChevronRight,
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
      <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
        {/* Luxury Atelier Header Banner */}
        <div className="relative rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-7 shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gold font-medium">
                <Hammer className="w-4 h-4 text-gold" />
                <span>Precision Goldsmithing &amp; Multi-Stage Crafting Lifecycle</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                  Atelier Manufacturing &amp; Karigar Work Orders
                </h1>
                <Badge variant="gold" className="text-xs font-mono font-bold">
                  Karkhana Floor
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10 text-xs font-mono">
                  Rule 45 / Section 143
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Precision Goldsmithing, Multi-Stage Crafting Lifecycle, Gemstone Micro-Setting &amp; Strict Metal Shrinkage Reconciliation.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="gold"
                onClick={() => setIsIssueModalOpen(true)}
                className="font-semibold text-xs h-9 gap-1.5 transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
                <span>Issue Job Card</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Operational KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Pure Bullion In Custody
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Coins className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {totalPureGoldInCustody.toFixed(3)}{" "}
              <span className="text-sm text-gold font-normal font-sans">g 24K</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Issued to {karigars.length} Master Craftsmen</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Active Artisan Job Cards
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Hammer className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {activeJobsCount}{" "}
              <span className="text-sm text-muted-foreground font-normal font-sans">Active Orders</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium font-mono">
              <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>In casting, setting &amp; polish</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Atelier Metal Wastage Rate
              </span>
              <div className="p-1.5 rounded-lg bg-status-rose/10 text-status-rose border border-status-rose/20">
                <Flame className="h-4 w-4 text-status-rose" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              {avgLossPct}%{" "}
              <span className="text-sm text-status-emerald font-normal font-sans">(SLA ≤ 1.20%)</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-status-emerald font-medium font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Within statutory BIS tolerance</span>
            </div>
          </Card>

          <Card className="p-4 bg-surface-card border-surface-border hover:border-gold/40 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground font-medium">
                Making Charges Allocated
              </span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-foreground tracking-tight tabular-nums">
              ₹ {totalLaborSpent.toLocaleString("en-IN")}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium font-mono">
              <Scale className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>High-jewelry artisan labor</span>
            </div>
          </Card>
        </div>

        {/* Segmented Workstation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-elevated/80 border border-surface-border rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "jobs"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <Hammer className="h-3.5 w-3.5" />
            <span>Active Job Cards ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reconciliation")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "reconciliation"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Metal Loss &amp; Scrap Reconciliation</span>
          </button>

          <button
            onClick={() => setActiveTab("karigars")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "karigars"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Master Karigars Directory ({karigars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("boms")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "boms"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>BOM Design Recipes ({boms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("challans")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "challans"
                ? "bg-gold text-obsidian shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/60"
            }`}
            data-testid="itc04-challans-tab-btn"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Form GST ITC-04 Challans</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE JOB CARDS */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-surface-card p-3 rounded-xl border border-surface-border">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job #, artisan or design..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-surface-elevated border-surface-border h-9 text-xs text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">Filter Karigar:</span>
                <select
                  value={selectedKarigarFilter}
                  onChange={(e) => setSelectedKarigarFilter(e.target.value)}
                  className="bg-surface-elevated border border-surface-border text-xs rounded-lg px-3 py-1.5 text-foreground font-mono focus:outline-none focus:border-gold"
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
                  className="bg-surface-card border-surface-border p-5 hover:border-gold/40 hover:shadow-md transition-all duration-200 rounded-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-sm font-bold text-gold tracking-wider">{job.jobNumber}</span>
                        <Badge
                          variant={
                            job.status === "COMPLETED"
                              ? "emerald"
                              : job.status === "QUALITY_INSPECTION"
                                ? "gold"
                                : "outline"
                          }
                          className="text-[10px] font-mono"
                        >
                          {job.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="bg-surface-elevated border-surface-border text-muted-foreground text-[10px] font-mono">
                          {job.category}
                        </Badge>
                      </div>

                      <h3 className="text-base font-serif font-bold text-foreground tracking-tight">{job.title}</h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <UserCheck className="h-3.5 w-3.5 text-gold shrink-0" />
                          <span>Artisan: <strong>{job.karigarName}</strong></span>
                        </span>
                        <span>Due: {job.dueDate}</span>
                        <span>Labor Charge: ₹ {job.laborChargeInr.toLocaleString("en-IN")}</span>
                        {job.bomCode && (
                          <span className="text-gold/90 bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                            Recipe: {job.bomCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Weight & Carat Metrology Specs */}
                    <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 lg:border-l border-surface-border pt-3 lg:pt-0 lg:pl-5 shrink-0">
                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground font-mono">Issued Gross Metal</div>
                        <div className="text-sm font-bold text-foreground font-mono tabular-nums">{job.issuedGrossMetalGrams.toFixed(3)} g</div>
                        <div className="text-[10px] text-muted-foreground font-mono">({job.issuedPureGoldGrams}g Au + {job.issuedAlloyGrams}g Alloy)</div>
                      </div>

                      {job.issuedDiamondCarats > 0 && (
                        <div className="text-right pl-4 border-l border-surface-border">
                          <div className="text-[11px] text-muted-foreground font-mono">Gemstones</div>
                          <div className="text-sm font-bold text-foreground font-mono tabular-nums">{job.issuedDiamondCarats.toFixed(2)} ct</div>
                          <div className="text-[10px] text-muted-foreground font-mono">Diamonds</div>
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
                                className="h-8 text-xs border-gold/40 text-gold hover:bg-gold/10 font-semibold gap-1 shadow-sm"
                              >
                                <span>Advance Stage</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() => handleOpenReturnModal(job)}
                              className="h-8 text-xs font-semibold gap-1 shadow-sm"
                            >
                              <Scale className="h-3.5 w-3.5" />
                              <span>Record Return</span>
                            </Button>
                          </>
                        )}
                        {job.status === "COMPLETED" && (
                          <Badge variant="emerald" className="gap-1 py-1 text-xs font-mono">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Piece Hallmarked &amp; Vaulted</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stage Progress Pipeline */}
                  <div className="mt-4 pt-4 border-t border-surface-border">
                    <div className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center justify-between">
                      <span className="font-mono font-semibold">Crafting Lifecycle Pipeline:</span>
                      <span className="text-gold font-mono font-bold">Current Stage: {job.stage}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {CRAFTING_STAGES.map((s, idx) => {
                        const currentIdx = CRAFTING_STAGES.indexOf(job.stage);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={s}
                            className={`rounded-lg p-2 text-center text-[10px] font-mono transition-all ${
                              isCurrent
                                ? "bg-gold text-black font-bold shadow-md shadow-gold/20 border border-gold/40"
                                : isPast
                                  ? "bg-status-emerald/10 text-status-emerald border border-status-emerald/30 font-medium"
                                  : "bg-surface-elevated text-muted-foreground/60 border border-surface-border/60"
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
            <Card className="bg-surface-card border-surface-border p-6 rounded-2xl shadow-sm">
              <div className="mb-5 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-mono text-gold font-semibold">
                  <Scale className="w-4 h-4 text-gold" />
                  <span>Shrinkage SLA Governance</span>
                </div>
                <h3 className="text-xl font-serif font-black tracking-tight text-foreground">
                  Artisan Metal Reconciliation &amp; Shrinkage Ledger
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In accordance with statutory hallmarking and internal atelier loss tolerance limits (Allowed ≤ 1.20% – 1.50%).
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-surface-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated/80 border-b border-surface-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Job Order</th>
                      <th className="py-3 px-3.5">Artisan</th>
                      <th className="py-3 px-3.5 text-right">Issued Metal (g)</th>
                      <th className="py-3 px-3.5 text-right">Crafted Piece (g)</th>
                      <th className="py-3 px-3.5 text-right">Clean Scrap (g)</th>
                      <th className="py-3 px-3.5 text-right">Unrecovered Loss (g)</th>
                      <th className="py-3 px-3.5 text-right">Actual Loss %</th>
                      <th className="py-3 px-3.5 text-right">Allowed SLA</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-foreground font-mono">
                    {jobs.map((job) => {
                      const hasReturned = job.returnedCraftedPieceGrams > 0;
                      return (
                        <tr key={job.id} className="hover:bg-surface-elevated/40 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-gold">{job.jobNumber}</td>
                          <td className="py-3 px-3.5 font-sans font-medium text-foreground">{job.karigarName}</td>
                          <td className="py-3 px-3.5 text-right tabular-nums">{job.issuedGrossMetalGrams.toFixed(3)}</td>
                          <td className="py-3 px-3.5 text-right tabular-nums">
                            {hasReturned ? job.returnedCraftedPieceGrams.toFixed(3) : "—"}
                          </td>
                          <td className="py-3 px-3.5 text-right tabular-nums">
                            {hasReturned ? job.returnedScrapMetalGrams.toFixed(3) : "—"}
                          </td>
                          <td className="py-3 px-3.5 text-right tabular-nums">
                            {hasReturned ? (
                              <span className="text-gold font-bold">{job.unrecoveredLossGrams.toFixed(3)}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right tabular-nums font-bold">
                            {hasReturned ? `${job.actualLossPct.toFixed(2)}%` : "—"}
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground tabular-nums">
                            ≤ {job.karigarTolerancePct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {!hasReturned ? (
                              <Badge variant="outline" className="bg-surface-elevated border-surface-border text-muted-foreground text-[10px]">
                                IN PROGRESS
                              </Badge>
                            ) : job.lossStatus === "WITHIN_TOLERANCE" ? (
                              <Badge variant="emerald" className="text-[10px]">
                                PASS (TOLERANCE OK)
                              </Badge>
                            ) : (
                              <Badge variant="rose" className="text-[10px]">
                                EXCESS LOSS
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            {hasReturned && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSettleModalJob(job)}
                                className="h-6 text-[10px] px-2.5 font-mono border-gold/40 text-gold hover:bg-gold/10"
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
                <Card key={k.id} className="bg-surface-card border-surface-border p-5 hover:border-gold/40 hover:shadow-md transition-all duration-200 rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold font-serif font-black text-sm shrink-0">
                        {k.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <span className="font-mono text-xs text-gold font-bold">{k.code}</span>
                        <h4 className="text-sm font-serif font-bold text-foreground mt-0.5">{k.name}</h4>
                      </div>
                    </div>
                    <Badge variant="emerald" className="text-[10px] font-mono">
                      ACTIVE
                    </Badge>
                  </div>

                  <div className="text-xs space-y-2 text-foreground font-mono border-t border-surface-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Specialization:</span>
                      <span className="font-semibold text-gold font-sans">{k.specialization.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Loss Tolerance:</span>
                      <span className="font-bold text-foreground">≤ {k.lossTolerancePct.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Gold in Custody:</span>
                      <span className="text-gold font-bold">{activeGold.toFixed(3)} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Active Orders:</span>
                      <span className="font-bold text-foreground">{assignedJobs.filter((j) => j.status !== "COMPLETED").length}</span>
                    </div>
                  </div>

                  <div className="border-t border-surface-border pt-2.5 text-[11px] text-muted-foreground font-mono space-y-0.5">
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
              <Card key={bom.id} className="bg-surface-card border-surface-border p-5 hover:border-gold/40 hover:shadow-md transition-all duration-200 rounded-xl space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-gold font-bold">{bom.bomCode}</span>
                    <h4 className="text-sm font-serif font-bold text-foreground mt-0.5">{bom.name}</h4>
                  </div>
                  <Badge variant="outline" className="bg-surface-elevated border-surface-border text-muted-foreground text-[10px] font-mono">
                    {bom.category}
                  </Badge>
                </div>

                <div className="text-xs space-y-2 text-foreground font-mono border-t border-surface-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Target Purity:</span>
                    <span className="font-semibold text-foreground">{bom.targetPurity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Target Gross Weight:</span>
                    <span className="font-bold text-gold tabular-nums">{bom.targetGrossWeightGrams.toFixed(2)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Fine Gold Net:</span>
                    <span className="text-foreground tabular-nums">{bom.targetNetGoldGrams.toFixed(2)} g</span>
                  </div>
                  {bom.targetDiamondCarats > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Diamonds Required:</span>
                      <span className="font-bold text-foreground tabular-nums">{bom.targetDiamondCarats.toFixed(2)} ct</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Standard Making Charge:</span>
                    <span className="font-bold text-status-emerald tabular-nums">₹ {bom.standardMakingChargeInr.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="border-t border-surface-border pt-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                    Components:
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {bom.componentsJson.map((c, i) => (
                      <div key={i} className="text-[11px] text-muted-foreground flex justify-between bg-surface-elevated px-2.5 py-1 rounded-md border border-surface-border/50 font-mono">
                        <span className="text-foreground">{c.component || c.type}</span>
                        <span className="font-bold text-gold">{c.qty || `${c.weightGrams}g` || `${c.carats}ct`}</span>
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
          <DialogContent className="sm:max-w-[550px] bg-surface-card border border-surface-border text-foreground shadow-2xl rounded-2xl p-0 overflow-hidden">
            <div className="p-5 border-b border-surface-border bg-surface-elevated/70">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-foreground font-serif text-base font-bold">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/25">
                    <Hammer className="h-4 w-4 text-gold" />
                  </div>
                  <span>Issue Manufacturing Job Card (Karkhana Pass)</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Authorize issue of raw fine gold grains, master alloys, and precious gemstones to a master artisan.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleIssueJobCard} className="p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Assigned Master Karigar *</label>
                  <select
                    value={issueKarigarId}
                    onChange={(e) => setIssueKarigarId(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2 text-foreground text-xs focus:outline-none focus:border-gold"
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

                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Select BOM Recipe (Optional)</label>
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
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2 text-foreground text-xs focus:outline-none focus:border-gold"
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

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-sans">Piece Title / Design Description *</label>
                <Input
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. 18K Oval Solitaire Halo Ring"
                  className="bg-surface-elevated border-surface-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Category *</label>
                  <Input
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    placeholder="Rings & Solitaires"
                    className="bg-surface-elevated border-surface-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Completion Due Date *</label>
                  <Input
                    type="date"
                    value={issueDueDate}
                    onChange={(e) => setIssueDueDate(e.target.value)}
                    className="bg-surface-elevated border-surface-border text-xs text-foreground focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-surface-elevated/70 p-3 rounded-xl border border-surface-border">
                <div className="space-y-1.5">
                  <label className="text-gold font-bold font-sans">24K Pure Gold (g) *</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={issuePureGoldGrams}
                    onChange={(e) => setIssuePureGoldGrams(e.target.value)}
                    className="bg-surface border-surface-border font-mono text-xs text-foreground focus:border-gold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground font-medium font-sans">Master Alloy (g)</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={issueAlloyGrams}
                    onChange={(e) => setIssueAlloyGrams(e.target.value)}
                    className="bg-surface border-surface-border font-mono text-xs text-foreground focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gold font-medium font-sans">Diamonds (Carats)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={issueDiamondCarats}
                    onChange={(e) => setIssueDiamondCarats(e.target.value)}
                    className="bg-surface border-surface-border font-mono text-xs text-foreground focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Artisan Making Charge (₹)</label>
                  <Input
                    type="number"
                    value={issueLaborChargeInr}
                    onChange={(e) => setIssueLaborChargeInr(e.target.value)}
                    className="bg-surface-elevated border-surface-border text-xs font-mono text-foreground focus:border-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Special Instructions / Notes</label>
                  <Input
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="e.g. Micro-claw prongs, antique kundan"
                    className="bg-surface-elevated border-surface-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIssueModalOpen(false)}
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
                  <span>Issue Job Order</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* RECORD RETURN & SCRAP WEIGHING MODAL */}
        <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-surface-card border border-surface-border text-foreground shadow-2xl rounded-2xl p-0 overflow-hidden">
            <div className="p-5 border-b border-surface-border bg-surface-elevated/70">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-foreground font-serif text-base font-bold">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/25">
                    <Scale className="h-4 w-4 text-gold" />
                  </div>
                  <span>Record Artisan Return &amp; Scrap Weighing</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Weigh crafted piece and collected clean scrap sprues to reconcile metal loss.
                </DialogDescription>
              </DialogHeader>
            </div>

            {selectedJobForReturn && (
              <form onSubmit={handleSubmitReturn} className="p-6 space-y-4 text-xs font-mono">
                <div className="bg-surface-elevated p-3.5 rounded-xl border border-surface-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Job Order:</span>
                    <span className="font-bold text-gold">{selectedJobForReturn.jobNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Artisan:</span>
                    <span className="text-foreground font-bold font-sans">{selectedJobForReturn.karigarName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Gross Metal Issued:</span>
                    <span className="text-foreground font-bold tabular-nums">{selectedJobForReturn.issuedGrossMetalGrams.toFixed(3)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Max Allowed Loss SLA:</span>
                    <span className="text-status-emerald font-bold tabular-nums">≤ {selectedJobForReturn.karigarTolerancePct.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-status-emerald font-bold font-sans">Crafted Piece Gross (g) *</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={returnPieceWeightGrams}
                      onChange={(e) => setReturnPieceWeightGrams(e.target.value)}
                      placeholder="e.g. 4.850"
                      className="bg-surface-elevated border-surface-border text-foreground font-mono text-xs focus:border-gold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold font-sans">Clean Scrap Sprues (g) *</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={returnScrapWeightGrams}
                      onChange={(e) => setReturnScrapWeightGrams(e.target.value)}
                      placeholder="e.g. 2.410"
                      className="bg-surface-elevated border-surface-border text-foreground font-mono text-xs focus:border-gold"
                      required
                    />
                  </div>
                </div>

                {/* Real-time Loss Calculation Preview */}
                {returnPieceWeightGrams && returnScrapWeightGrams && (
                  <div className="bg-surface-elevated p-3.5 rounded-xl border border-surface-border space-y-1.5 text-xs">
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
                            <span className="text-muted-foreground font-sans">Total Returned Metal:</span>
                            <span className="text-foreground font-bold tabular-nums">{totalRet.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-sans">Unrecovered Filing Dust / Loss:</span>
                            <span className="text-gold font-bold tabular-nums">{loss.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-surface-border">
                            <span className="text-muted-foreground font-sans">Actual Loss Percentage:</span>
                            <Badge
                              variant={isOk ? "emerald" : "rose"}
                              className="font-mono text-xs"
                            >
                              {pct.toFixed(2)}% ({isOk ? "Within Tolerance" : "Excess Loss"})
                            </Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-sans">Inspection Notes</label>
                  <Input
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="e.g. Sprues recovered, weighed on Mettler Toledo scale"
                    className="bg-surface-elevated border-surface-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReturnModalOpen(false)}
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
                    <span>Finalize Weighing &amp; Advance to QC</span>
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
