"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import {
  GovernanceItemCard,
  GovernanceItemData,
} from "../../components/governance/GovernanceItemCard";
import {
  GovernanceSection,
  GovernanceBatchGroupData,
} from "../../components/governance/GovernanceSection";
import { GovernanceInspector } from "../../components/governance/GovernanceInspector";
import { EmergencyOverrideModal } from "../../components/governance/EmergencyOverrideModal";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Search,
  Plus,
  Radio,
  Fingerprint,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const INITIAL_GOVERNANCE_BATCHES: GovernanceBatchGroupData[] = [
  {
    id: "batch-gov-01",
    batchNumber: "GOV-2026-091",
    batchTitle: "Request #GOV-2026-091: High-Security Safe 01 Bullion Withdrawal",
    vaultSafeTag: "Main Safe 01",
    thresholdCategory: "Mandatory Dual-Key (>₹1 Cr)",
    status: "QUORUM_PENDING",
    items: [
      {
        id: "gov-req-01",
        requestCode: "GOV-REQ-01",
        actionTitle: "5x 1Kg 24K Minted Bullion Withdrawal",
        category: "Vault Access",
        grossWeightGrams: 5000.0,
        valuationInr: 36702500,
        keyholder1Name: "M. Nair",
        keyholder1SignedAt: "15:40:12",
        keyholder2Name: "S. Joshi",
        keyholder2Status: "PENDING_KEY",
        status: "AWAITING_SECOND_KEY",
        targetVaultLocation: "Main Safe 01 • Compartment Ingot-Rack A",
        merkleProofHash: "SHA256:7d1a982fec349a1104e9bc33182a44b201",
      },
      {
        id: "gov-req-02",
        requestCode: "GOV-REQ-02",
        actionTitle: "VIP High-Value POS Release (Order #TXN-9811)",
        category: "High-Value POS",
        grossWeightGrams: 73.72,
        valuationInr: 2335000,
        keyholder1Name: "N. Mehta",
        keyholder1SignedAt: "15:42:00",
        keyholder2Name: "S. Joshi",
        keyholder2Status: "PENDING_KEY",
        status: "AWAITING_SECOND_KEY",
        targetVaultLocation: "Showroom Display Safe 02",
        merkleProofHash: "SHA256:44b190a12cf9183428df1199321877ee12",
      },
      {
        id: "gov-req-03",
        requestCode: "GOV-REQ-03",
        actionTitle: "Induction Smelt Crucible #BB-044 Release",
        category: "Refining Smelt",
        grossWeightGrams: 103.7,
        valuationInr: 637867,
        keyholder1Name: "Dr. A. Joshi",
        keyholder1SignedAt: "15:44:30",
        keyholder2Name: "S. Joshi",
        keyholder2Status: "PENDING_KEY",
        status: "AWAITING_SECOND_KEY",
        targetVaultLocation: "Atelier Crucible Rack 01",
        merkleProofHash: "SHA256:88fa1290bb348123cc44991100df99321a",
      },
    ],
  },
  {
    id: "batch-gov-02",
    batchNumber: "GOV-2026-092",
    batchTitle: "Request #GOV-2026-092: Brinks Armored Fleet Dispatch Gate Pass",
    vaultSafeTag: "Armored Safe B6",
    thresholdCategory: "Transit Specie Release",
    status: "QUORUM_PENDING",
    items: [
      {
        id: "gov-req-04",
        requestCode: "GOV-REQ-04",
        actionTitle: "Armored Van #04 New Delhi Transit De-Seal",
        category: "Armored Transit",
        grossWeightGrams: 6391.45,
        valuationInr: 66552500,
        keyholder1Name: "Capt. Sengupta",
        keyholder1SignedAt: "15:46:11",
        keyholder2Name: "D. Singhania",
        keyholder2Status: "PENDING_KEY",
        status: "AWAITING_SECOND_KEY",
        targetVaultLocation: "Outward Armored Dispatch Gate 01",
        merkleProofHash: "SHA256:9f8a42110034bba9988123cc77441122aa",
      },
    ],
  },
  {
    id: "batch-gov-03",
    batchNumber: "GOV-2026-090",
    batchTitle: "Archive: Dual-Custody Morning Vault Unlock Cycle",
    vaultSafeTag: "Main Safe 01",
    thresholdCategory: "Morning Quorum Handover",
    status: "FULLY_APPROVED",
    items: [
      {
        id: "gov-req-05",
        requestCode: "GOV-REQ-05",
        actionTitle: "Morning Handover Solenoid Unlock Protocol",
        category: "Vault Access",
        grossWeightGrams: 84320.0,
        valuationInr: 684500000,
        keyholder1Name: "M. Nair",
        keyholder1SignedAt: "10:00:00",
        keyholder2Name: "S. Joshi",
        keyholder2Status: "SIGNED",
        status: "DUAL_SIGNED_RELEASED",
        targetVaultLocation: "Main Strongroom Double-Door",
        merkleProofHash: "SHA256:11bb99002233445566778899aabbccddeeff",
      },
    ],
  },
];

export default function GovernanceApprovalPage() {
  const [batches, setBatches] =
    useState<GovernanceBatchGroupData[]>(INITIAL_GOVERNANCE_BATCHES);
  const [selectedItem, setSelectedItem] = useState<GovernanceItemData | null>(
    INITIAL_GOVERNANCE_BATCHES[0].items[0]
  );
  const [selectedBatchTitle, setSelectedBatchTitle] = useState<string>(
    INITIAL_GOVERNANCE_BATCHES[0].batchTitle
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isDualSigningAll, setIsDualSigningAll] = useState(false);
  const [governanceNotification, setGovernanceNotification] = useState<
    string | null
  >(null);

  // Compute metrics
  const pendingApprovalsCount = batches.reduce(
    (acc, b) => acc + b.items.filter((i) => i.status === "AWAITING_SECOND_KEY").length,
    0
  );
  const auditLedgerStatus = "100% Verified";
  const complianceScore = "99.98% Pass";
  const discrepanciesCount = 0;

  // Filter logic
  const filteredBatches = batches.map((batch) => {
    let items = batch.items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.requestCode.toLowerCase().includes(q) ||
          i.actionTitle.toLowerCase().includes(q) ||
          i.keyholder1Name.toLowerCase().includes(q) ||
          i.targetVaultLocation.toLowerCase().includes(q)
      );
    }
    if (filterState === "VAULT") {
      items = items.filter((i) => i.category === "Vault Access");
    } else if (filterState === "POS") {
      items = items.filter((i) => i.category === "High-Value POS");
    } else if (filterState === "SMELT") {
      items = items.filter((i) => i.category === "Refining Smelt");
    } else if (filterState === "TRANSIT") {
      items = items.filter((i) => i.category === "Armored Transit");
    }
    return { ...batch, items };
  });

  const handleSelectItem = (
    item: GovernanceItemData,
    batch: GovernanceBatchGroupData
  ) => {
    setSelectedItem(item);
    setSelectedBatchTitle(batch.batchTitle);
  };

  const handleDualSignBatchAll = async () => {
    setIsDualSigningAll(true);
    setGovernanceNotification(
      "Signing Cryptographic SmartCard Token • Validating Biometric Quorum against HSM Keystore..."
    );

    await new Promise((res) => setTimeout(res, 1200));

    // Mark all pending as released
    setBatches((prev) =>
      prev.map((b) => ({
        ...b,
        status: "FULLY_APPROVED" as const,
        items: b.items.map((i) => ({
          ...i,
          keyholder2Status: "SIGNED" as const,
          status: "DUAL_SIGNED_RELEASED" as const,
        })),
      }))
    );
    setSelectedItem((prev) =>
      prev
        ? {
            ...prev,
            keyholder2Status: "SIGNED",
            status: "DUAL_SIGNED_RELEASED",
          }
        : null
    );

    setIsDualSigningAll(false);
    setGovernanceNotification(
      "All 4 Pending High-Security Approvals Dual-Signed! Vault Solenoid Relays Unlocked & Merkle Roots Chained."
    );
    setTimeout(() => setGovernanceNotification(null), 4000);
  };

  const handleAuthorizeSingleKey2 = (item: GovernanceItemData) => {
    setBatches((prev) =>
      prev.map((b) => ({
        ...b,
        items: b.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                keyholder2Status: "SIGNED" as const,
                status: "DUAL_SIGNED_RELEASED" as const,
              }
            : i
        ),
      }))
    );
    setSelectedItem((prev) =>
      prev ? { ...prev, keyholder2Status: "SIGNED", status: "DUAL_SIGNED_RELEASED" } : null
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, Telemetry & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-platinum/60">
              <span>JewelCore ERP</span>
              <span>/</span>
              <span>Security & Compliance</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Dual-Custody Audit & Governance Approval Center
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center space-x-3">
              <span>Multi-Signatory Quorum & Cryptographic Merkle Ledger</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HSM Cryptographic Key Card & Dual Biometric Scanner Synced • Zero Failures
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsOverrideModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-rose-950/20 border border-surface-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>+ Emergency Override Request</span>
            </button>

            <button
              onClick={handleDualSignBatchAll}
              disabled={isDualSigningAll || pendingApprovalsCount === 0}
              className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-obsidian text-xs font-bold font-mono shadow-lg shadow-gold/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Lock
                className={`w-4 h-4 text-obsidian ${
                  isDualSigningAll ? "animate-spin" : ""
                }`}
              />
              <span>
                {isDualSigningAll
                  ? "Signing Quorum Hardware..."
                  : `Dual-Sign & Release Pending (${pendingApprovalsCount})`}
              </span>
            </button>
          </div>
        </div>

        {/* Governance Notification Banner */}
        {governanceNotification && (
          <div className="p-3 rounded-xl bg-surface-card border border-gold/40 flex items-center justify-between text-xs font-mono text-gold animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>{governanceNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Merkle Root Block #89,120
            </span>
          </div>
        )}

        {/* 4 Metric KPI Cards matching Screen 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Pending Dual-Sign Approvals</span>
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {pendingApprovalsCount} Requests
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              High-Security Custody Holds
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Cryptographic Audit Ledger</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {auditLedgerStatus}
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              SHA-256 Merkle Root Chained
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Vault Compliance Score</span>
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {complianceScore}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">
              ISO 9001 & BIS Hallmarked
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm hover:border-gold/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-platinum/70 mb-1 font-mono">
              <span>Security Discrepancies</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {discrepanciesCount} Open Flags
            </div>
            <div className="text-[10px] text-platinum/60 font-mono mt-1">
              Real-Time Reconciled & Audited
            </div>
          </div>
        </div>

        {/* Master Workspace: 65% Directory + 35% Sticky Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (65% -> col-span-12 lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-platinum/50" />
                <input
                  type="text"
                  placeholder="Filter by Request ID, Custodian Name, Target Safe or Action Type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-slate-100 placeholder:text-platinum/40 focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono">
                <button
                  onClick={() => setFilterState("ALL")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "ALL"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  All Requests
                </button>
                <button
                  onClick={() => setFilterState("VAULT")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "VAULT"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Vault Access
                </button>
                <button
                  onClick={() => setFilterState("POS")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "POS"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  High-Value POS
                </button>
                <button
                  onClick={() => setFilterState("SMELT")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "SMELT"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Refining Smelt
                </button>
                <button
                  onClick={() => setFilterState("TRANSIT")}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filterState === "TRANSIT"
                      ? "bg-gold text-obsidian font-bold"
                      : "bg-surface-elevated text-platinum/70 hover:text-slate-100"
                  }`}
                >
                  Armored Transit
                </button>
              </div>
            </div>

            {/* Hierarchical Governance Batches & Item Matrix Grids */}
            <div className="space-y-4">
              {filteredBatches.map((batch, idx) => (
                <GovernanceSection
                  key={batch.id}
                  batch={batch}
                  defaultExpanded={idx === 0}
                  selectedItemId={selectedItem?.id}
                  onSelectItem={(item, b) => handleSelectItem(item, b)}
                />
              ))}

              {filteredBatches.every((b) => b.items.length === 0) && (
                <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-platinum/50">
                  <ShieldCheck className="w-10 h-10 mx-auto text-platinum/30 mb-2" />
                  <p className="text-sm font-medium text-slate-200">
                    No matching governance approval tickets found
                  </p>
                  <p className="text-xs text-platinum/60 mt-1">
                    Try adjusting your search criteria or review the audit archive.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35% -> col-span-12 lg:col-span-4) Sticky Inspector */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <GovernanceInspector
              item={selectedItem}
              parentBatchTitle={selectedBatchTitle}
              onClose={() => setSelectedItem(null)}
              onAuthorizeKey2={handleAuthorizeSingleKey2}
              onRejectRequest={(item) => {
                setBatches((prev) =>
                  prev.map((b) => ({
                    ...b,
                    items: b.items.map((i) =>
                      i.id === item.id
                        ? { ...i, status: "REJECTED_LOCKED" as const }
                        : i
                    ),
                  }))
                );
                setSelectedItem((prev) =>
                  prev ? { ...prev, status: "REJECTED_LOCKED" } : null
                );
              }}
            />
          </div>
        </div>

        {/* Modal for Emergency Safe Override */}
        <EmergencyOverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          onAuthorized={() => {
            setGovernanceNotification("Emergency Director Override Approved! Safe Solenoid Unlatched for 120s.");
            setTimeout(() => setGovernanceNotification(null), 4000);
          }}
        />
      </div>
    </AppShell>
  );
}
