"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import { QcItemData } from "../../components/qc/QcItemCard";
import {
  QcSessionSection,
  QcSessionData,
} from "../../components/qc/QcSessionSection";
import { AssayInspector } from "../../components/qc/AssayInspector";
import { NewQcBatchModal } from "../../components/qc/NewQcBatchModal";
import { BisHuidRegistryModal } from "../../components/qc/BisHuidRegistryModal";
import {
  FlaskConical,
  Scale,
  ShieldAlert,
  CheckCircle2,
  Search,
  Plus,
  Microscope,
  Award,
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

const INITIAL_QC_SESSIONS: QcSessionData[] = [
  {
    id: "qc-sess-1188",
    sessionNumber: "Session QC-2026-1188",
    batchName: "Inward Raw Bullion & Ingot Assay (Valcambi Lot)",
    inspectorName: "Dr. A. Joshi",
    instrumentModel: "Thermo Niton XL5 Plus (COM4)",
    itemsCount: 3,
    status: "UNDER_INSPECTION",
    isIsoCertified: true,
    items: [
      {
        id: "qc-itm-01",
        itemCode: "QC-ITM-01",
        parentPieceSerial: "VAL-BAR-01",
        materialDescription: "999.9 Fine Gold Cast Ingot",
        grossWeightGrams: 1000.042,
        hydrostaticWeightGrams: 948.182,
        specificGravity: 19.32,
        standardGrossWeightGrams: 1000.0,
        varianceGrams: 0.042,
        variancePercent: 0.004,
        purityPercent: 99.98,
        finenessString: "999.8",
        elements: { au: 99.98, ag: 0.015, cu: 0.005 },
        toleranceStatus: "TOLERANCE_OK",
        status: "UNDER_INSPECTION",
        destinationPath: "Vault 01 (Primary Safe) > Locker 01 > Tray A1",
      },
      {
        id: "qc-itm-02",
        itemCode: "QC-ITM-02",
        parentPieceSerial: "VAL-BAR-02",
        materialDescription: "999.9 Fine Gold Cast Ingot",
        grossWeightGrams: 1000.038,
        hydrostaticWeightGrams: 948.185,
        specificGravity: 19.31,
        standardGrossWeightGrams: 1000.0,
        varianceGrams: 0.038,
        variancePercent: 0.004,
        purityPercent: 99.99,
        finenessString: "999.9",
        elements: { au: 99.99, ag: 0.008, cu: 0.002 },
        toleranceStatus: "TOLERANCE_OK",
        status: "UNDER_INSPECTION",
        destinationPath: "Vault 01 (Primary Safe) > Locker 01 > Tray A1",
      },
      {
        id: "qc-itm-03",
        itemCode: "QC-ITM-03",
        parentPieceSerial: "VAL-BAR-03",
        materialDescription: "999.9 Fine Gold Cast Ingot",
        grossWeightGrams: 1000.04,
        hydrostaticWeightGrams: 948.181,
        specificGravity: 19.32,
        standardGrossWeightGrams: 1000.0,
        varianceGrams: 0.04,
        variancePercent: 0.004,
        purityPercent: 99.97,
        finenessString: "999.7",
        elements: { au: 99.97, ag: 0.021, cu: 0.009 },
        toleranceStatus: "TOLERANCE_OK",
        status: "UNDER_INSPECTION",
        destinationPath: "Vault 01 (Primary Safe) > Locker 01 > Tray A1",
      },
    ],
  },
  {
    id: "qc-sess-1189",
    sessionNumber: "Session QC-2026-1189",
    batchName: "Temple Kundan Bridal Chokers (Lot of 12)",
    inspectorName: "M. Kulkarni",
    instrumentModel: "Oxford X-Strata 920",
    itemsCount: 12,
    status: "PASSED",
    isIsoCertified: true,
    items: [
      {
        id: "qc-itm-04",
        itemCode: "QC-ITM-04",
        parentPieceSerial: "JWL-2026-08913",
        materialDescription: "22K Kundan Choker Necklace",
        grossWeightGrams: 48.65,
        hydrostaticWeightGrams: 45.92,
        specificGravity: 17.65,
        standardGrossWeightGrams: 48.65,
        varianceGrams: 0.0,
        variancePercent: 0.0,
        purityPercent: 91.68,
        finenessString: "916 (22K)",
        elements: { au: 91.68, ag: 5.12, cu: 3.2 },
        toleranceStatus: "TOLERANCE_OK",
        status: "PASSED",
        destinationPath: "Vault 01 > Safe 01 > Locker 02-B1",
      },
    ],
  },
];

const QC_KPIS: KpiItem[] = [
  {
    id: "kpi-sessions",
    title: "Active QC Sessions",
    value: "4 Inspection Lots",
    subValue: "Inward Gold, Kundan Chokers, Solitaire Rings",
    badge: { text: "Active", variant: "gold" },
    icon: <FlaskConical className="w-3.5 h-3.5 text-gold" />,
  },
  {
    id: "kpi-pieces",
    title: "Pieces Tested Today",
    value: "48 / 60 Items",
    subValue: "Au 999.9, Au 916, Pt 950 Verified",
    badge: { text: "80% Complete", variant: "emerald" },
    icon: <Scale className="w-3.5 h-3.5 text-status-emerald" />,
  },
  {
    id: "kpi-quarantine",
    title: "Quarantine Hold",
    value: "4 Discrepant Lots",
    subValue: "Awaiting Senior Metallurgist Review",
    badge: { text: "Action Req", variant: "amber" },
    icon: <ShieldAlert className="w-3.5 h-3.5 text-status-amber" />,
  },
  {
    id: "kpi-hallmark",
    title: "Hallmark Rate",
    value: "96.8% Passed",
    subValue: "Zero tolerance deviation across 142 assays",
    badge: { text: "BIS Compliant", variant: "emerald" },
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-status-emerald" />,
  },
];

export default function QcPage() {
  const [sessions, setSessions] =
    useState<QcSessionData[]>(INITIAL_QC_SESSIONS);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "UNDER_INSPECTION" | "PASSED" | "FAILED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<QcItemData | null>(
    INITIAL_QC_SESSIONS[0].items[0],
  );
  const [selectedSessionName, setSelectedSessionName] = useState<string>(
    INITIAL_QC_SESSIONS[0].sessionNumber +
      " > " +
      INITIAL_QC_SESSIONS[0].batchName,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHuidRegistryOpen, setIsHuidRegistryOpen] = useState(false);

  const filteredSessions = sessions
    .filter((sess) => {
      if (activeFilter === "ALL") return true;
      return sess.status === activeFilter;
    })
    .map((sess) => ({
      ...sess,
      items: sess.items.filter((item) => {
        const matchesQuery =
          searchQuery.trim() === "" ||
          item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.parentPieceSerial
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          sess.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sess.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
      }),
    }))
    .filter((sess) => sess.items.length > 0);

  const handleSelectItem = (item: QcItemData, session: QcSessionData) => {
    setSelectedItem(item);
    setSelectedSessionName(session.sessionNumber + " > " + session.batchName);
  };

  const handleCalibrate = () => {
    toast.success("Spectrometer Calibrated", {
      description:
        "Drift calibration zeroed: Reference standard Au999.9 certified.",
    });
  };

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Luxury Hero Analytical QC Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>Flagship Mumbai (INV-11)</span>
                <span>/</span>
                <span>Assay &amp; Hallmarking Lab</span>
                <span>/</span>
                <span className="text-gold font-medium">
                  Analytical QC &amp; Assay Lab
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">
                  Analytical QC &amp; Metallurgical Assay Directory
                </h1>
                <Badge variant="emerald" dot className="font-mono text-[11px] px-2.5 py-1 bg-status-emerald/10 text-status-emerald border border-status-emerald/30">
                  Thermo Niton XRF Spectrometer COM4 Live • Calibrated
                </Badge>
                <Badge variant="outline" className="border-gold/30 text-gold font-mono text-[11px] px-2.5 py-1">
                  BIS ISO 9001
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-3xl">
                Non-destructive XRF fluorescence spectrometry, karat fineness assay, hydrostatic specific gravity density verification, and BIS 6-digit alphanumeric HUID allocation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHuidRegistryOpen(true)}
                className="border-gold/40 text-gold hover:bg-gold/10 font-mono text-xs"
                data-testid="bis-huid-registry-btn"
              >
                <Award className="w-3.5 h-3.5 mr-1" />
                <span>BIS HUID Registry</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="border-surface-border hover:border-gold/40 hover:bg-gold/5 font-mono text-xs"
              >
                <FlaskConical className="w-3.5 h-3.5 mr-1" />
                <span>New Inspection Batch</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleCalibrate}
                className="font-mono text-xs font-semibold transition-colors duration-150"
              >
                <Microscope className="w-3.5 h-3.5 mr-1" />
                <span>Calibrate Spectrometer</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QC_KPIS.map((kpi) => (
            <Card
              key={kpi.id}
              className="relative overflow-hidden p-4 rounded-xl bg-surface-card border border-surface-border hover:border-gold/40 transition-colors duration-150 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground font-sans">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-lg bg-surface-elevated border border-surface-border/50 text-gold">
                  {kpi.icon}
                </div>
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight text-foreground">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-border/40 text-xs">
                <span className="text-muted-foreground font-mono">{kpi.subValue}</span>
                {kpi.badge && (
                  <Badge
                    variant={kpi.badge.variant as any}
                    className="font-mono text-[10px] px-1.5 py-0.5"
                  >
                    {kpi.badge.text}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Workstation 65% / 35% Layout */}
        <WorkstationLayout
          inspector={
            <AssayInspector
              item={selectedItem}
              parentSessionName={selectedSessionName}
            />
          }
        >
          {/* Left Column (65%): QC Inspection Directory */}
          <div className="space-y-4">
            {/* Luxury Search & Filter Toolbar */}
            <div className="bg-surface-card/90 border border-surface-border rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by Specimen ID, Assay Batch, or Metallurgist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg font-mono text-xs bg-surface-elevated border-surface-border"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center p-1 bg-surface-elevated rounded-lg border border-surface-border/60 gap-1 overflow-x-auto">
                {[
                  { id: "ALL", label: "All Sessions" },
                  { id: "UNDER_INSPECTION", label: "In Testing" },
                  { id: "PASSED", label: "Assay Passed" },
                  { id: "FAILED", label: "Quarantined" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id as any)}
                    className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                      activeFilter === id
                        ? "bg-gold text-obsidian font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-card/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspection Session Sections */}
            {filteredSessions.length === 0 ? (
              <Card className="text-center py-12 text-muted-foreground text-xs">
                No metallurgical assay sessions match your filter criteria.
              </Card>
            ) : (
              filteredSessions.map((session, idx) => (
                <QcSessionSection
                  key={session.id}
                  session={session}
                  selectedItemId={selectedItem?.id}
                  onSelectItem={handleSelectItem}
                  defaultExpanded={idx === 0}
                />
              ))
            )}
          </div>
        </WorkstationLayout>

        {/* New QC Batch Modal */}
        <NewQcBatchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* BIS Hallmarking & HUID Registry Modal */}
        <BisHuidRegistryModal
          isOpen={isHuidRegistryOpen}
          onClose={() => setIsHuidRegistryOpen(false)}
        />
      </div>
    </AppShell>
  );
}
