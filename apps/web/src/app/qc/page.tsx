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
import {
  FlaskConical,
  Scale,
  ShieldAlert,
  CheckCircle2,
  Search,
  Plus,
  Microscope,
  Sliders,
} from "lucide-react";

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
        id: "qc-itm-11",
        itemCode: "QC-ITM-11",
        parentPieceSerial: "JWL-2026-08913",
        materialDescription: "22K Solid Gold Kundan Choker",
        grossWeightGrams: 48.65,
        hydrostaticWeightGrams: 45.92,
        specificGravity: 17.82,
        standardGrossWeightGrams: 48.65,
        varianceGrams: 0.0,
        variancePercent: 0.0,
        purityPercent: 91.68,
        finenessString: "916.8",
        elements: { au: 91.68, ag: 5.2, cu: 3.12 },
        toleranceStatus: "TOLERANCE_OK",
        status: "PASSED",
        destinationPath: "Vault 02 (Retail Strongroom) > Safe 01 > Tray B1",
      },
    ],
  },
  {
    id: "qc-sess-1190",
    sessionNumber: "Session QC-2026-1190",
    batchName: "Solitaire Diamond Rings 1.25ct (Pt950)",
    inspectorName: "Dr. A. Joshi",
    instrumentModel: "Mettler Hydrostatic Density Stage",
    itemsCount: 8,
    status: "PASSED",
    isIsoCertified: true,
    items: [
      {
        id: "qc-itm-21",
        itemCode: "QC-ITM-21",
        parentPieceSerial: "JWL-2026-08915",
        materialDescription: "Platinum Eternity Band 0.85ct",
        grossWeightGrams: 6.84,
        hydrostaticWeightGrams: 6.52,
        specificGravity: 21.45,
        standardGrossWeightGrams: 6.84,
        varianceGrams: 0.0,
        variancePercent: 0.0,
        purityPercent: 95.2,
        finenessString: "952.0",
        elements: { au: 0.0, ag: 0.0, cu: 4.8, pt: 95.2 },
        toleranceStatus: "TOLERANCE_OK",
        status: "PASSED",
        destinationPath: "Vault 01 (Primary Safe) > Locker 02 > Tray B1",
      },
    ],
  },
  {
    id: "qc-sess-1191",
    sessionNumber: "Session QC-2026-1191",
    batchName: "Argor-Heraeus Dore Bar Inward Quarantine",
    inspectorName: "R. Sen",
    instrumentModel: "Thermo Niton XL5 Plus (COM4)",
    itemsCount: 4,
    status: "QUARANTINED",
    isIsoCertified: true,
    items: [
      {
        id: "qc-itm-31",
        itemCode: "QC-ITM-31",
        parentPieceSerial: "AH-DORE-01",
        materialDescription: "Au 995.0 Unrefined Dore Bar",
        grossWeightGrams: 4449.88,
        hydrostaticWeightGrams: 4212.1,
        specificGravity: 18.72,
        standardGrossWeightGrams: 4450.0,
        varianceGrams: -0.12,
        variancePercent: -0.003,
        purityPercent: 99.48,
        finenessString: "994.8",
        elements: { au: 99.48, ag: 0.35, cu: 0.17 },
        toleranceStatus: "TOLERANCE_OK",
        status: "QUARANTINED",
        destinationPath: "Vault 03 (QC Safe) > Locker 05 > Tray Q1",
      },
    ],
  },
];

export default function QcLabPage() {
  const [sessions, setSessions] = useState<QcSessionData[]>(INITIAL_QC_SESSIONS);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "UNDER_INSPECTION" | "QUARANTINED" | "PASSED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<QcItemData | null>(
    INITIAL_QC_SESSIONS[0].items[0]
  );
  const [selectedSessionName, setSelectedSessionName] = useState<string>(
    INITIAL_QC_SESSIONS[0].sessionNumber + " > " + INITIAL_QC_SESSIONS[0].batchName
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic filter
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
          item.parentPieceSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/70 uppercase tracking-wider mb-1">
              <span>Flagship Mumbai (INV-11)</span>
              <span>&gt;</span>
              <span className="text-gold font-medium">
                Analytical QC &amp; Assay Lab
              </span>
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Thermo Niton XRF Spectrometer COM4 Live • Calibrated
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Analytical QC &amp; Metallurgical Assay Directory
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-surface-card border border-surface-border text-xs font-medium text-slate-200 hover:border-gold/50 hover:text-gold flex items-center space-x-1.5 transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5 text-platinum/60" />
              <span>+ New Inspection Batch</span>
            </button>
            <button
              onClick={() => alert("Spectrometer COM4 Drift Calibration Zeroed: Reference Standard Au999.9 Verified.")}
              className="px-3.5 py-1.5 rounded-md bg-gold text-obsidian text-xs font-semibold hover:bg-gold-light flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Calibrate Spectrometer</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards (Matching Screen 2 & Screen 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Active QC Sessions */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Active QC Sessions
              </span>
              <FlaskConical className="w-4 h-4 text-gold/70" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-slate-100">
                4 Inspection Lots
              </div>
              <p className="mt-1 text-xs text-platinum/60 truncate">
                Inward Gold, Kundan Chokers, Solitaire Rings
              </p>
            </div>
          </div>

          {/* Metric 2: Pieces Tested Today */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Pieces Tested Today
              </span>
              <Scale className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-gold-light tabular-nums">
                48 / 60 <span className="text-sm font-sans font-normal text-platinum">Items</span>
              </div>
              <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                <span>● Au 999.9, Au 916, Pt 950 Verified</span>
              </p>
            </div>
          </div>

          {/* Metric 3: Quarantine Hold Rate */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Quarantine Hold
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-amber-300">
                4 Discrepant Lots
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                Awaiting Senior Metallurgist Review
              </p>
            </div>
          </div>

          {/* Metric 4: First-Pass Hallmarking */}
          <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-platinum">
              <span className="uppercase font-mono text-[10px] tracking-wider">
                Hallmark Rate
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-100">
                96.8% Passed
              </div>
              <p className="mt-1 text-xs text-platinum/60">
                Zero tolerance deviation across 142 assays
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace (65% Directory / 35% Inspector) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column (8 of 12 spans = 65%): QC Inspection Directory */}
          <div className="xl:col-span-8 space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-card p-3 rounded-xl border border-surface-border shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-platinum/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by QC Batch ID, Item Serial, Alloy, or Metallurgist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-obsidian-deep border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-platinum/40 focus:outline-none focus:border-gold/60 transition-colors"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Batches" },
                  { id: "UNDER_INSPECTION", label: "Under Inspection" },
                  { id: "QUARANTINED", label: "Quarantined" },
                  { id: "PASSED", label: "Hallmark Passed" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id as any)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all whitespace-nowrap ${
                      activeFilter === id
                        ? "bg-gold text-obsidian font-bold shadow-sm"
                        : "text-platinum/70 hover:text-slate-100 bg-obsidian-deep border border-surface-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* QC Session Cards */}
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 bg-surface-card border border-surface-border rounded-xl text-platinum/50 text-xs">
                No QC inspection sessions match your filter criteria.
              </div>
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

          {/* Right Column (4 of 12 spans = 35%): Selected QC Item Assay Inspector */}
          <div className="xl:col-span-4 sticky top-6 self-start h-[calc(100vh-140px)]">
            <AssayInspector
              item={selectedItem}
              parentSessionName={selectedSessionName}
            />
          </div>
        </div>

        {/* New QC Batch Modal */}
        <NewQcBatchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            // refresh data
          }}
        />
      </div>
    </AppShell>
  );
}
