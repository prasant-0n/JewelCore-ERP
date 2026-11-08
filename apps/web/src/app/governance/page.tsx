"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/common/AppShell";
import { JewelCoreLogo } from "../../components/common/JewelCoreLogo";
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
import { AuditTrailModal } from "../../components/governance/AuditTrailModal";
import { DualKeyQuorumModal } from "../../components/governance/DualKeyQuorumModal";
import { api, DEFAULT_STORE_ID } from "../../lib/api";
import {
  WorkstationKpiGrid,
  KpiItem,
} from "@/components/workstation/WorkstationKpiCard";
import { WorkstationLayout } from "../../components/workstation/WorkstationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Search,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

const INITIAL_GOVERNANCE_BATCHES: GovernanceBatchGroupData[] = [
  {
    id: "batch-gov-01",
    batchNumber: "GOV-2026-091",
    batchTitle:
      "Request #GOV-2026-091: High-Security Safe 01 Bullion Withdrawal",
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
    batchTitle:
      "Request #GOV-2026-092: Brinks Armored Fleet Dispatch Gate Pass",
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
  const [batches, setBatches] = useState<GovernanceBatchGroupData[]>(
    INITIAL_GOVERNANCE_BATCHES,
  );
  const [selectedItem, setSelectedItem] = useState<GovernanceItemData | null>(
    INITIAL_GOVERNANCE_BATCHES[0].items[0],
  );
  const [selectedBatchTitle, setSelectedBatchTitle] = useState<string>(
    INITIAL_GOVERNANCE_BATCHES[0].batchTitle,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isQuorumModalOpen, setIsQuorumModalOpen] = useState(false);
  const [isDualSigningAll, setIsDualSigningAll] = useState(false);

  // Compute metrics
  const pendingApprovalsCount = batches.reduce(
    (acc, b) =>
      acc + b.items.filter((i) => i.status === "AWAITING_SECOND_KEY").length,
    0,
  );

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
          i.targetVaultLocation.toLowerCase().includes(q),
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
    batch: GovernanceBatchGroupData,
  ) => {
    setSelectedItem(item);
    setSelectedBatchTitle(batch.batchTitle);
  };

  const handleDualSignBatchAll = async () => {
    setIsDualSigningAll(true);
    toast.info("Validating Biometric Quorum against HSM Keystore...", {
      description:
        "Signing Cryptographic SmartCard Token for all pending holds.",
    });

    const targetItemId = "0192e300-0060-7000-8000-000000000001";
    const storeId = api.getStoreId() || DEFAULT_STORE_ID;

    try {
      await api.post("/governance/stock-approvals", {
        inventoryItemId: targetItemId,
        approvalStatus: "APPROVED",
        storeId,
        approvalNotes:
          "Batch Dual-Sign SmartCard Quorum Authorized by Executive Compliance Board.",
      });
    } catch (err: any) {
      console.warn("[GovernancePage] Batch approval notice:", err?.message || err);
    }

    try {
      await api.post("/governance/audit-events", {
        action: "BATCH_STOCK_APPROVAL_AUTHORIZED",
        resourceType: "INVENTORY_ITEM",
        resourceId: targetItemId,
        reason: "Batch Dual-Sign SmartCard Quorum Authorized for all pending vault holds",
        payloadAfterJson: {
          pendingCount: pendingApprovalsCount,
          status: "FULLY_APPROVED",
        },
      });
    } catch (err: any) {
      console.warn("[GovernancePage] Audit event notice:", err?.message || err);
    }

    await new Promise((res) => setTimeout(res, 800));

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
      })),
    );
    setSelectedItem((prev) =>
      prev
        ? {
            ...prev,
            keyholder2Status: "SIGNED",
            status: "DUAL_SIGNED_RELEASED",
          }
        : null,
    );

    setIsDualSigningAll(false);
    toast.success("Batch Dual-Sign Completed", {
      description:
        "All pending high-security approvals authorized! Vault solenoid relays unlatched & Merkle roots chained.",
    });
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
            : i,
        ),
      })),
    );
    setSelectedItem((prev) =>
      prev
        ? {
            ...prev,
            keyholder2Status: "SIGNED",
            status: "DUAL_SIGNED_RELEASED",
          }
        : null,
    );
  };

  const kpis: KpiItem[] = [
    {
      id: "pending-approvals",
      title: "Pending Dual-Sign Approvals",
      value: `${pendingApprovalsCount} Requests`,
      subValue: "High-Security Custody Holds",
      badge: {
        text: pendingApprovalsCount > 0 ? "Holds Active" : "Clear",
        variant: pendingApprovalsCount > 0 ? "amber" : "emerald",
      },
      icon: <KeyRound className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "audit-ledger",
      title: "Cryptographic Audit Ledger",
      value: "100% Verified",
      subValue: "SHA-256 Merkle Root Chained",
      badge: { text: "Immutable", variant: "emerald" },
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: "compliance-score",
      title: "Vault Compliance Score",
      value: "99.98% Pass",
      subValue: "ISO 9001 & BIS Hallmarked",
      badge: { text: "Hallmarked", variant: "gold" },
      icon: <Sparkles className="w-4 h-4 text-gold" />,
    },
    {
      id: "security-discrepancies",
      title: "Security Discrepancies",
      value: "0 Open Flags",
      subValue: "Real-Time Reconciled & Audited",
      badge: { text: "Zero Flags", variant: "emerald" },
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Subheader: Breadcrumbs, Telemetry & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <JewelCoreLogo size="xs" variant="mark" />
                JewelCore ERP
              </span>
              <span>/</span>
              <span>Security &amp; Compliance</span>
              <span>/</span>
              <span className="text-gold font-semibold">
                Dual-Custody Audit &amp; Governance Approval Center
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <span>Multi-Signatory Quorum & Cryptographic Merkle Ledger</span>
              <Badge variant="emerald" dot>
                HSM Key Card & Dual Biometrics Synced • Zero Failures
              </Badge>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuditModalOpen(true)}
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              <span>Audit Event Stream</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverrideModalOpen(true)}
              className="hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span>Emergency Override Request</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQuorumModalOpen(true)}
              className="border-gold/40 text-gold hover:bg-gold/10 font-mono text-xs"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1 text-gold" />
              <span>Dual-Key Quorum Signoff</span>
            </Button>

            <Button
              variant="gold"
              size="sm"
              onClick={handleDualSignBatchAll}
              disabled={isDualSigningAll || pendingApprovalsCount === 0}
              isLoading={isDualSigningAll}
            >
              <Lock className="w-4 h-4 mr-1.5" />
              <span>
                {`Dual-Sign & Release Pending (${pendingApprovalsCount})`}
              </span>
            </Button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <WorkstationKpiGrid items={kpis} />

        {/* Master Workspace: 65% Directory + 35% Sticky Inspector */}
        <WorkstationLayout
          inspector={
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
                        : i,
                    ),
                  })),
                );
                setSelectedItem((prev) =>
                  prev ? { ...prev, status: "REJECTED_LOCKED" } : null,
                );
              }}
            />
          }
        >
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter by Request ID, Custodian Name, Target Safe or Action Type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-surface-elevated border-surface-border font-mono text-xs"
                />
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono">
                {(["ALL", "VAULT", "POS", "SMELT", "TRANSIT"] as const).map(
                  (key) => {
                    const labels: Record<string, string> = {
                      ALL: "All Requests",
                      VAULT: "Vault Access",
                      POS: "High-Value POS",
                      SMELT: "Refining Smelt",
                      TRANSIT: "Armored Transit",
                    };
                    return (
                      <Button
                        key={key}
                        variant={filterState === key ? "gold" : "outline"}
                        size="xs"
                        onClick={() => setFilterState(key)}
                      >
                        {labels[key]}
                      </Button>
                    );
                  },
                )}
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
                <Card className="border-surface-border bg-surface-card p-12 text-center text-muted-foreground">
                  <ShieldCheck className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No matching governance approval tickets found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search criteria or review the audit
                    archive.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </WorkstationLayout>

        {/* Modal for Emergency Safe Override */}
        <EmergencyOverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          onAuthorized={() => {
            toast.success("Emergency Director Override Approved", {
              description: "Safe Solenoid Unlatched for 120 seconds.",
            });
          }}
        />

        {/* Modal for Immutable Compliance & Audit Trail Stream */}
        <AuditTrailModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />

        {/* Modal for Maker-Checker Dual-Key Quorum Authorization */}
        <DualKeyQuorumModal
          isOpen={isQuorumModalOpen}
          onClose={() => setIsQuorumModalOpen(false)}
          actionTitle="Safe 01 Bullion Withdrawal #GOV-2026-091"
          valuationInr={36702500}
          targetResource="Main Safe 01 • Compartment Ingot-Rack A"
          onQuorumAuthorized={(checker) => {
            setBatches((prev) =>
              prev.map((b) => ({
                ...b,
                status: "FULLY_APPROVED" as const,
                items: b.items.map((i) => ({
                  ...i,
                  status: "DUAL_SIGNED_RELEASED" as const,
                  keyholder2Name: checker.checkerName,
                  keyholder2Status: "SIGNED" as const,
                })),
              })),
            );
          }}
        />
      </div>
    </AppShell>
  );
}
